import { render, screen } from '@testing-library/react';
import App from './App';

test('renders add new button', () => {
  render(<App />);
  const addNewButton = screen.getByText(/New/i);
  expect(addNewButton).toBeInTheDocument();
});
