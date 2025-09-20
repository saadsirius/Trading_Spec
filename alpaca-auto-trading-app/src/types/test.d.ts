/**
 * File: src/types/test.d.ts
 * Description: Test-related type declarations.
 */
declare module '*.test.ts' {
  const content: any;
  export default content;
}

declare module '*.test.tsx' {
  const content: any;
  export default content;
}

declare module '*.spec.ts' {
  const content: any;
  export default content;
}

declare module '*.spec.tsx' {
  const content: any;
  export default content;
}

// Mock types for testing
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveClass(className: string): R;
      toHaveAttribute(attr: string, value?: string): R;
      toHaveTextContent(text: string): R;
    }
  }
}
