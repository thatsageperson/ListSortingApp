import { useState, useEffect, useRef, useCallback } from "react";

const SpeechRecognition =
  typeof window !== "undefined"
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

/**
 * Voice input hook using the browser Web Speech API.
 * Provides real-time streaming transcription with no dependencies.
 *
 * @param {{ onTranscript: (text: string) => void }} options
 */
export function useVoiceInput({ onTranscript }) {
  const isSupported = !!SpeechRecognition;

  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);

  const recognitionRef = useRef(null);
  const timeoutRef = useRef(null);
  const transcriptRef = useRef("");
  const onTranscriptRef = useRef(onTranscript);

  // Keep callback ref fresh without re-creating start/stop functions
  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  const startListening = useCallback(() => {
    if (!isSupported || isListening) return;
    setError(null);
    transcriptRef.current = "";

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      // Store latest transcript for use when stopping
      const current = finalTranscript || interimTranscript;
      transcriptRef.current = current;

      // Stream interim results directly to the parent via onTranscript
      if (current) {
        onTranscriptRef.current(current);
      }
    };

    recognition.onerror = (event) => {
      if (event.error === "not-allowed" || event.error === "permission-denied") {
        setError("Microphone access denied. Please allow microphone permission and try again.");
      } else if (event.error === "no-speech") {
        setError("No speech detected. Please try again.");
      } else if (event.error === "network") {
        setError("Network error. Speech recognition requires an internet connection.");
      } else if (event.error !== "aborted") {
        setError(`Voice input error: ${event.error}`);
      }
      setIsListening(false);
      clearTimeout(timeoutRef.current);
    };

    recognition.onend = () => {
      setIsListening(false);
      clearTimeout(timeoutRef.current);
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
      setIsListening(true);

      // 60-second max recording timeout
      timeoutRef.current = setTimeout(() => {
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
      }, 60000);
    } catch {
      setError("Failed to start voice input. Please try again.");
    }
  }, [isSupported, isListening]);

  const stopListening = useCallback(() => {
    clearTimeout(timeoutRef.current);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const cancelListening = useCallback(() => {
    clearTimeout(timeoutRef.current);
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }
    transcriptRef.current = "";
    setIsListening(false);
    setError(null);
    // Clear the textarea by sending empty string
    onTranscriptRef.current("");
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current);
      if (recognitionRef.current) {
        recognitionRef.current.abort();
        recognitionRef.current = null;
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
    isTranscribing: false, // Web Speech API transcribes in real-time
  };
}
