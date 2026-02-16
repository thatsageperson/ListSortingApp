import { useRef, useCallback, useEffect, useMemo } from "react";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import { useSettings } from "@/hooks/useSettings";

/**
 * Generates a tiny WAV buffer containing a short sine-wave "ding".
 * Returns a base64 data URI playable by expo-av.
 */
function generateDingDataUri() {
  const sampleRate = 22050;
  const duration = 0.3;
  const numSamples = Math.floor(sampleRate * duration);
  const numChannels = 1;
  const bitsPerSample = 16;

  // WAV file size calculations
  const dataSize = numSamples * numChannels * (bitsPerSample / 8);
  const fileSize = 44 + dataSize;

  const buffer = new ArrayBuffer(fileSize);
  const view = new DataView(buffer);

  // WAV header
  const writeString = (offset, str) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, "RIFF");
  view.setUint32(4, fileSize - 8, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true); // fmt chunk size
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * (bitsPerSample / 8), true);
  view.setUint16(32, numChannels * (bitsPerSample / 8), true);
  view.setUint16(34, bitsPerSample, true);
  writeString(36, "data");
  view.setUint32(40, dataSize, true);

  // Generate sine wave rising from 880Hz to 1760Hz with exponential decay
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const progress = t / duration;

    // Frequency sweep: 880 → 1760 Hz
    const freq = 880 * Math.pow(2, progress);
    // Exponential amplitude decay
    const amplitude = 0.4 * Math.exp(-8 * t);
    // Sine wave sample
    const sample = amplitude * Math.sin(2 * Math.PI * freq * t);

    const intSample = Math.max(
      -32768,
      Math.min(32767, Math.round(sample * 32767)),
    );
    view.setInt16(44 + i * 2, intSample, true);
  }

  // Convert to base64
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  return `data:audio/wav;base64,${base64}`;
}

/**
 * Hook for completion sound, animation settings, and haptic feedback.
 * Uses expo-av for sound and expo-haptics for tactile feedback.
 */
export function useCompletionEffects() {
  const { settings } = useSettings();
  const soundRef = useRef(null);
  const dingUriRef = useRef(null);

  const animationEnabled = settings.completionAnimation !== false;

  // Generate the ding data URI once
  useEffect(() => {
    if (!dingUriRef.current) {
      dingUriRef.current = generateDingDataUri();
    }
  }, []);

  // Cleanup sound on unmount
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => {});
        soundRef.current = null;
      }
    };
  }, []);

  const playSound = useCallback(async () => {
    try {
      // Unload previous sound if it exists
      if (soundRef.current) {
        await soundRef.current.unloadAsync().catch(() => {});
        soundRef.current = null;
      }

      if (!dingUriRef.current) return;

      const { sound } = await Audio.Sound.createAsync(
        { uri: dingUriRef.current },
        { shouldPlay: true },
      );
      soundRef.current = sound;

      // Auto-unload when playback finishes
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          sound.unloadAsync().catch(() => {});
          if (soundRef.current === sound) {
            soundRef.current = null;
          }
        }
      });
    } catch {
      // Audio not available — fail silently
    }
  }, []);

  const triggerCompletion = useCallback(() => {
    if (settings.completionSound !== false) {
      playSound();
    }
    if (settings.completionHaptics !== false) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
  }, [settings.completionSound, settings.completionHaptics, playSound]);

  return useMemo(
    () => ({ triggerCompletion, animationEnabled }),
    [triggerCompletion, animationEnabled],
  );
}
