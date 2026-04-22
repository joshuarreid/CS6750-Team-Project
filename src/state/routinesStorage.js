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

