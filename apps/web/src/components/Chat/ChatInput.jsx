import { useCallback, useRef } from "react";
import { Navigation, Loader2, Mic, Square, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useVoiceInput } from "@/hooks/useVoiceInput";

/**
 * Text input and send button for the chat. Supports Enter to send,
 * voice input via Web Speech API, and shows a loading state while sending.
 */
export function ChatInput({ message, setMessage, onSend, isPending }) {
  // Track what was in the textarea before voice input started
  const preVoiceMessageRef = useRef("");

  const onTranscript = useCallback(
    (text) => {
      if (text) {
        const prefix = preVoiceMessageRef.current;
        setMessage(prefix ? `${prefix} ${text}` : text);
      } else {
        // Cancelled — restore pre-voice text
        setMessage(preVoiceMessageRef.current);
      }
    },
    [setMessage],
  );

  const {
    isListening,
    isSupported,
    error,
    startListening: rawStart,
    stopListening,
    cancelListening,
    isTranscribing,
  } = useVoiceInput({ onTranscript });

  const startListening = useCallback(() => {
    preVoiceMessageRef.current = message;
    rawStart();
  }, [message, rawStart]);

  return (
    <div className="px-6 py-6 lg:px-12 lg:pb-12 bg-gradient-to-t from-cream dark:from-slate-bg to-transparent">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-slate-surface border border-gray-200 dark:border-slate-700 rounded-[32px] p-2 shadow-xl shadow-black/5 flex items-end">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={
              isListening
                ? "Listening..."
                : "Milk, eggs, finish report, call Sarah..."
            }
            className="flex-1 bg-transparent border-none outline-none resize-none px-6 py-4 text-lg text-charcoal dark:text-white placeholder-gray-400"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
          />

          {/* Voice input button — only shown when browser supports Web Speech API */}
          {isSupported && (
            <div className="relative mb-2 mr-1">
              {/* Pulsing ring animation while listening */}
              <AnimatePresence>
                {isListening && (
                  <motion.div
                    className="absolute inset-0 rounded-2xl bg-red-400"
                    initial={{ scale: 1, opacity: 0.5 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      ease: "easeOut",
                    }}
                  />
                )}
              </AnimatePresence>

              <button
                onClick={isListening ? stopListening : startListening}
                disabled={isPending}
                className={`relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 ${
                  isListening ? "bg-red-500" : "bg-teal-700"
                }`}
                aria-label={isListening ? "Stop recording" : "Start voice input"}
              >
                {isListening ? (
                  <Square size={18} fill="currentColor" />
                ) : (
                  <Mic size={20} />
                )}
              </button>

              {/* Cancel button appears while listening */}
              <AnimatePresence>
                {isListening && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    onClick={cancelListening}
                    className="absolute -top-2 -right-2 z-20 w-5 h-5 bg-gray-500 rounded-full flex items-center justify-center text-white hover:bg-gray-600"
                    aria-label="Cancel recording"
                  >
                    <X size={12} />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Send button */}
          <button
            onClick={onSend}
            disabled={!message.trim() || isPending}
            className="mb-2 mr-2 w-12 h-12 bg-orange-sunset rounded-2xl flex items-center justify-center text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100"
          >
            {isPending ? (
              <Loader2 className="animate-spin text-white" size={20} />
            ) : (
              <Navigation size={20} color="white" className="rotate-45" />
            )}
          </button>
        </div>

        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="text-[11px] text-center text-red-500 mt-2"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <p className="text-[10px] text-center text-gray-500 mt-4">
          jot. AI can make mistakes. Check important info.
        </p>
      </div>
    </div>
  );
}
