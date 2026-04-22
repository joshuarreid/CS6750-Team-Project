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
const STORAGE_KEY = 'cs6750.routines.v1';

export function loadRoutines() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function saveRoutines(routines) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(routines));
  } catch {
    // ignore
  }
}

export function formatTimeLabel(time24) {
  // time24: "HH:MM"
  if (!time24 || typeof time24 !== 'string') return '';
  const [hhRaw, mmRaw] = time24.split(':');
  const hh = Number(hhRaw);
  const mm = Number(mmRaw);
  if (!Number.isFinite(hh) || !Number.isFinite(mm)) return time24;

  const suffix = hh >= 12 ? 'PM' : 'AM';
  const hour12 = ((hh + 11) % 12) + 1;
  const mm2 = String(mm).padStart(2, '0');
  return `${hour12}:${mm2} ${suffix}`;
}

export function routineSummary(routine, devicesById = {}) {
  if (!routine) return '';
  const deviceName = devicesById[routine.deviceId]?.name ?? 'Device';
  const actionText = routine.action ?? 'Action';
  const timeText = formatTimeLabel(routine.time);
  return `${actionText} • ${deviceName} • ${timeText}`;
}

