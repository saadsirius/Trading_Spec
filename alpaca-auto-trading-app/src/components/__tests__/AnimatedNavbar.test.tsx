import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useUIStore } from '@/state/uiStore';
import AnimatedNavbar from '../AnimatedNavbar';

// Mock the UI store
jest.mock('@/state/uiStore');
const mockUseUIStore = useUIStore as jest.MockedFunction<typeof useUIStore>;

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    nav: ({ children, ...props }: any) => <nav {...props}>{children}</nav>,
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
  useScroll: () => ({ scrollY: { get: () => 0 } }),
  useMotionValue: () => ({ get: () => 0, set: jest.fn() }),
  useTransform: () => ({ get: () => 0 }),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: () => '/test',
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  }),
}));

describe('AnimatedNavbar', () => {
  const mockStore = {
    isNavbarVisible: true,
    isNavbarSticky: false,
    toggleNavbar: jest.fn(),
    setNavbarSticky: jest.fn(),
  };

  beforeEach(() => {
    mockUseUIStore.mockReturnValue(mockStore);
    jest.clearAllMocks();
  });

  it('renders navbar with correct structure', () => {
    render(<AnimatedNavbar />);
    
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByText('Alpaca Trading')).toBeInTheDocument();
  });

  it('shows navigation links', () => {
    render(<AnimatedNavbar />);
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Portfolio')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
    expect(screen.getByText('Screener')).toBeInTheDocument();
  });

  it('handles navbar toggle', () => {
    render(<AnimatedNavbar />);
    
    const toggleButton = screen.getByRole('button', { name: /toggle/i });
    fireEvent.click(toggleButton);
    
    expect(mockStore.toggleNavbar).toHaveBeenCalledTimes(1);
  });

  it('shows sticky state indicator', () => {
    mockUseUIStore.mockReturnValue({
      ...mockStore,
      isNavbarSticky: true,
    });
    
    render(<AnimatedNavbar />);
    
    // Should show sticky indicator
    expect(screen.getByTestId('sticky-indicator')).toBeInTheDocument();
  });

  it('handles mobile menu toggle', () => {
    render(<AnimatedNavbar />);
    
    const mobileToggle = screen.getByRole('button', { name: /menu/i });
    fireEvent.click(mobileToggle);
    
    // Should show mobile menu
    expect(screen.getByTestId('mobile-menu')).toBeInTheDocument();
  });

  it('applies correct classes based on state', () => {
    const { rerender } = render(<AnimatedNavbar />);
    
    // Test sticky state
    mockUseUIStore.mockReturnValue({
      ...mockStore,
      isNavbarSticky: true,
    });
    rerender(<AnimatedNavbar />);
    
    const navbar = screen.getByRole('navigation');
    expect(navbar).toHaveClass('sticky');
  });

  it('handles keyboard navigation', () => {
    render(<AnimatedNavbar />);
    
    const toggleButton = screen.getByRole('button', { name: /toggle/i });
    toggleButton.focus();
    
    fireEvent.keyDown(toggleButton, { key: 'Enter' });
    expect(mockStore.toggleNavbar).toHaveBeenCalled();
    
    fireEvent.keyDown(toggleButton, { key: ' ' });
    expect(mockStore.toggleNavbar).toHaveBeenCalledTimes(2);
  });

  it('shows loading state', () => {
    render(<AnimatedNavbar />);
    
    // Should show loading indicator when appropriate
    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
  });

  it('handles responsive behavior', () => {
    // Mock window.innerWidth
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768,
    });
    
    render(<AnimatedNavbar />);
    
    // Should show mobile menu button on smaller screens
    expect(screen.getByRole('button', { name: /menu/i })).toBeInTheDocument();
  });
});
