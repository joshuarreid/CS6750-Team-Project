// Shared utilities for persisting the Rooms floor plan state and deriving room membership.

const STORAGE_KEY = 'cs6750.floorPlan.v1';

export function loadFloorPlanState() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);

    // Minimal shape validation (avoid breaking app on bad localStorage).
    if (!parsed || typeof parsed !== 'object') return null;
    const { rooms, devicePositions } = parsed;
    if (!Array.isArray(rooms) || !devicePositions || typeof devicePositions !== 'object') return null;

    return { rooms, devicePositions };
  } catch {
    return null;
  }
}

export function saveFloorPlanState(state) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota / serialization errors
  }
}

export function isPointInRoom(room, point) {
  if (!room || !point) return false;
  const x1 = room.x;
  const y1 = room.y;
  const x2 = room.x + room.w;
  const y2 = room.y + room.h;
  // Inclusive bounds so markers on the border count.
  return point.x >= x1 && point.x <= x2 && point.y >= y1 && point.y <= y2;
}

// Returns the name of the room containing the point, preferring the smallest area room
// in case of overlaps (more specific room wins).
export function getRoomForPoint(rooms, point) {
  if (!Array.isArray(rooms)) return null;
  let best = null;
  for (const r of rooms) {
    if (!isPointInRoom(r, point)) continue;
    const area = (r.w ?? 0) * (r.h ?? 0);
    if (!best) {
      best = { room: r, area };
      continue;
    }
    if (area < best.area) best = { room: r, area };
  }
  return best?.room?.name ?? null;
}

export function computeDeviceRoomMap(rooms, devicePositions) {
  const map = {};
  if (!devicePositions || typeof devicePositions !== 'object') return map;
  for (const [deviceId, pos] of Object.entries(devicePositions)) {
    const roomName = getRoomForPoint(rooms, pos);
    if (roomName) map[deviceId] = roomName;
  }
  return map;
}

