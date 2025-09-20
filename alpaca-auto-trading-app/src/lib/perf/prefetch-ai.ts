/**
 * File: src/lib/perf/prefetch-ai.ts
 * Description: AI-powered prefetch tracking and management.
 */
'use client';

interface PrefetchOptions {
  delay?: number;
  priority?: 'high' | 'low';
  onPrefetch?: (url: string) => void;
}

class PrefetchTracker {
  private trackedElements = new WeakMap<Element, () => void>();
  private prefetchCache = new Set<string>();

  trackLink(element: HTMLAnchorElement, options: PrefetchOptions = {}): () => void {
    const { delay = 300, priority = 'low', onPrefetch } = options;
    
    let timeoutId: number | null = null;
    let hasPrefetched = false;

    const handleMouseEnter = () => {
      if (hasPrefetched) return;
      
      timeoutId = window.setTimeout(() => {
        const href = element.href;
        if (href && !this.prefetchCache.has(href)) {
          this.prefetchLink(href, priority);
          this.prefetchCache.add(href);
          hasPrefetched = true;
          onPrefetch?.(href);
        }
      }, delay);
    };

    const handleMouseLeave = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    };

    const handleClick = () => {
      // Cancel prefetch on click since navigation is happening
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    };

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);
    element.addEventListener('click', handleClick);

    const cleanup = () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
      element.removeEventListener('click', handleClick);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };

    this.trackedElements.set(element, cleanup);
    return cleanup;
  }

  private prefetchLink(url: string, priority: 'high' | 'low') {
    try {
      // Use link prefetch for better performance
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      if (priority === 'high') {
        link.setAttribute('fetchpriority', 'high');
      }
      document.head.appendChild(link);

      // Also prefetch the data if it's a Next.js route
      if (url.startsWith('/') && !url.startsWith('//')) {
        const dataUrl = `/_next/data/${url}`;
        const dataLink = document.createElement('link');
        dataLink.rel = 'prefetch';
        dataLink.href = dataUrl;
        document.head.appendChild(dataLink);
      }
    } catch (error) {
      console.warn('Prefetch failed:', error);
    }
  }

  clearCache() {
    this.prefetchCache.clear();
  }
}

// Singleton instance
const prefetchTracker = new PrefetchTracker();

export function trackLink(element: HTMLAnchorElement, options?: PrefetchOptions) {
  return prefetchTracker.trackLink(element, options);
}

export function clearPrefetchCache() {
  prefetchTracker.clearCache();
}

export default prefetchTracker;