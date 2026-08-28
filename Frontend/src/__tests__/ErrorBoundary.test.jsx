import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ErrorBoundary from '../components/ErrorBoundary';

const ProblemChild = () => {
  throw new Error("Test error");
};

describe('ErrorBoundary Component', () => {
  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <div data-testid="safe-child">Safe</div>
      </ErrorBoundary>
    );
    expect(screen.getByTestId('safe-child')).toBeInTheDocument();
  });

  it('renders error fallback when an error is thrown', () => {
    // Suppress console.error for the test
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    
    spy.mockRestore();
  });
});
