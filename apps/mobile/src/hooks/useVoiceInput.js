import { useState, useEffect, useRef, useCallback } from "react";
import { Audio } from "expo-av";
import { API_BASE_URL } from "../utils/api";

/**
 * Voice input hook using expo-av for recording and OpenAI Whisper for transcription.
 *
 * @param {{ onTranscript: (text: string) => void }} options
 */
export function useVoiceInput({ onTranscript }) {
  const isSupported = true; // Always available on iOS/Android

  const [isListening, setIsListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState(null);

  const recordingRef = useRef(null);
  const timeoutRef = useRef(null);
  const onTranscriptRef = useRef(onTranscript);

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  const startListening = useCallback(async () => {
    if (isListening || isTranscribing) return;
    setError(null);

    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") {
        setError(
          "Microphone access denied. Please allow microphone permission in your device Settings.",
        );
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );
      await recording.startAsync();

      recordingRef.current = recording;
      setIsListening(true);

      // 60-second max recording timeout
      timeoutRef.current = setTimeout(() => {
        stopListening();
      }, 60000);
    } catch (err) {
      console.error("Failed to start recording:", err);
      setError("Failed to start recording. Please try again.");
      setIsListening(false);
    }
  }, [isListening, isTranscribing]);

  const stopListening = useCallback(async () => {
    clearTimeout(timeoutRef.current);
    const recording = recordingRef.current;
    if (!recording) return;

    recordingRef.current = null;
    setIsListening(false);
    setIsTranscribing(true);

    try {
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });

      const uri = recording.getURI();
      if (!uri) {
        setError("Recording failed. No audio was captured.");
        setIsTranscribing(false);
        return;
      }

      // Upload to transcription endpoint
      const formData = new FormData();
      formData.append("audio", {
        uri,
        type: "audio/m4a",
        name: "recording.m4a",
      });

      const res = await fetch(`${API_BASE_URL}/api/transcribe`, {
        method: "POST",
        body: formData,
        // Do NOT set Content-Type — fetch auto-sets multipart boundary
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Transcription failed");
      }

      if (data.text) {
        onTranscriptRef.current(data.text);
      } else {
        setError("No speech was detected. Please try again.");
      }
    } catch (err) {
      console.error("Transcription error:", err);
      setError("Transcription failed. Please check your connection and try again.");
    } finally {
      setIsTranscribing(false);
    }
  }, []);

  const cancelListening = useCallback(async () => {
    clearTimeout(timeoutRef.current);
    const recording = recordingRef.current;
    if (recording) {
      recordingRef.current = null;
      try {
        await recording.stopAndUnloadAsync();
        await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      } catch {
        // Ignore cleanup errors
      }
    }
    setIsListening(false);
    setIsTranscribing(false);
    setError(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current);
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(() => {});
      }
    };
  }, []);

  return {
    isListening,
    isSupported,
    error,
    startListening,
    stopListening,
    cancelListening,
    isTranscribing,
  };
}
