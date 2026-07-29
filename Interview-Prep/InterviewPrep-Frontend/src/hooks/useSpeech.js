import { useCallback, useEffect, useRef, useState } from "react";

/**
 * useSpeech — thin wrapper around the browser's SpeechSynthesis API so the AI
 * interviewer can read questions aloud.
 *
 * Returns:
 *   supported     — whether the browser can speak (SpeechSynthesis available)
 *   enabled       — user's on/off preference (persisted to localStorage)
 *   toggleEnabled — flip the preference; cancels any in-flight speech when muting
 *   speaking      — true while an utterance is being spoken
 *   speak(text)   — speak text (no-op if unsupported or disabled)
 *   cancel()      — stop any current/queued speech
 *
 * Notes:
 * - Chrome loads voices asynchronously; we listen for `voiceschanged` and pick a
 *   natural English voice when one is available.
 * - Speech is cancelled on unmount so questions don't keep talking after navigation.
 */

const STORAGE_KEY = "interviewVoiceEnabled";

const getSynth = () =>
    typeof window !== "undefined" && "speechSynthesis" in window
        ? window.speechSynthesis
        : null;

export default function useSpeech() {
    const synth = getSynth();
    const supported = Boolean(synth);

    // Default voice ON when supported; respect a stored preference if present.
    const [enabled, setEnabled] = useState(() => {
        if (typeof window === "undefined") return false;
        const stored = window.localStorage.getItem(STORAGE_KEY);
        return stored === null ? true : stored === "true";
    });
    const [speaking, setSpeaking] = useState(false);

    const voiceRef = useRef(null);

    // Pick the best available English voice once the list is populated.
    useEffect(() => {
        if (!synth) return;

        const pickVoice = () => {
            const voices = synth.getVoices();
            if (!voices.length) return;
            voiceRef.current =
                voices.find((v) => /en(-|_)?(US|IN|GB)/i.test(v.lang) && /female|natural|google|samantha|aria|zira/i.test(v.name)) ||
                voices.find((v) => /^en/i.test(v.lang)) ||
                voices[0];
        };

        pickVoice();
        synth.addEventListener?.("voiceschanged", pickVoice);
        return () => synth.removeEventListener?.("voiceschanged", pickVoice);
    }, [synth]);

    const cancel = useCallback(() => {
        if (!synth) return;
        synth.cancel();
        setSpeaking(false);
    }, [synth]);

    const speak = useCallback(
        (text) => {
            if (!synth || !enabled || !text) return;
            // Interrupt anything currently speaking so questions don't overlap.
            synth.cancel();

            const utterance = new window.SpeechSynthesisUtterance(text);
            if (voiceRef.current) utterance.voice = voiceRef.current;
            utterance.rate = 1;
            utterance.pitch = 1;
            utterance.lang = voiceRef.current?.lang || "en-US";
            utterance.onstart = () => setSpeaking(true);
            utterance.onend = () => setSpeaking(false);
            utterance.onerror = () => setSpeaking(false);

            synth.speak(utterance);
        },
        [synth, enabled]
    );

    const toggleEnabled = useCallback(() => {
        setEnabled((prev) => {
            const next = !prev;
            if (typeof window !== "undefined") {
                window.localStorage.setItem(STORAGE_KEY, String(next));
            }
            if (!next && synth) {
                // Muting: stop talking immediately.
                synth.cancel();
                setSpeaking(false);
            }
            return next;
        });
    }, [synth]);

    // Stop speech if the component using the hook unmounts.
    useEffect(() => cancel, [cancel]);

    return { supported, enabled, toggleEnabled, speaking, speak, cancel };
}
