import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

function Hello({ name }: { name: string }) {
  return <h1>Hello, {name}!</h1>;
}

describe('Vitest setup', () => {
  it('should render a component', () => {
    render(<Hello name="World" />);
    expect(screen.getByText('Hello, World!')).toBeInTheDocument();
  });

  it('should run basic assertions', () => {
    expect(1 + 1).toBe(2);
    expect(true).toBeTruthy();
  });
});
