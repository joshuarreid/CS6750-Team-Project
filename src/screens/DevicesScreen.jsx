import React, { useMemo, useState } from 'react';
import DeviceModal from '../ui/DeviceModal';
import './prototypeScreens.css';
import { loadFloorPlanState, computeDeviceRoomMap } from '../state/floorPlanStorage';
import { loadDevices, saveDevices, toggleDevicePower } from '../state/devicesStorage';

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

function DeviceRow({ device, onOpen, onTogglePower }) {
  const signalTone = device.signal === 'Strong' ? 'good' : device.signal === 'Weak' ? 'warning' : 'neutral';
  return (
    <div className="DeviceRow" role="group" aria-label={device.name}>
      <button type="button" className="DeviceRow__open" onClick={onOpen} aria-label={`Open ${device.name}`}>
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
      </button>

      <div className="DeviceRow__right">
        <button
          type="button"
          className="DeviceRow__power"
          onClick={() => onTogglePower?.(device.id)}
          aria-label={`${device.name} power ${device.isOn ? 'on' : 'off'}. Click to toggle.`}
          aria-pressed={device.isOn}
        >
          <StatusDot tone={device.isOn ? 'on' : 'off'}>{device.isOn ? 'On' : 'Off'}</StatusDot>
        </button>
        <StatusDot tone={signalTone}>{device.signal}</StatusDot>
      </div>
    </div>
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
  const [devices, setDevices] = useState(() => loadDevices());

  React.useEffect(() => {
    saveDevices(devices);
  }, [devices]);

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

  function handleTogglePower(deviceId) {
    setDevices((prev) => toggleDevicePower(prev, deviceId));
  }

  return (
    <div className="ProtoScreen" aria-label="Devices screen">
      <div className="ProtoScreen__content">
        {grouped.map(([room, roomDevices]) => (
          <div key={room} className="RoomSection" aria-label={`Devices in ${room}`}>
            <div className="RoomSection__title">{room}</div>
            <div className="List">
              {roomDevices.map((d) => (
                <DeviceRow
                  key={d.id}
                  device={d}
                  onOpen={() => setSelectedDeviceId(d.id)}
                  onTogglePower={handleTogglePower}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <DeviceModal
        device={selectedDevice}
        onClose={() => setSelectedDeviceId(null)}
        onTogglePower={handleTogglePower}
      />
    </div>
  );
}
