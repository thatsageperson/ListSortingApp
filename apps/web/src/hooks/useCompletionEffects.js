import { useRef, useCallback, useMemo } from "react";
import { useSettings } from "@/hooks/useSettings";

/**
 * Synthesizes a short, pleasant "ding" via Web Audio API.
 * Sine wave rising from A5 (880Hz) to A6 (1760Hz) with a 300ms exponential decay.
 */
function playDing(audioCtx) {
  const oscillator = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  oscillator.connect(gain);
  gain.connect(audioCtx.destination);

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(
    1760,
    audioCtx.currentTime + 0.08,
  );

  gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);

  oscillator.start(audioCtx.currentTime);
  oscillator.stop(audioCtx.currentTime + 0.3);
}

/**
 * Hook for completion sound + animation settings.
 * Uses Web Audio API for sound (no files, no dependencies).
 * Respects prefers-reduced-motion and user settings.
 */
export function useCompletionEffects() {
  const { settings } = useSettings();
  const audioCtxRef = useRef(null);

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const animationEnabled =
    settings.completionAnimation !== false && !prefersReducedMotion;

  const triggerCompletion = useCallback(() => {
    // Play sound if enabled
    if (settings.completionSound !== false) {
      try {
        if (!audioCtxRef.current) {
          audioCtxRef.current = new (window.AudioContext ||
            window.webkitAudioContext)();
        }
        // Resume if suspended (browser autoplay policy)
        if (audioCtxRef.current.state === "suspended") {
          audioCtxRef.current.resume();
        }
        playDing(audioCtxRef.current);
      } catch {
        // Audio not available — fail silently
      }
    }
  }, [settings.completionSound]);

  return useMemo(
    () => ({ triggerCompletion, animationEnabled }),
    [triggerCompletion, animationEnabled],
  );
}
