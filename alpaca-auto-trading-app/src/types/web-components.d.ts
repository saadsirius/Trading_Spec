/**
 * File: src/types/web-components.d.ts
 * Description: Type declarations for custom Web Components.
 */
declare namespace JSX {
  interface IntrinsicElements {
    'ai-sparkline': {
      data?: string;
      width?: number;
      height?: number;
      color?: string;
      className?: string;
      style?: React.CSSProperties;
    };
  }
}
