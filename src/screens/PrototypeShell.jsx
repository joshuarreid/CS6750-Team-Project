import React, { useMemo, useState } from 'react';
import Tabs from '../ui/Tabs';
import BottomNav from '../ui/BottomNav';
import RoomsScreen from './RoomsScreen';
import DevicesScreen from './DevicesScreen';
import SettingsScreen from './SettingsScreen';
import RoutinesScreen from './RoutinesScreen';

export default function PrototypeShell() {
  const homeTabs = useMemo(
    () => [
      { value: 'rooms', label: 'Rooms' },
      { value: 'devices', label: 'Devices' },
    ],
    []
  );

  const [bottomTab, setBottomTab] = useState('home');
  const [homeTab, setHomeTab] = useState('rooms');
  const [theme, setTheme] = useState('dark');

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, minHeight: 0, position: 'relative', overflow: 'hidden' }}>
        {bottomTab === 'home' && (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Tabs value={homeTab} onChange={setHomeTab} tabs={homeTabs} />
            <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
              {homeTab === 'rooms' ? <RoomsScreen /> : <DevicesScreen />}
            </div>
          </div>
        )}

        {bottomTab === 'routines' && <RoutinesScreen />}

        {bottomTab === 'settings' && (
          <SettingsScreen
            theme={theme}
            onToggleTheme={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
          />
        )}
      </div>

      <BottomNav value={bottomTab} onChange={setBottomTab} />
    </div>
  );
}
