import { useState, useEffect, useRef } from 'react';

// Extend the Window interface to include webkit prefix
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

interface UseSpeechToTextReturn {
  transcript: string;
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
  error: string | null;
  resetTranscript: () => void;
}

/**
 * Custom React hook to handle the browser's Web Speech API for voice input.
 * 
 * @returns Object containing transcript, listening state, and control functions
 * 
 * @example
 * const { transcript, isListening, startListening, stopListening } = useSpeechToText();
 * 
 * <button onClick={isListening ? stopListening : startListening}>
 *   {isListening ? 'Stop' : 'Start'} Recording
 * </button>
 * <p>{transcript}</p>
 */
export function useSpeechToText(): UseSpeechToTextReturn {
  const [transcript, setTranscript] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if the SpeechRecognition API is available
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError('Speech Recognition API is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    // Initialize SpeechRecognition object
    const recognition = new SpeechRecognition();
    recognition.continuous = true; // Keep listening until explicitly stopped
    recognition.interimResults = true; // Get interim results while speaking
    recognition.lang = 'en-US'; // Set language

    // Handle the result event
    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      // Process all results
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPiece = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          finalTranscript += transcriptPiece + ' ';
        } else {
          interimTranscript += transcriptPiece;
        }
      }

      // Update transcript state with final or interim results
      setTranscript((prev) => {
        if (finalTranscript) {
          return prev + finalTranscript;
        }
        return prev + interimTranscript;
      });
    };

    // Handle errors
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setError(`Error: ${event.error}`);
      setIsListening(false);
    };

    // Handle when recognition ends
    recognition.onend = () => {
      setIsListening(false);
    };

    // Handle when recognition starts
    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognitionRef.current = recognition;

    // Cleanup on unmount
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Start listening function
  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setError(null);
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error('Error starting recognition:', err);
        setError('Failed to start speech recognition');
      }
    }
  };

  // Stop listening function
  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  // Reset transcript function
  const resetTranscript = () => {
    setTranscript('');
  };

  return {
    transcript,
    isListening,
    startListening,
    stopListening,
    error,
    resetTranscript,
  };
}
