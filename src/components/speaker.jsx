import { useEffect, useRef } from 'react';

const useSpeaker = () => {
  const utteranceRef = useRef(null);
  const countRef = useRef(0);

  useEffect(() => {
    utteranceRef.current = new SpeechSynthesisUtterance();
    return () => {
      if (utteranceRef.current && speechSynthesis.speaking) {
        speechSynthesis.cancel();
      }
    };
  }, []);

  const greeting = (text, times = 2) => {
    const synth = window.speechSynthesis;
    countRef.current = 0;
    utteranceRef.current.text = text;
    utteranceRef.current.lang = 'id-ID';

    const speakHandler = () => {
      countRef.current++;
      if (countRef.current < times) {
        synth.speak(utteranceRef.current);
      }
    };

    synth.cancel();
    synth.speak(utteranceRef.current);
    utteranceRef.current.onend = speakHandler;
  };

  return { greeting };
};

export default useSpeaker;
