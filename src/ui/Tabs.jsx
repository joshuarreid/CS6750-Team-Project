import React from 'react';
import './Tabs.css';

export default function Tabs({ value, onChange, tabs }) {
  return (
    <div className="Tabs" role="tablist" aria-label="Primary tabs">
      {tabs.map((t) => {
        const selected = t.value === value;
        return (
          <button
            key={t.value}
            type="button"
            role="tab"
            aria-selected={selected}
            className={`Tabs__tab ${selected ? 'Tabs__tab--active' : ''}`}
            onClick={() => onChange(t.value)}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

