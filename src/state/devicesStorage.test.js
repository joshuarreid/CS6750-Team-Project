import { toggleDevicePower } from './devicesStorage';

describe('devicesStorage helpers', () => {
  test('toggleDevicePower flips isOn for the matching device only', () => {
    const devices = [
      { id: 'a', isOn: true },
      { id: 'b', isOn: false },
    ];

    const next = toggleDevicePower(devices, 'b');

    expect(next).toEqual([
      { id: 'a', isOn: true },
      { id: 'b', isOn: true },
    ]);
  });
});

