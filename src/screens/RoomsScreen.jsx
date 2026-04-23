import React, { useMemo, useRef, useState, useEffect } from 'react';
import DeviceModal from '../ui/DeviceModal';
import './prototypeScreens.css';
import { loadFloorPlanState, saveFloorPlanState } from '../state/floorPlanStorage';
import { loadDevices, saveDevices, toggleDevicePower } from '../state/devicesStorage';

function StatusDot({ tone = 'neutral', children }) {
  // Map tone to color used in floor plan markers
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

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

const MIN_ROOM_W = 12;
const MIN_ROOM_H = 10;

export default function RoomsScreen() {
  const [devices, setDevices] = useState(() => loadDevices());

  useEffect(() => {
    saveDevices(devices);
  }, [devices]);

  const initialRooms = useMemo(
    () => [
      { id: 'living', name: 'Living Room', x: 10, y: 10, w: 58, h: 42 },
      { id: 'bed', name: 'Bedroom', x: 70, y: 10, w: 20, h: 25 },
      { id: 'bath', name: 'Bathroom', x: 70, y: 37, w: 20, h: 15 },
      { id: 'kitchen', name: 'Kitchen', x: 10, y: 56, w: 50, h: 26 },
      { id: 'entry', name: 'Entry', x: 62, y: 56, w: 28, h: 26 },
    ],
    []
  );

  const initialDevicePositions = useMemo(
    () => ({
      tv: { x: 18, y: 22 },
      ceiling: { x: 38, y: 26 },
      bedroom: { x: 78, y: 22 },
      echo: { x: 76, y: 30 },
      kitchen: { x: 20, y: 68 },
      plug: { x: 40, y: 70 },
      thermostat: { x: 16, y: 80 },
      cam: { x: 78, y: 78 },
      bath: { x: 80, y: 44 },
    }),
    []
  );

  const [rooms, setRooms] = useState(() => {
    const saved = loadFloorPlanState();
    return saved?.rooms ?? initialRooms;
  });
  const [devicePositions, setDevicePositions] = useState(() => {
    const saved = loadFloorPlanState();
    return saved?.devicePositions ?? initialDevicePositions;
  });

  useEffect(() => {
    saveFloorPlanState({ rooms, devicePositions });
  }, [rooms, devicePositions]);

  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const selectedDevice = devices.find((d) => d.id === selectedDeviceId) ?? null;

  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [renamingRoomId, setRenamingRoomId] = useState(null);
  const [roomNameDraft, setRoomNameDraft] = useState('');

  const canvasRef = useRef(null);
  const dragRef = useRef(null);

  // Track whether the last pointer interaction moved enough to be considered a drag.
  const didMoveRef = useRef(false);

  function getCanvasRect() {
    return canvasRef.current?.getBoundingClientRect() ?? null;
  }

  function getPercentPoint(clientX, clientY) {
    const rect = getCanvasRect();
    if (!rect) return { x: 50, y: 50 };
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    return { x, y };
  }

  function startRenameRoom(room) {
    setRenamingRoomId(room.id);
    setRoomNameDraft(room.name);
  }

  function commitRename(roomId) {
    const nextName = roomNameDraft.trim();
    if (!nextName) {
      setRenamingRoomId(null);
      return;
    }
    setRooms((prev) => prev.map((r) => (r.id === roomId ? { ...r, name: nextName } : r)));
    setRenamingRoomId(null);
  }

  function cancelRename() {
    setRenamingRoomId(null);
  }

  function onRoomPointerDown(e, roomId) {
    // Only start moving if the user clicked the room body (not a handle/input).
    if (e.defaultPrevented) return;

    e.preventDefault();
    e.stopPropagation();

    const room = rooms.find((r) => r.id === roomId);
    if (!room) return;

    setSelectedRoomId(roomId);
    setSelectedDeviceId(null);

    const p = getPercentPoint(e.clientX, e.clientY);

    dragRef.current = {
      kind: 'room-move',
      roomId,
      pointerId: e.pointerId,
      startPointer: p,
      startRoom: { ...room },
    };

    e.currentTarget.setPointerCapture?.(e.pointerId);
  }

  function onRoomResizePointerDown(e, roomId, handle) {
    e.preventDefault();
    e.stopPropagation();

    const room = rooms.find((r) => r.id === roomId);
    if (!room) return;

    setSelectedRoomId(roomId);
    setSelectedDeviceId(null);

    const p = getPercentPoint(e.clientX, e.clientY);

    dragRef.current = {
      kind: 'room-resize',
      roomId,
      handle,
      pointerId: e.pointerId,
      startPointer: p,
      startRoom: { ...room },
    };

    e.currentTarget.setPointerCapture?.(e.pointerId);
  }

  function onDevicePointerDown(e, deviceId) {
    e.preventDefault();
    e.stopPropagation();

    setSelectedRoomId(null);

    const p = getPercentPoint(e.clientX, e.clientY);
    const start = devicePositions[deviceId] ?? p;

    didMoveRef.current = false;

    dragRef.current = {
      kind: 'device',
      deviceId,
      pointerId: e.pointerId,
      startPointer: p,
      startPos: start,
    };

    e.currentTarget.setPointerCapture?.(e.pointerId);
  }

  function onCanvasPointerMove(e) {
    if (!dragRef.current) return;
    const p = getPercentPoint(e.clientX, e.clientY);

    if (dragRef.current.kind === 'device') {
      const { deviceId, startPointer, startPos } = dragRef.current;
      const dx = p.x - startPointer.x;
      const dy = p.y - startPointer.y;

      // Mark as moved if the pointer moved more than a small threshold.
      if (Math.abs(dx) + Math.abs(dy) > 0.75) {
        didMoveRef.current = true;
      }

      // Keep inside the canvas. Marker is ~9% of width/height-ish, so pad a bit.
      const next = {
        x: clamp(startPos.x + dx, 6, 94),
        y: clamp(startPos.y + dy, 9, 95),
      };

      setDevicePositions((prev) => ({ ...prev, [deviceId]: next }));
      return;
    }

    if (dragRef.current.kind === 'room-move') {
      const { roomId, startPointer, startRoom } = dragRef.current;
      const dx = p.x - startPointer.x;
      const dy = p.y - startPointer.y;

      const next = {
        ...startRoom,
        x: clamp(startRoom.x + dx, 0, 100 - startRoom.w),
        y: clamp(startRoom.y + dy, 0, 100 - startRoom.h),
      };

      setRooms((prev) => prev.map((r) => (r.id === roomId ? next : r)));
      return;
    }

    if (dragRef.current.kind === 'room-resize') {
      const { roomId, startPointer, startRoom, handle } = dragRef.current;
      const dx = p.x - startPointer.x;
      const dy = p.y - startPointer.y;

      let x = startRoom.x;
      let y = startRoom.y;
      let w = startRoom.w;
      let h = startRoom.h;

      const hasN = handle.includes('n');
      const hasS = handle.includes('s');
      const hasW = handle.includes('w');
      const hasE = handle.includes('e');

      if (hasE) w = startRoom.w + dx;
      if (hasS) h = startRoom.h + dy;
      if (hasW) {
        x = startRoom.x + dx;
        w = startRoom.w - dx;
      }
      if (hasN) {
        y = startRoom.y + dy;
        h = startRoom.h - dy;
      }

      // Enforce minimum size first.
      if (w < MIN_ROOM_W) {
        if (hasW) x -= MIN_ROOM_W - w;
        w = MIN_ROOM_W;
      }
      if (h < MIN_ROOM_H) {
        if (hasN) y -= MIN_ROOM_H - h;
        h = MIN_ROOM_H;
      }

      // Clamp to canvas bounds.
      x = clamp(x, 0, 100 - w);
      y = clamp(y, 0, 100 - h);

      // If we resized from E/S and overflowed, pull size back.
      w = clamp(w, MIN_ROOM_W, 100 - x);
      h = clamp(h, MIN_ROOM_H, 100 - y);

      const next = { ...startRoom, x, y, w, h };
      setRooms((prev) => prev.map((r) => (r.id === roomId ? next : r)));
    }
  }

  function endDrag() {
    if (!dragRef.current) return;
    dragRef.current = null;
  }

  function onDeviceDoubleClick(deviceId) {
    const device = devices.find((d) => d.id === deviceId);
    if (!device) return;

    // If the user was dragging, ignore accidental double-click.
    if (didMoveRef.current) return;

    setSelectedDeviceId(deviceId);
  }

  function onCanvasPointerDown() {
    setSelectedRoomId(null);
    // Don't clear selected device here; user might be interacting with it.
  }

  function addRoom() {
    const id = `room-${Date.now()}`;
    const roomNumber = rooms.length + 1;
    setRooms((prev) => [
      ...prev,
      {
        id,
        name: `Room ${roomNumber}`,
        x: 10,
        y: 10,
        w: 30,
        h: 18,
      },
    ]);
    setSelectedRoomId(id);
    setRenamingRoomId(id);
    setRoomNameDraft(`Room ${roomNumber}`);
  }

  function addDevice() {
    // Just place a new marker; wiring it to the devices list can come later.
    const id = `new-${Date.now()}`;
    setDevicePositions((prev) => ({ ...prev, [id]: { x: 50, y: 50 } }));
  }

  function getDeviceIconSrc(device) {
    if (!device) return null;
    const type = device.type;
    if (type === 'Light') return '/images/smart-bulb.png';
    if (type === 'Entertainment') return '/images/tv.png';
    if (type === 'Speaker') return '/images/alexa-dot.png';
    // Fallback for unknown types
    return '/images/sonos.png';
  }

  function handleTogglePower(deviceId) {
    setDevices((prev) => toggleDevicePower(prev, deviceId));
  }

  return (
    <div className="ProtoScreen" aria-label="Rooms screen">
      <div className="ProtoScreen__content">
        <div className="FloorPlan" aria-label="Interactive floor plan (mock)">
          <div className="FloorPlan__placeholder">
            <div className="FloorPlan__caption">Floor Plan</div>

            <div className="FloorPlan__actions">
              <button type="button" className="SmallButton" onClick={addRoom}>
                Add room
              </button>
              <button type="button" className="SmallButton" onClick={addDevice}>
                Add device
              </button>
            </div>
          </div>

          <div
            ref={canvasRef}
            className="FloorPlan__canvas"
            onPointerDown={onCanvasPointerDown}
            onPointerMove={onCanvasPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onPointerLeave={endDrag}
            role="application"
            aria-label="Floor plan canvas"
          >
            {rooms.map((r) => {
              const isSelected = r.id === selectedRoomId;
              const isRenaming = r.id === renamingRoomId;

              return (
                <div
                  key={r.id}
                  className={`RoomRect${isSelected ? ' RoomRect--selected' : ''}`}
                  style={{ left: `${r.x}%`, top: `${r.y}%`, width: `${r.w}%`, height: `${r.h}%` }}
                  onPointerDown={(e) => onRoomPointerDown(e, r.id)}
                  role="group"
                  aria-label={`Room: ${r.name}`}
                >
                  <div className="RoomRect__label" onDoubleClick={() => startRenameRoom(r)}>
                    {isRenaming ? (
                      <input
                        className="RoomRect__nameInput"
                        value={roomNameDraft}
                        onChange={(e) => setRoomNameDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') commitRename(r.id);
                          if (e.key === 'Escape') cancelRename();
                        }}
                        onPointerDown={(e) => {
                          // Don't start a move drag when clicking inside the input.
                          e.stopPropagation();
                        }}
                        onBlur={() => commitRename(r.id)}
                        autoFocus
                        aria-label="Room name"
                      />
                    ) : (
                      <button
                        type="button"
                        className="RoomRect__nameButton"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRoomId(r.id);
                        }}
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          startRenameRoom(r);
                        }}
                        aria-label={`Select ${r.name}. Double click to rename.`}
                        title="Double click to rename"
                      >
                        {r.name}
                      </button>
                    )}
                  </div>

                  {isSelected && (
                    <>
                      <button
                        type="button"
                        className="RoomRect__handle RoomRect__handle--nw"
                        aria-label="Resize room (top-left)"
                        onPointerDown={(e) => onRoomResizePointerDown(e, r.id, 'nw')}
                      />
                      <button
                        type="button"
                        className="RoomRect__handle RoomRect__handle--ne"
                        aria-label="Resize room (top-right)"
                        onPointerDown={(e) => onRoomResizePointerDown(e, r.id, 'ne')}
                      />
                      <button
                        type="button"
                        className="RoomRect__handle RoomRect__handle--sw"
                        aria-label="Resize room (bottom-left)"
                        onPointerDown={(e) => onRoomResizePointerDown(e, r.id, 'sw')}
                      />
                      <button
                        type="button"
                        className="RoomRect__handle RoomRect__handle--se"
                        aria-label="Resize room (bottom-right)"
                        onPointerDown={(e) => onRoomResizePointerDown(e, r.id, 'se')}
                      />
                    </>
                  )}
                </div>
              );
            })}

            {Object.entries(devicePositions).map(([id, pos]) => {
              const device = devices.find((d) => d.id === id);
              const statusTone = device?.isOn ? 'on' : 'off';
              const signalTone = device?.signal === 'Strong' ? 'good' : device?.signal === 'Weak' ? 'warning' : 'neutral';
              const iconSrc = getDeviceIconSrc(device);

              return (
                <button
                  key={id}
                  type="button"
                  className={`DeviceMarker DeviceMarker--${statusTone}${device ? '' : ' DeviceMarker--new'}`}
                  style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                  onPointerDown={(e) => onDevicePointerDown(e, id)}
                  onDoubleClick={() => onDeviceDoubleClick(id)}
                  // Single click should not open the modal anymore; it’s used for dragging.
                  onClick={(e) => {
                    // Prevent focusing styles on single-click if desired.
                    e.preventDefault();
                  }}
                  aria-label={device ? `${device.name} (${device.room})` : 'New device'}
                  title={device ? `${device.name} • ${device.signal}` : 'New device'}
                >
                  <span className="DeviceMarker__inner" aria-hidden="true">
                    {device && iconSrc ? (
                      <img className="DeviceMarker__icon" src={iconSrc} alt="" aria-hidden="true" />
                    ) : (
                      <span className="DeviceMarker__dot" aria-hidden="true" />
                    )}
                  </span>
                  {device && (
                    <span className={`DeviceMarker__badge DeviceMarker__badge--${signalTone}`} aria-hidden="true" />
                  )}
                  {device && <span className="DeviceMarker__text">{device.name}</span>}
                </button>
              );
            })}
          </div>
        </div>

        <div className="Legend" aria-label="Legend">
          <StatusDot tone="good">Strong signal</StatusDot>
          <StatusDot tone="warning">Weak signal</StatusDot>
          <StatusDot tone="off">Off</StatusDot>
        </div>
      </div>

      <DeviceModal
        device={selectedDevice}
        onClose={() => setSelectedDeviceId(null)}
        onTogglePower={handleTogglePower}
      />
    </div>
  );
}
