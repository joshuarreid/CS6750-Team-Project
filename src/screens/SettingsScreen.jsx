import React from 'react';
import './prototypeScreens.css';

export default function SettingsScreen({ theme, onToggleTheme }) {
  return (
    <div className="ProtoScreen" aria-label="Settings screen">
      <div className="ProtoScreen__content">
        <div className="SectionTitle">Appearance</div>
        <div className="SettingsCard">
          <div className="SettingsRow">
            <div>
              <div className="SettingsRow__title">Theme</div>
              <div className="SettingsRow__sub">Switch between light and dark.</div>
            </div>
            <button type="button" className="SmallButton" onClick={onToggleTheme}>
              {theme === 'light' ? 'Light' : 'Dark'}
            </button>
          </div>
        </div>

        <div className="SectionTitle" style={{ marginTop: 18 }}>
          Account
        </div>
        <div className="SettingsCard">
          <div className="SettingsRow">
            <div>
              <div className="SettingsRow__title">Home</div>
              <div className="SettingsRow__sub">My Home</div>
            </div>
            <span className="SettingsRow__chev" aria-hidden="true">
              ›
            </span>
          </div>
          <div className="SettingsRow">
            <div>
              <div className="SettingsRow__title">Notifications</div>
              <div className="SettingsRow__sub">Off</div>
            </div>
            <span className="SettingsRow__chev" aria-hidden="true">
              ›
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
