import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';

// Component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>Normal content</div>;
};

describe('ErrorBoundary', () => {
  // Prevent console.error from cluttering test output
  const consoleError = console.error;
  beforeEach(() => {
    console.error = vi.fn();
  });
  afterEach(() => {
    console.error = consoleError;
  });

  it('should render children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Safe content</div>
      </ErrorBoundary>
    );
    expect(screen.getByText('Safe content')).toBeInTheDocument();
  });

  it('should render fallback UI when an error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Algo salió mal')).toBeInTheDocument();
    expect(screen.getByText('Recargar')).toBeInTheDocument();
    expect(screen.getByText('Ir al inicio')).toBeInTheDocument();
  });

  it('should render custom fallback when provided', () => {
    render(
      <ErrorBoundary fallback={<div>Custom error UI</div>}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom error UI')).toBeInTheDocument();
  });

  it('should call window.location.reload when reload button is clicked', () => {
    const reloadMock = vi.fn();
    const originalLocation = window.location;
    Object.defineProperty(window, 'location', {
      value: { ...originalLocation, reload: reloadMock },
      writable: true,
    });

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    fireEvent.click(screen.getByText('Recargar'));
    expect(reloadMock).toHaveBeenCalled();

    // Restore
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
    });
  });
});
