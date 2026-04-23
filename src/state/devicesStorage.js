const STORAGE_KEY = 'cs6750.devices.v1';

const DEFAULT_DEVICES = [
  { id: 'ceiling', name: 'Ceiling Light', room: 'Living Room', type: 'Light', isOn: true, signal: 'Strong', brightness: 100 },
  { id: 'tv', name: 'TV', room: 'Living Room', type: 'Entertainment', isOn: true, signal: 'Strong' },
  { id: 'bedroom', name: 'Bedroom Light', room: 'Bedroom', type: 'Light', isOn: true, signal: 'Weak', brightness: 60 },
  { id: 'echo', name: 'Echo Dot', room: 'Bedroom', type: 'Speaker', isOn: true, signal: 'Strong' },
  { id: 'kitchen', name: 'Kitchen Light', room: 'Kitchen', type: 'Light', isOn: true, signal: 'Weak', brightness: 80 },
  { id: 'plug', name: 'Smart Plug', room: 'Kitchen', type: 'Outlet', isOn: false, signal: 'Strong' },
  { id: 'thermostat', name: 'Thermostat', room: 'Entry', type: 'Thermostat', isOn: true, signal: 'Strong', temperature: 72 },
  { id: 'cam', name: 'Front Door Cam', room: 'Entry', type: 'Camera', isOn: true, signal: 'Strong' },
  { id: 'bath', name: 'Bath Light', room: 'Bathroom', type: 'Light', isOn: false, signal: 'Weak' },
];

export function defaultDevices() {
  // Return a fresh copy so callers can mutate safely.
  return DEFAULT_DEVICES.map((d) => ({ ...d }));
}

export function loadDevices() {
  if (typeof window === 'undefined') return defaultDevices();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultDevices();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return defaultDevices();
    return parsed;
  } catch {
    return defaultDevices();
  }
}

export function saveDevices(devices) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(devices));
  } catch {
    // ignore
  }
}

export function toggleDevicePower(devices, deviceId) {
  return devices.map((d) => (d.id === deviceId ? { ...d, isOn: !d.isOn } : d));
}

export function setDevicePower(devices, deviceId, isOn) {
  return devices.map((d) => (d.id === deviceId ? { ...d, isOn: Boolean(isOn) } : d));
}

