import React, { useMemo, useState, useEffect } from 'react';
import './prototypeScreens.css';
import { loadRoutines, saveRoutines, formatTimeLabel } from '../state/routinesStorage';

function RoutineModal({ isOpen, onClose, devices, onSave }) {
  const [step, setStep] = useState(1);
  const [deviceId, setDeviceId] = useState('');
  const [action, setAction] = useState('Turn on');
  const [time, setTime] = useState('07:00');

  useEffect(() => {
    if (!isOpen) return;
    setStep(1);
    setDeviceId(devices[0]?.id ?? '');
    setAction('Turn on');
    setTime('07:00');
  }, [isOpen, devices]);

  if (!isOpen) return null;

  const selectedDevice = devices.find((d) => d.id === deviceId) ?? null;

  return (
    <div className="RoutineModal" role="dialog" aria-modal="true" aria-label="Create routine">
      <button className="RoutineModal__backdrop" type="button" aria-label="Close" onClick={onClose} />

      <div className="RoutineModal__sheet">
        <div className="RoutineModal__header">
          <div>
            <div className="RoutineModal__title">Create routine</div>
            <div className="RoutineModal__subtitle">
              Step {step} of 3
              {selectedDevice ? ` • ${selectedDevice.name}` : ''}
            </div>
          </div>
          <button className="RoutineModal__close" type="button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        {step === 1 && (
          <div className="RoutineModal__section">
            <div className="RoutineModal__sectionTitle">Select device</div>
            <div className="RoutinePickList" role="listbox" aria-label="Device list">
              {devices.map((d) => {
                const selected = d.id === deviceId;
                return (
                  <button
                    key={d.id}
                    type="button"
                    className={`RoutinePickItem${selected ? ' RoutinePickItem--active' : ''}`}
                    role="option"
                    aria-selected={selected}
                    onClick={() => setDeviceId(d.id)}
                  >
                    <div className="RoutinePickItem__title">{d.name}</div>
                    <div className="RoutinePickItem__sub">{d.room}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="RoutineModal__section">
            <div className="RoutineModal__sectionTitle">Choose action</div>
            <div className="RoutineActionsGrid" role="group" aria-label="Action choices">
              {['Turn on', 'Turn off'].map((a) => {
                const selected = a === action;
                return (
                  <button
                    key={a}
                    type="button"
                    className={`RoutineActionChip${selected ? ' RoutineActionChip--active' : ''}`}
                    onClick={() => setAction(a)}
                  >
                    {a}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="RoutineModal__section">
            <div className="RoutineModal__sectionTitle">Schedule time</div>
            <div className="RoutineTimeRow">
              <input
                className="RoutineTimeRow__input"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                aria-label="Routine time"
              />
              <div className="RoutineTimeRow__label" aria-label="Selected time">
                {formatTimeLabel(time)}
              </div>
            </div>

            <div className="RoutineModal__preview" aria-label="Routine preview">
              <div className="RoutineModal__previewTitle">Preview</div>
              <div className="RoutineModal__previewBody">
                {action} <strong>{selectedDevice?.name ?? 'Device'}</strong> at <strong>{formatTimeLabel(time)}</strong>
              </div>
            </div>
          </div>
        )}

        <div className="RoutineModal__footer">
          <button
            type="button"
            className="SmallButton"
            onClick={() => (step === 1 ? onClose() : setStep((s) => Math.max(1, s - 1)))}
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </button>

          {step < 3 ? (
            <button
              type="button"
              className="SmallButton SmallButton--primary"
              onClick={() => setStep((s) => Math.min(3, s + 1))}
              disabled={!deviceId}
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              className="SmallButton SmallButton--primary"
              onClick={() => {
                onSave({
                  id: `rt-${Date.now()}`,
                  enabled: true,
                  deviceId,
                  action,
                  time,
                  createdAt: Date.now(),
                });
                onClose();
              }}
              disabled={!deviceId || !time}
            >
              Save
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RoutinesScreen() {
  const devices = useMemo(
    () => [
      { id: 'ceiling', name: 'Ceiling Light', room: 'Living Room', type: 'Light' },
      { id: 'tv', name: 'TV', room: 'Living Room', type: 'Entertainment' },
      { id: 'bedroom', name: 'Bedroom Light', room: 'Bedroom', type: 'Light' },
      { id: 'echo', name: 'Echo Dot', room: 'Bedroom', type: 'Speaker' },
      { id: 'kitchen', name: 'Kitchen Light', room: 'Kitchen', type: 'Light' },
      { id: 'plug', name: 'Smart Plug', room: 'Kitchen', type: 'Outlet' },
      { id: 'thermostat', name: 'Thermostat', room: 'Entry', type: 'Thermostat' },
      { id: 'cam', name: 'Front Door Cam', room: 'Entry', type: 'Camera' },
      { id: 'bath', name: 'Bath Light', room: 'Bathroom', type: 'Light' },
    ],
    []
  );

  const devicesById = useMemo(() => {
    const map = {};
    for (const d of devices) map[d.id] = d;
    return map;
  }, [devices]);

  const [routines, setRoutines] = useState(() => loadRoutines());
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    saveRoutines(routines);
  }, [routines]);

  return (
    <div className="ProtoScreen" aria-label="Routines screen">
      <div className="ProtoScreen__content">
        <div className="SectionTitle">Routines</div>

        <div className="RoutineActions">
          <button type="button" className="SmallButton SmallButton--primary" onClick={() => setIsCreating(true)}>
            Create routine
          </button>
        </div>

        {routines.length === 0 ? (
          <div className="RoutineEmpty" aria-label="No routines">
            <div className="RoutineEmpty__title">No routines yet</div>
            <div className="RoutineEmpty__sub">Create one to schedule device actions.</div>
          </div>
        ) : (
          <div className="RoutineCard" role="list" aria-label="Routine list">
            {routines.map((rt, idx) => {
              const deviceName = devicesById[rt.deviceId]?.name ?? 'Device';
              const subtitle = `${rt.action} • ${deviceName} • ${formatTimeLabel(rt.time)}`;
              return (
                <React.Fragment key={rt.id}>
                  <div className="RoutineRow" role="listitem" aria-label={`Routine ${idx + 1}`}>
                    <div>
                      <div className="RoutineRow__title">{rt.enabled ? 'Enabled' : 'Disabled'}</div>
                      <div className="RoutineRow__sub">{subtitle}</div>
                    </div>
                    <div className="RoutineRow__right">
                      <label className="RoutineToggle">
                        <input
                          type="checkbox"
                          checked={!!rt.enabled}
                          onChange={() =>
                            setRoutines((prev) => prev.map((r) => (r.id === rt.id ? { ...r, enabled: !r.enabled } : r)))
                          }
                          aria-label="Enable routine"
                        />
                        <span className="RoutineToggle__ui" aria-hidden="true" />
                      </label>
                      <button
                        type="button"
                        className="RoutineDelete"
                        onClick={() => setRoutines((prev) => prev.filter((r) => r.id !== rt.id))}
                        aria-label="Delete routine"
                        title="Delete"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                  {idx < routines.length - 1 && <div className="RoutineCard__divider" aria-hidden="true" />}
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>

      <RoutineModal
        isOpen={isCreating}
        onClose={() => setIsCreating(false)}
        devices={devices}
        onSave={(rt) => setRoutines((prev) => [rt, ...prev])}
      />
    </div>
  );
}
