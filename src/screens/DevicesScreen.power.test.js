import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DevicesScreen from './DevicesScreen';

describe('DevicesScreen power toggle', () => {
  test('clicking the On/Off indicator toggles device power', async () => {
    render(<DevicesScreen />);

    const powerToggle = screen.getByRole('button', { name: /ceiling light power/i });

    // Starts on.
    expect(screen.getByText('On')).toBeInTheDocument();

    await userEvent.click(powerToggle);

    // Should flip to off.
    expect(screen.getByText('Off')).toBeInTheDocument();

    // Clicking the toggle should NOT open the modal.
    expect(screen.queryByRole('dialog', { name: /device controls/i })).not.toBeInTheDocument();
  });

  test('clicking the row (open button) opens the modal', async () => {
    render(<DevicesScreen />);

    await userEvent.click(screen.getByRole('button', { name: /open ceiling light/i }));

    expect(screen.getByRole('dialog', { name: /device controls/i })).toBeInTheDocument();
  });
});
