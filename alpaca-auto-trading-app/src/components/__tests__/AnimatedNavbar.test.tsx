/**
 * File: src/components/__tests__/AnimatedNavbar.test.tsx
 * Description: Tests for AnimatedNavbar component.
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OptimizedNavbar } from '../optimized/OptimizedNavbar';

// Mock Framer Motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <div>{children}</div>,
}));

// Mock Next.js Link
jest.mock('next/link', () => {
  return ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  );
});

const mockNavItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/portfolio', label: 'Portfolio', icon: '💼' },
  { href: '/alerts', label: 'Alerts', icon: '🔔' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
];

describe('OptimizedNavbar', () => {
  it('renders without crashing', () => {
    render(<OptimizedNavbar items={mockNavItems} />);
    expect(screen.getByText('Trading App')).toBeInTheDocument();
  });

  it('renders all navigation items', () => {
    render(<OptimizedNavbar items={mockNavItems} />);
    
    mockNavItems.forEach((item) => {
      expect(screen.getByText(item.label)).toBeInTheDocument();
    });
  });

  it('renders mobile menu button on small screens', () => {
    render(<OptimizedNavbar items={mockNavItems} />);
    
    // The mobile menu button should be present
    const mobileButton = screen.getByRole('button');
    expect(mobileButton).toBeInTheDocument();
  });

  it('toggles mobile menu when button is clicked', async () => {
    render(<OptimizedNavbar items={mockNavItems} />);
    
    const mobileButton = screen.getByRole('button');
    fireEvent.click(mobileButton);
    
    // Wait for the mobile menu to appear
    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });
  });

  it('calls onItemClick when a nav item is clicked', () => {
    const mockOnItemClick = jest.fn();
    render(<OptimizedNavbar items={mockNavItems} onItemClick={mockOnItemClick} />);
    
    const dashboardLink = screen.getByText('Dashboard');
    fireEvent.click(dashboardLink);
    
    expect(mockOnItemClick).toHaveBeenCalledWith(mockNavItems[0]);
  });

  it('applies custom className', () => {
    const customClass = 'custom-navbar';
    render(<OptimizedNavbar items={mockNavItems} className={customClass} />);
    
    const navbar = screen.getByRole('navigation');
    expect(navbar).toHaveClass(customClass);
  });

  it('renders with empty items array', () => {
    render(<OptimizedNavbar items={[]} />);
    expect(screen.getByText('Trading App')).toBeInTheDocument();
  });

  it('handles items without icons', () => {
    const itemsWithoutIcons = [
      { href: '/dashboard', label: 'Dashboard' },
      { href: '/portfolio', label: 'Portfolio' },
    ];
    
    render(<OptimizedNavbar items={itemsWithoutIcons} />);
    
    itemsWithoutIcons.forEach((item) => {
      expect(screen.getByText(item.label)).toBeInTheDocument();
    });
  });

  it('closes mobile menu when item is clicked', async () => {
    render(<OptimizedNavbar items={mockNavItems} />);
    
    const mobileButton = screen.getByRole('button');
    fireEvent.click(mobileButton);
    
    // Wait for mobile menu to open
    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });
    
    // Click on a nav item
    const dashboardLink = screen.getByText('Dashboard');
    fireEvent.click(dashboardLink);
    
    // Mobile menu should close
    await waitFor(() => {
      // The mobile menu should be hidden
      expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    });
  });

  it('renders logo link correctly', () => {
    render(<OptimizedNavbar items={mockNavItems} />);
    
    const logoLink = screen.getByText('Trading App');
    expect(logoLink.closest('a')).toHaveAttribute('href', '/');
  });

  it('renders nav item links correctly', () => {
    render(<OptimizedNavbar items={mockNavItems} />);
    
    mockNavItems.forEach((item) => {
      const link = screen.getByText(item.label);
      expect(link.closest('a')).toHaveAttribute('href', item.href);
    });
  });
});