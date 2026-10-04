import { MUSIC_NOTE_SECONDS, MUSIC_URL, MUSIC_VOLUME } from '../constants/config.js';

/**
 * Audio for the game.
 *
 * The background track is a real audio file (`MUSIC_URL`) played in a loop
 * through an <audio> element. If that file cannot be played — no Ogg Vorbis
 * support, a missing file, a blocked autoplay attempt — the engine falls back
 * to a melody synthesised with the Web Audio API, so the game is never silent
 * by accident.
 *
 * The short sound effects are always synthesised, which keeps the repository
 * free of extra assets.
 *
 * Browsers only allow audio after a user gesture, so nothing starts before the
 * first click or key press: `unlock()` is called from there.
 */

/** Fallback melody: a calm A-minor pentatonic loop, in hertz. */
const MELODY_HZ = [
    440.0, 523.25, 587.33, 659.25, 783.99, 659.25, 587.33, 523.25,
    440.0, 587.33, 659.25, 880.0, 783.99, 659.25, 587.33, 523.25,
];

/** One bass note every four melody steps: A2, F2, C3, G2. */
const BASS_HZ = [110.0, 87.31, 130.81, 98.0];

const LOOKAHEAD_INTERVAL_MS = 25;
const SCHEDULE_AHEAD_SECONDS = 0.3;
const FALLBACK_MUSIC_GAIN = 0.05;
const EFFECTS_GAIN = 0.14;

function getAudioContextConstructor() {
    if (typeof globalThis.AudioContext === 'function') {
        return globalThis.AudioContext;
    }
    if (typeof globalThis.webkitAudioContext === 'function') {
        return globalThis.webkitAudioContext;
    }
    return null;
}

export function createSoundEngine({ enabled = true, musicUrl = MUSIC_URL } = {}) {
    let context = null;
    let masterGain = null;
    let fallbackMusicGain = null;
    let effectsGain = null;

    let musicElement = null;
    let useSynthFallback = false;

    let schedulerId = null;
    let nextNoteTime = 0;
    let step = 0;

    let isEnabled = Boolean(enabled);
    let isUnlocked = false;

    /* ------------------------------------------------------------ web audio */

    function ensureGraph() {
        if (context) {
            return true;
        }

        const AudioContextClass = getAudioContextConstructor();
        if (!AudioContextClass) {
            return false;
        }

        context = new AudioContextClass();

        masterGain = context.createGain();
        masterGain.gain.value = isEnabled ? 1 : 0;
        masterGain.connect(context.destination);

        fallbackMusicGain = context.createGain();
        fallbackMusicGain.gain.value = FALLBACK_MUSIC_GAIN;
        fallbackMusicGain.connect(masterGain);

        effectsGain = context.createGain();
        effectsGain.gain.value = EFFECTS_GAIN;
        effectsGain.connect(masterGain);

        return true;
    }

    /** Schedules one short tone; every effect below is built from these. */
    function playTone({
        frequency,
        startTime,
        duration,
        type = 'sine',
        target = effectsGain,
        volume = 1,
        endFrequency = null,
    }) {
        if (!context || !isEnabled || !target) {
            return;
        }

        const oscillator = context.createOscillator();
        const envelope = context.createGain();

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, startTime);
        if (endFrequency !== null) {
            oscillator.frequency.exponentialRampToValueAtTime(endFrequency, startTime + duration);
        }

        // Exponential ramps cannot reach zero, hence the tiny floor value.
        envelope.gain.setValueAtTime(0.0001, startTime);
        envelope.gain.exponentialRampToValueAtTime(volume, startTime + 0.015);
        envelope.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

        oscillator.connect(envelope);
        envelope.connect(target);

        oscillator.start(startTime);
        oscillator.stop(startTime + duration + 0.02);
    }

    /* ------------------------------------------------------- background track */

    function ensureMusicElement() {
        if (musicElement) {
            return musicElement;
        }

        if (!musicUrl || typeof globalThis.Audio !== 'function') {
            return null;
        }

        musicElement = new globalThis.Audio();
        musicElement.src = musicUrl;
        musicElement.loop = true;
        musicElement.preload = 'auto';
        musicElement.volume = MUSIC_VOLUME;
        musicElement.addEventListener('error', fallBackToSynth);

        return musicElement;
    }

    /** Used when the music file is missing or the format is not supported. */
    function fallBackToSynth() {
        if (useSynthFallback) {
            return;
        }

        useSynthFallback = true;
        startSynthMusic();
    }

    function startMusic() {
        if (!isEnabled || !isUnlocked) {
            return;
        }

        if (!useSynthFallback) {
            const element = ensureMusicElement();

            if (element) {
                element.volume = MUSIC_VOLUME;

                const started = element.play();
                if (started && typeof started.catch === 'function') {
                    started.catch(fallBackToSynth);
                }
                return;
            }

            useSynthFallback = true;
        }

        startSynthMusic();
    }

    function stopMusic() {
        if (musicElement) {
            musicElement.pause();
        }
        stopSynthMusic();
    }

    /* -------------------------------------------------- synthesised fallback */

    function scheduleStep(index, time) {
        playTone({
            frequency: MELODY_HZ[index % MELODY_HZ.length],
            startTime: time,
            duration: MUSIC_NOTE_SECONDS * 0.9,
            type: 'triangle',
            target: fallbackMusicGain,
            volume: 0.5,
        });

        if (index % 4 === 0) {
            playTone({
                frequency: BASS_HZ[Math.floor(index / 4) % BASS_HZ.length],
                startTime: time,
                duration: MUSIC_NOTE_SECONDS * 3.4,
                type: 'sine',
                target: fallbackMusicGain,
                volume: 0.7,
            });
        }
    }

    function startSynthMusic() {
        if (!isEnabled || !isUnlocked || schedulerId !== null || !ensureGraph()) {
            return;
        }

        nextNoteTime = context.currentTime + 0.1;
        schedulerQueue();
        schedulerId = setInterval(schedulerQueue, LOOKAHEAD_INTERVAL_MS);
    }

    /** Keeps roughly 0.3 s of music queued, which avoids interval jitter. */
    function schedulerQueue() {
        if (!context) {
            return;
        }

        while (nextNoteTime < context.currentTime + SCHEDULE_AHEAD_SECONDS) {
            scheduleStep(step, nextNoteTime);
            step += 1;
            nextNoteTime += MUSIC_NOTE_SECONDS;
        }
    }

    function stopSynthMusic() {
        if (schedulerId !== null) {
            clearInterval(schedulerId);
            schedulerId = null;
        }
    }

    /* --------------------------------------------------------------- control */

    /** True when an effect may play; also unlocks audio on the first gesture. */
    function ready() {
        if (!isEnabled || !ensureGraph()) {
            return false;
        }
        if (!isUnlocked) {
            unlock();
        }
        return true;
    }

    /**
     * Creates and resumes the audio context and starts the background music.
     * Must run inside a user gesture, otherwise the browser blocks the sound.
     */
    function unlock() {
        if (!isEnabled) {
            return;
        }

        ensureGraph();
        isUnlocked = true;

        if (context && context.state === 'suspended') {
            context.resume();
        }

        startMusic();
    }

    function setEnabled(value) {
        isEnabled = Boolean(value);

        if (masterGain) {
            masterGain.gain.value = isEnabled ? 1 : 0;
        }

        if (isEnabled) {
            unlock();
        } else {
            stopMusic();
        }
    }

    /* --------------------------------------------------------------- effects */

    function playFlip() {
        if (!ready()) return;
        const now = context.currentTime;
        playTone({
            frequency: 520,
            endFrequency: 780,
            startTime: now,
            duration: 0.09,
            type: 'triangle',
            volume: 0.5,
        });
    }

    function playMatch() {
        if (!ready()) return;
        const now = context.currentTime;
        playTone({ frequency: 659.25, startTime: now, duration: 0.12, volume: 0.6 });
        playTone({ frequency: 987.77, startTime: now + 0.1, duration: 0.2, volume: 0.6 });
    }

    function playMismatch() {
        if (!ready()) return;
        const now = context.currentTime;
        playTone({
            frequency: 220,
            endFrequency: 150,
            startTime: now,
            duration: 0.22,
            type: 'sawtooth',
            volume: 0.35,
        });
    }

    function playWin() {
        if (!ready()) return;
        const now = context.currentTime;
        [523.25, 659.25, 783.99, 1046.5].forEach((frequency, index) => {
            playTone({
                frequency,
                startTime: now + index * 0.12,
                duration: 0.3,
                type: 'triangle',
                volume: 0.6,
            });
        });
    }

    /** Stops the music and releases the audio resources. */
    function dispose() {
        stopMusic();

        if (musicElement) {
            musicElement.removeEventListener('error', fallBackToSynth);
            musicElement = null;
        }

        if (context) {
            context.close();
            context = null;
        }

        isUnlocked = false;
    }

    return {
        unlock,
        dispose,
        setEnabled,
        isEnabled: () => isEnabled,
        playFlip,
        playMatch,
        playMismatch,
        playWin,
    };
}
