import { debounce, throttle } from 'lodash';

// Image optimization utilities
export const optimizeImage = (src: string, options: {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
} = {}) => {
  const { width, height, quality = 80, format = 'webp' } = options;
  
  // For Next.js Image component, return optimized src
  if (src.startsWith('/')) {
    return src; // Let Next.js handle optimization
  }
  
  // For external images, you might want to use a service like Cloudinary
  // or implement your own image optimization service
  return src;
};

// Debounced search function
export const createDebouncedSearch = (searchFn: (query: string) => void, delay = 300) => {
  return debounce(searchFn, delay);
};

// Throttled scroll handler
export const createThrottledScroll = (scrollFn: () => void, delay = 100) => {
  return throttle(scrollFn, delay);
};

// Preload critical resources
export const preloadCriticalResources = () => {
  // Preload critical fonts
  const fontPreloads = [
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  ];
  
  fontPreloads.forEach(href => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = href;
    document.head.appendChild(link);
  });
  
  // Preload critical images
  const imagePreloads = [
    '/logo.webp',
    '/favicon.ico',
  ];
  
  imagePreloads.forEach(src => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  });
};

// Bundle analysis utilities
export const analyzeBundle = () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Bundle analysis available in development mode');
    console.log('Run: npx source-map-explorer "build/static/js/*.js"');
  }
};

// Performance monitoring
export const monitorPerformance = () => {
  if (typeof window === 'undefined') return;
  
  // Monitor Core Web Vitals
  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      if (entry.entryType === 'largest-contentful-paint') {
        console.log('LCP:', entry.startTime);
      }
      if (entry.entryType === 'first-input') {
        console.log('FID:', entry.processingStart - entry.startTime);
      }
      if (entry.entryType === 'layout-shift') {
        console.log('CLS:', (entry as any).value);
      }
    });
  });
  
  observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
};

// Memory usage monitoring
export const monitorMemory = () => {
  if (typeof window === 'undefined' || !('memory' in performance)) return;
  
  const memory = (performance as any).memory;
  console.log('Memory usage:', {
    used: Math.round(memory.usedJSHeapSize / 1048576) + ' MB',
    total: Math.round(memory.totalJSHeapSize / 1048576) + ' MB',
    limit: Math.round(memory.jsHeapSizeLimit / 1048576) + ' MB',
  });
};

// Resource hints
export const addResourceHints = () => {
  // DNS prefetch for external domains
  const dnsPrefetchDomains = [
    'https://api.alpaca.markets',
    'https://data.alpaca.markets',
    'https://polygon.io',
  ];
  
  dnsPrefetchDomains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = domain;
    document.head.appendChild(link);
  });
  
  // Preconnect to critical domains
  const preconnectDomains = [
    'https://api.alpaca.markets',
    'https://data.alpaca.markets',
  ];
  
  preconnectDomains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = domain;
    document.head.appendChild(link);
  });
};

// Service Worker registration for caching
export const registerServiceWorker = async () => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
  
  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('Service Worker registered:', registration);
  } catch (error) {
    console.log('Service Worker registration failed:', error);
  }
};

// Critical CSS inlining
export const inlineCriticalCSS = () => {
  // This would typically be handled by a build tool
  // For now, we'll just ensure critical styles are loaded first
  const criticalStyles = `
    body { margin: 0; font-family: Inter, sans-serif; }
    .loading { display: flex; align-items: center; justify-content: center; }
    .navbar { position: fixed; top: 0; left: 0; right: 0; z-index: 50; }
  `;
  
  const style = document.createElement('style');
  style.textContent = criticalStyles;
  document.head.insertBefore(style, document.head.firstChild);
};

// Lazy loading for images
export const setupLazyLoading = () => {
  if (typeof window === 'undefined') return;
  
  const images = document.querySelectorAll('img[data-src]');
  
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        img.src = img.dataset.src || '';
        img.classList.remove('lazy');
        imageObserver.unobserve(img);
      }
    });
  });
  
  images.forEach(img => imageObserver.observe(img));
};

// Initialize all optimizations
export const initializeOptimizations = () => {
  if (typeof window === 'undefined') return;
  
  preloadCriticalResources();
  addResourceHints();
  inlineCriticalCSS();
  setupLazyLoading();
  monitorPerformance();
  monitorMemory();
  registerServiceWorker();
  
  console.log('Performance optimizations initialized');
};
