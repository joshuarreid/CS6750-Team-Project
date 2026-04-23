import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DeviceModal from './DeviceModal';

describe('DeviceModal power metric', () => {
  test('clicking the Power metric calls onTogglePower', async () => {
    const onTogglePower = jest.fn();

    render(
      <DeviceModal
        device={{ id: 'tv', name: 'TV', room: 'Living Room', isOn: true, signal: 'Strong' }}
        onClose={() => {}}
        onTogglePower={onTogglePower}
      />
    );

    // The Power metric becomes a button when onTogglePower is provided.
    const powerMetric = screen.getByRole('button', { name: /power/i });

    await userEvent.click(powerMetric);

    expect(onTogglePower).toHaveBeenCalledWith('tv');
  });
});
