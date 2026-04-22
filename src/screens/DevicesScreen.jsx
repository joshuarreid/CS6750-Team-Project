import React, { useMemo, useState } from 'react';
import DeviceModal from '../ui/DeviceModal';
import './prototypeScreens.css';
import { loadFloorPlanState, computeDeviceRoomMap } from '../state/floorPlanStorage';

function StatusDot({ tone = 'neutral', children }) {
  let color = '#94a3b8'; // neutral/off
  if (tone === 'good' || tone === 'on') color = '#22c55e'; // green
  if (tone === 'warning') color = '#f59e0b'; // yellow
  if (tone === 'off') color = '#94a3b8'; // gray
  if (tone === 'bad') color = '#ef4444'; // red (if needed)
  return (
    <span className="StatusDot">
      <span className="StatusDot__dot" style={{ background: color }} aria-hidden="true" />
      <span className="StatusDot__label">{children}</span>
    </span>
  );
}

function DeviceRow({ device, onClick }) {
  const signalTone = device.signal === 'Strong' ? 'good' : device.signal === 'Weak' ? 'warning' : 'neutral';
  return (
    <button type="button" className="DeviceRow" onClick={onClick}>
      <div className="DeviceRow__left">
        <div className="DeviceRow__icon" aria-hidden="true">
          {/* Icon placeholder */}
          <span className="DeviceRow__glyph">◎</span>
        </div>
        <div className="DeviceRow__meta">
          <div className="DeviceRow__name">{device.name}</div>
          <div className="DeviceRow__sub">{device.room}</div>
        </div>
      </div>
      <div className="DeviceRow__right">
        <StatusDot tone={device.isOn ? 'on' : 'off'}>{device.isOn ? 'On' : 'Off'}</StatusDot>
        <StatusDot tone={signalTone}>{device.signal}</StatusDot>
      </div>
    </button>
  );
}

function groupByRoom(devices) {
  const map = new Map();
  for (const d of devices) {
    const key = d.room ?? 'Other';
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(d);
  }
  return map;
}

export default function DevicesScreen() {
  const devices = useMemo(
    () => [
      { id: 'ceiling', name: 'Ceiling Light', room: 'Living Room', type: 'Light', isOn: true, signal: 'Strong', brightness: 100 },
      { id: 'tv', name: 'TV', room: 'Living Room', type: 'Entertainment', isOn: true, signal: 'Strong' },
      { id: 'bedroom', name: 'Bedroom Light', room: 'Bedroom', type: 'Light', isOn: true, signal: 'Weak', brightness: 60 },
      { id: 'echo', name: 'Echo Dot', room: 'Bedroom', type: 'Speaker', isOn: true, signal: 'Strong' },
      { id: 'kitchen', name: 'Kitchen Light', room: 'Kitchen', type: 'Light', isOn: true, signal: 'Weak', brightness: 80 },
      { id: 'plug', name: 'Smart Plug', room: 'Kitchen', type: 'Outlet', isOn: false, signal: 'Strong' },
      { id: 'thermostat', name: 'Thermostat', room: 'Entry', type: 'Thermostat', isOn: true, signal: 'Strong', temperature: 72 },
      { id: 'cam', name: 'Front Door Cam', room: 'Entry', type: 'Camera', isOn: true, signal: 'Strong' },
      { id: 'bath', name: 'Bath Light', room: 'Bathroom', type: 'Light', isOn: false, signal: 'Weak' },
    ],
    []
  );

  const derivedRoomsById = useMemo(() => {
    const saved = loadFloorPlanState();
    if (!saved) return {};
    return computeDeviceRoomMap(saved.rooms, saved.devicePositions);
  }, []);

  const devicesWithDerivedRoom = useMemo(() => {
    return devices.map((d) => ({ ...d, room: derivedRoomsById[d.id] ?? d.room }));
  }, [devices, derivedRoomsById]);

  const grouped = useMemo(() => {
    const byRoom = groupByRoom(devicesWithDerivedRoom);
    const roomOrder = ['Living Room', 'Bedroom', 'Bathroom', 'Kitchen', 'Entry'];

    const ordered = [];
    for (const room of roomOrder) {
      if (byRoom.has(room)) ordered.push([room, byRoom.get(room)]);
    }
    // Append any unknown rooms (stable alphabetical)
    const remaining = Array.from(byRoom.keys())
      .filter((k) => !roomOrder.includes(k))
      .sort((a, b) => a.localeCompare(b));
    for (const room of remaining) {
      ordered.push([room, byRoom.get(room)]);
    }
    return ordered;
  }, [devicesWithDerivedRoom]);

  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const selectedDevice = devicesWithDerivedRoom.find((d) => d.id === selectedDeviceId) ?? null;

  return (
    <div className="ProtoScreen" aria-label="Devices screen">
      <div className="ProtoScreen__content">
        {grouped.map(([room, roomDevices]) => (
          <div key={room} className="RoomSection" aria-label={`Devices in ${room}`}>
            <div className="RoomSection__title">{room}</div>
            <div className="List">
              {roomDevices.map((d) => (
                <DeviceRow key={d.id} device={d} onClick={() => setSelectedDeviceId(d.id)} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <DeviceModal device={selectedDevice} onClose={() => setSelectedDeviceId(null)} />
    </div>
  );
}
