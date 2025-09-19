interface PrefetchOptions {
  priority?: 'high' | 'low';
  timeout?: number;
  retries?: number;
}

interface PrefetchItem {
  url: string;
  type: 'script' | 'style' | 'image' | 'fetch';
  priority: 'high' | 'low';
  loaded: boolean;
  timestamp: number;
}

class PrefetchManager {
  private items: Map<string, PrefetchItem> = new Map();
  private observers: Map<string, IntersectionObserver> = new Map();
  private isEnabled: boolean = true;

  constructor() {
    if (typeof window !== 'undefined') {
      this.setupVisibilityChange();
    }
  }

  private setupVisibilityChange() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pausePrefetching();
      } else {
        this.resumePrefetching();
      }
    });
  }

  private pausePrefetching() {
    this.isEnabled = false;
  }

  private resumePrefetching() {
    this.isEnabled = true;
  }

  public prefetch(url: string, type: 'script' | 'style' | 'image' | 'fetch' = 'fetch', options: PrefetchOptions = {}) {
    if (!this.isEnabled || typeof window === 'undefined') return;

    const key = `${type}:${url}`;
    if (this.items.has(key)) return;

    const item: PrefetchItem = {
      url,
      type,
      priority: options.priority || 'low',
      loaded: false,
      timestamp: Date.now()
    };

    this.items.set(key, item);

    // Use requestIdleCallback for low priority, immediate for high priority
    if (item.priority === 'high') {
      this.executePrefetch(item);
    } else {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => this.executePrefetch(item));
      } else {
        setTimeout(() => this.executePrefetch(item), 100);
      }
    }
  }

  private async executePrefetch(item: PrefetchItem) {
    if (!this.isEnabled) return;

    try {
      switch (item.type) {
        case 'script':
          await this.prefetchScript(item.url);
          break;
        case 'style':
          await this.prefetchStyle(item.url);
          break;
        case 'image':
          await this.prefetchImage(item.url);
          break;
        case 'fetch':
          await this.prefetchFetch(item.url);
          break;
      }
      
      item.loaded = true;
    } catch (error) {
      console.warn(`Failed to prefetch ${item.type}: ${item.url}`, error);
    }
  }

  private prefetchScript(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.as = 'script';
      link.href = url;
      link.onload = () => resolve();
      link.onerror = () => reject(new Error(`Failed to prefetch script: ${url}`));
      document.head.appendChild(link);
    });
  }

  private prefetchStyle(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.as = 'style';
      link.href = url;
      link.onload = () => resolve();
      link.onerror = () => reject(new Error(`Failed to prefetch style: ${url}`));
      document.head.appendChild(link);
    });
  }

  private prefetchImage(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject(new Error(`Failed to prefetch image: ${url}`));
      img.src = url;
    });
  }

  private async prefetchFetch(url: string): Promise<void> {
    const response = await fetch(url, {
      method: 'GET',
      cache: 'force-cache'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to prefetch fetch: ${url} - ${response.status}`);
    }
  }

  public observeElement(selector: string, callback: (element: Element) => void) {
    if (typeof window === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            callback(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '50px' }
    );

    this.observers.set(selector, observer);

    // Observe existing elements
    document.querySelectorAll(selector).forEach(element => {
      observer.observe(element);
    });

    // Observe dynamically added elements
    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            if (element.matches && element.matches(selector)) {
              observer.observe(element);
            }
          }
        });
      });
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  public prefetchOnHover(element: HTMLElement, urls: string[], type: 'script' | 'style' | 'image' | 'fetch' = 'fetch') {
    let timeoutId: NodeJS.Timeout;

    element.addEventListener('mouseenter', () => {
      timeoutId = setTimeout(() => {
        urls.forEach(url => this.prefetch(url, type, { priority: 'high' }));
      }, 200); // 200ms delay
    });

    element.addEventListener('mouseleave', () => {
      clearTimeout(timeoutId);
    });
  }

  public prefetchRoute(route: string) {
    // Prefetch Next.js route
    if (typeof window !== 'undefined' && 'next' in window) {
      // @ts-ignore
      window.next.router.prefetch(route);
    }
  }

  public getStats() {
    const total = this.items.size;
    const loaded = Array.from(this.items.values()).filter(item => item.loaded).length;
    const highPriority = Array.from(this.items.values()).filter(item => item.priority === 'high').length;
    
    return {
      total,
      loaded,
      pending: total - loaded,
      highPriority,
      loadRate: total > 0 ? (loaded / total) * 100 : 0
    };
  }

  public clear() {
    this.items.clear();
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }
}

// Global instance
export const prefetchManager = new PrefetchManager();

// Helper functions
export const prefetch = (url: string, type?: 'script' | 'style' | 'image' | 'fetch', options?: PrefetchOptions) => {
  prefetchManager.prefetch(url, type, options);
};

export const prefetchOnHover = (element: HTMLElement, urls: string[], type?: 'script' | 'style' | 'image' | 'fetch') => {
  prefetchManager.prefetchOnHover(element, urls, type);
};

export const prefetchRoute = (route: string) => {
  prefetchManager.prefetchRoute(route);
};

export const observeElement = (selector: string, callback: (element: Element) => void) => {
  prefetchManager.observeElement(selector, callback);
};

export default prefetchManager;
