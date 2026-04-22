import React from 'react';
import './BottomNav.css';

function NavIcon({ name }) {
  // Simple inline glyphs to avoid adding an icon dependency.
  if (name === 'home') return <span aria-hidden="true">⌂</span>;
  if (name === 'routines') return <span aria-hidden="true">⟲</span>;
  if (name === 'settings') return <span aria-hidden="true">⚙</span>;
  return <span aria-hidden="true">•</span>;
}

export default function BottomNav({ value, onChange }) {
  const items = [
    { value: 'home', label: 'Home' },
    { value: 'routines', label: 'Routines' },
    { value: 'settings', label: 'Settings' },
  ];

  return (
    <nav className="BottomNav" aria-label="Bottom navigation">
      {items.map((it) => {
        const selected = it.value === value;
        return (
          <button
            key={it.value}
            type="button"
            className={`BottomNav__item${selected ? ' BottomNav__item--active' : ''}`}
            aria-current={selected ? 'page' : undefined}
            onClick={() => onChange(it.value)}
          >
            <span className="BottomNav__icon" aria-hidden="true">
              <NavIcon name={it.value} />
            </span>
            <span className="BottomNav__label">{it.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
