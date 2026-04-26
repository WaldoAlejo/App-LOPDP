import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchBar } from './SearchBar';

describe('SearchBar', () => {
  it('renders with placeholder', () => {
    render(<SearchBar value="" onChange={() => {}} />);
    expect(screen.getByPlaceholderText('Buscar...')).toBeInTheDocument();
  });

  it('renders with custom placeholder', () => {
    render(<SearchBar value="" onChange={() => {}} placeholder="Custom..." />);
    expect(screen.getByPlaceholderText('Custom...')).toBeInTheDocument();
  });

  it('displays the current value', () => {
    render(<SearchBar value="query" onChange={() => {}} />);
    expect(screen.getByDisplayValue('query')).toBeInTheDocument();
  });

  it('calls onChange when typing', () => {
    const handleChange = vi.fn();
    render(<SearchBar value="" onChange={handleChange} />);

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'hello' } });
    expect(handleChange).toHaveBeenCalledWith('hello');
  });

  it('shows clear button when value is not empty', () => {
    const handleChange = vi.fn();
    render(<SearchBar value="query" onChange={handleChange} />);

    const clearButton = screen.getByLabelText('Limpiar búsqueda');
    expect(clearButton).toBeInTheDocument();

    fireEvent.click(clearButton);
    expect(handleChange).toHaveBeenCalledWith('');
  });

  it('does not show clear button when value is empty', () => {
    render(<SearchBar value="" onChange={() => {}} />);
    expect(screen.queryByLabelText('Limpiar búsqueda')).not.toBeInTheDocument();
  });
});
