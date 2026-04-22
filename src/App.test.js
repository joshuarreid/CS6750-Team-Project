import { render, screen } from '@testing-library/react';
import App from './App';

test('renders phone screen scaffold', () => {
  render(<App />);
  expect(screen.getByLabelText(/phone screen/i)).toBeInTheDocument();
  expect(screen.getByText(/cs6750 prototype/i)).toBeInTheDocument();
});
