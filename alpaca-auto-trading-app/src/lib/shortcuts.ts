export const combos = {
  slash: '/',
  escape: 'Escape',
  enter: 'Enter',
  space: ' ',
  backspace: 'Backspace',
  delete: 'Delete',
  arrowUp: 'ArrowUp',
  arrowDown: 'ArrowDown',
  arrowLeft: 'ArrowLeft',
  arrowRight: 'ArrowRight',
} as const;

export function onKey(element: Document | Element, key: string, handler: () => void) {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === key) {
      e.preventDefault();
      handler();
    }
  };
  
  element.addEventListener('keydown', handleKeyDown);
  
  return () => element.removeEventListener('keydown', handleKeyDown);
}