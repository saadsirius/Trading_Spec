'use client';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [dark, setDark] = useState<boolean>(false);
  useEffect(() => {
    const pref = localStorage.getItem('theme') ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const isDark = pref === 'dark';
    setDark(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);
  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  }
  return (
    <button
      onClick={toggle}
      aria-label="Basculer thème"
      className="rounded-md border px-2 py-1 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
      title={dark ? 'Mode sombre' : 'Mode clair'}
    >
      {dark ? '🌙' : '☀️'}
    </button>
  );
}
