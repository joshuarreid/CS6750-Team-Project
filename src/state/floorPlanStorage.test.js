import { computeDeviceRoomMap, getRoomForPoint } from './floorPlanStorage';

describe('floorPlanStorage room derivation', () => {
  const rooms = [
    { id: 'a', name: 'A', x: 0, y: 0, w: 50, h: 50 },
    { id: 'b', name: 'B', x: 50, y: 0, w: 50, h: 50 },
  ];

  test('getRoomForPoint returns containing room name', () => {
    expect(getRoomForPoint(rooms, { x: 10, y: 10 })).toBe('A');
    expect(getRoomForPoint(rooms, { x: 90, y: 10 })).toBe('B');
  });

  test('computeDeviceRoomMap maps only devices that are inside a room', () => {
    const devicePositions = {
      d1: { x: 10, y: 10 },
      d2: { x: 90, y: 10 },
      d3: { x: 10, y: 90 }, // outside
    };

    expect(computeDeviceRoomMap(rooms, devicePositions)).toEqual({ d1: 'A', d2: 'B' });
  });
});

