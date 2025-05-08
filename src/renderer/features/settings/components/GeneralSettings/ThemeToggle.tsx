import React from 'react';

import { useTheme } from 'renderer/theme/ThemeContext';

import { SettingSwitch } from '../MainSettings/SettingSwitch';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex flex-col gap-5">
      <SettingSwitch
        id="theme-toggle"
        isLoading={false}
        isChecked={theme === 'vip'}
        onSwitch={() => setTheme(theme === 'vip' ? 'koii' : 'vip')}
        labels={['KOII', 'VIP']}
      />
    </div>
  );
}
