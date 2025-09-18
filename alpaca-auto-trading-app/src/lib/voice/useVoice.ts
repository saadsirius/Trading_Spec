'use client';
import { useCallback, useEffect, useRef, useState } from 'react';

export function useVoice() {
  const recRef = useRef<any>(null);
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [text, setText] = useState('');

  useEffect(() => {
    const R = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (R) { setSupported(true); recRef.current = new R(); recRef.current.lang = 'fr-FR'; recRef.current.interimResults = true; }
  }, []);

  const start = useCallback(() => {
    if (!recRef.current) return;
    setListening(true);
    recRef.current.onresult = (e: any) => {
      let t = '';
      for (let i=0;i<e.results.length;i++) t += e.results[i][0].transcript;
      setText(t);
    };
    recRef.current.onend = () => setListening(false);
    recRef.current.start();
  }, []);

  const stop = useCallback(() => { try { recRef.current?.stop(); } catch {} }, []);
  return { supported, listening, text, start, stop, setText };
}
