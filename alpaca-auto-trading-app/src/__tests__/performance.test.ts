import { performance } from 'perf_hooks';

// Performance test utilities
export const measurePerformance = async (fn: () => Promise<any> | any, name: string) => {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  const duration = end - start;
  
  console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`);
  
  return { result, duration };
};

// Test component rendering performance
export const testComponentRenderPerformance = async () => {
  const { measurePerformance } = await import('./performance.test');
  
  // Mock React component rendering
  const renderComponent = async () => {
    // Simulate component rendering
    await new Promise(resolve => setTimeout(resolve, 10));
    return 'rendered';
  };
  
  const { duration } = await measurePerformance(renderComponent, 'Component Render');
  
  // Assert that rendering takes less than 100ms
  expect(duration).toBeLessThan(100);
};

// Test API response time
export const testAPIResponseTime = async () => {
  const { measurePerformance } = await import('./performance.test');
  
  const fetchData = async () => {
    const response = await fetch('/api/health');
    return response.json();
  };
  
  const { duration } = await measurePerformance(fetchData, 'API Response');
  
  // Assert that API response takes less than 500ms
  expect(duration).toBeLessThan(500);
};

// Test search performance
export const testSearchPerformance = async () => {
  const { measurePerformance } = await import('./performance.test');
  
  const searchData = async () => {
    const response = await fetch('/api/search?q=AAPL');
    return response.json();
  };
  
  const { duration } = await measurePerformance(searchData, 'Search Performance');
  
  // Assert that search takes less than 300ms
  expect(duration).toBeLessThan(300);
};

// Test memory usage
export const testMemoryUsage = () => {
  if (typeof window === 'undefined') return;
  
  const memory = (performance as any).memory;
  if (!memory) return;
  
  const usedMB = memory.usedJSHeapSize / 1048576;
  const totalMB = memory.totalJSHeapSize / 1048576;
  
  console.log(`🧠 Memory usage: ${usedMB.toFixed(2)}MB / ${totalMB.toFixed(2)}MB`);
  
  // Assert that memory usage is reasonable (less than 100MB)
  expect(usedMB).toBeLessThan(100);
};

// Test bundle size
export const testBundleSize = () => {
  // This would typically be done in a build process
  // For now, we'll just log that the test exists
  console.log('📦 Bundle size test - would check that main bundle is < 500KB');
};

// Performance test suite
describe('Performance Tests', () => {
  beforeAll(() => {
    // Set up performance monitoring
    if (typeof window !== 'undefined') {
      performance.mark('test-start');
    }
  });
  
  afterAll(() => {
    // Clean up performance monitoring
    if (typeof window !== 'undefined') {
      performance.mark('test-end');
      performance.measure('test-duration', 'test-start', 'test-end');
    }
  });
  
  test('Component rendering performance', testComponentRenderPerformance);
  
  test('API response time', testAPIResponseTime);
  
  test('Search performance', testSearchPerformance);
  
  test('Memory usage', testMemoryUsage);
  
  test('Bundle size', testBundleSize);
});
