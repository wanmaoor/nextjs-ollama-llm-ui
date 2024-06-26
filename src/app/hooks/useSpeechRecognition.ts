import { useState, useRef, useEffect } from "react";

interface SpeechRecognitionOptions {
  interimResults?: boolean;
  lang?: string;
  continuous?: boolean;
}

const useSpeechToText = (options: SpeechRecognitionOptions = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) {
      console.error("Web Speech API is not supported");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognitionRef.current = recognition;

    recognition.interimResults = options.interimResults || true;
    recognition.lang = options.lang || "en-US";
    recognition.continuous = options.continuous || false;
    const hasSpeechGrammarList = "webkitSpeechGrammarList" in window;
    console.info('🚀🚀', 'hasSpeechGrammarList -->', hasSpeechGrammarList, `<-- useSpeechRecognition.ts/`)
    if (hasSpeechGrammarList) {
      const grammar =
        "#JSGF V1.0; grammar punctuation; public <punc> = . | , | ! | ; | : ;";
      const speechRecognitionList = new window.webkitSpeechGrammarList();
      speechRecognitionList.addFromString(grammar, 1);
      recognition.grammars = speechRecognitionList;
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let text = "";
      console.info('🚀🚀', 'event -->', event, `<-- useSpeechRecognition.ts/onresult`)

      for (let i = 0; i < event.results.length; i++) {
        text += event.results[i][0].transcript;
      }

      // Always capitalize the first letter
      setTranscript(text.charAt(0).toUpperCase() + text.slice(1));
    };

    recognition.onerror = (event) => {
      console.error(event.error);
    };

    recognition.onend = () => {
      setIsListening(false);
      setTranscript("");
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    console.info('🚀🚀', 'recognitionRef.current -->', recognitionRef.current?.stop, `<-- useSpeechRecognition.ts/stopListening`)
    console.info('🚀🚀', 'isListening -->', isListening, `<-- useSpeechRecognition.ts/stopListening`)
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
  };
};

export default useSpeechToText;
