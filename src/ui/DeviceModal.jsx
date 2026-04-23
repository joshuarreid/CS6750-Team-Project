import React, { useMemo, useState } from 'react';
import './DeviceModal.css';

function Metric({ label, value, onClick, pressed }) {
  const clickable = typeof onClick === 'function';
  const Tag = clickable ? 'button' : 'div';

  return (
    <Tag
      className={`Metric${clickable ? ' Metric--clickable' : ''}${pressed ? ' Metric--pressed' : ''}`}
      type={clickable ? 'button' : undefined}
      onClick={onClick}
      aria-pressed={clickable ? Boolean(pressed) : undefined}
    >
      <div className="Metric__value">{value}</div>
      <div className="Metric__label">{label}</div>
    </Tag>
  );
}

export default function DeviceModal({ device, onClose, onTogglePower }) {
  const [brightness, setBrightness] = useState(device?.brightness ?? 60);

  // Keep internal slider in sync when a different device opens.
  React.useEffect(() => {
    setBrightness(device?.brightness ?? 60);
  }, [device?.id]);

  const subtitle = useMemo(() => {
    if (!device) return '';
    return device.room;
  }, [device]);

  if (!device) return null;

  return (
    <div className="Modal" role="dialog" aria-modal="true" aria-label="Device controls">
      <button className="Modal__backdrop" type="button" aria-label="Close" onClick={onClose} />

      <div className="Modal__sheet">
        <div className="Modal__header">
          <div className="Modal__icon" aria-hidden="true">
            ◎
          </div>
          <div className="Modal__titles">
            <div className="Modal__title">{device.name}</div>
            <div className="Modal__subtitle">{subtitle}</div>
          </div>
          <button className="Modal__close" type="button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="Modal__metrics">
          <Metric
            label="Power"
            value={device.isOn ? 'On' : 'Off'}
            pressed={device.isOn}
            onClick={() => onTogglePower?.(device.id)}
          />
          <Metric label="Brightness" value={device.brightness != null ? `${brightness}%` : '—'} />
          <Metric label="Signal" value={device.signal} />
        </div>

        {device.type === 'Light' && (
          <div className="Modal__section">
            <div className="Modal__sectionTitle">Brightness</div>
            <input
              className="Modal__slider"
              type="range"
              min={0}
              max={100}
              value={brightness}
              onChange={(e) => setBrightness(Number(e.target.value))}
              aria-label="Brightness"
            />
          </div>
        )}

        <div className="Modal__section">
          <div className="Modal__sectionTitle">More</div>
          <div className="Modal__links">
            <button type="button" className="Modal__link">Routine</button>
            <button type="button" className="Modal__link">Settings</button>
            <button type="button" className="Modal__link">Device Info</button>
          </div>
        </div>
      </div>
    </div>
  );
}
