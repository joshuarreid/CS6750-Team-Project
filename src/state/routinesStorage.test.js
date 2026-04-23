import { formatTimeLabel, routineSummary } from './routinesStorage';

describe('routinesStorage helpers', () => {
  test('formatTimeLabel formats 24h time into 12h', () => {
    expect(formatTimeLabel('00:05')).toBe('12:05 AM');
    expect(formatTimeLabel('09:00')).toBe('9:00 AM');
    expect(formatTimeLabel('12:30')).toBe('12:30 PM');
    expect(formatTimeLabel('23:15')).toBe('11:15 PM');
  });

  test('routineSummary uses device name when available', () => {
    const devicesById = { tv: { name: 'TV' } };
    expect(routineSummary({ deviceId: 'tv', action: 'Turn on', time: '21:00' }, devicesById)).toBe('Turn on • TV • 9:00 PM');
  });
});
