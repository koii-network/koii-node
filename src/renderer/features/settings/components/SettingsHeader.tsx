import React, { useCallback } from 'react';

import { Tab } from '../types';

const tabs = [
  {
    value: Tab.MainSettings,
    label: 'Settings',
  },
  {
    value: Tab.AccountsTable,
    label: 'Key Management',
  },
  {
    value: Tab.TaskSettings,
    label: 'Task Extensions',
  },
  {
    value: Tab.TasksScheduler,
    label: 'Automate Node',
  },
];

type PropsType = {
  onTabChange: (tab: Tab) => void;
  activeTab: Tab;
};

export function SettingsHeader({ onTabChange, activeTab }: PropsType) {
  const isActiveTab = useCallback(
    (tabName: Tab) =>
      activeTab === tabName ? 'border-finnieTeal border-b-2 bg-green-dark' : '',
    [activeTab]
  );

  return (
    <div className="flex items-center pl-10 mb-6 text-white h-13 bg-finnieTeal bg-opacity-30 gap-7">
      <div className="flex items-center gap-4">
        {tabs.map(({ value: tabName, label }) => {
          const isActive = activeTab === tabName;

          return (
            <button
              key={tabName}
              onClick={() => onTabChange(tabName)}
              className={`h-13 px-6 pt-1 cursor-pointer transition-colors duration-200 ease-in-out ${
                isActive
                  ? ''
                  : 'hover:bg-finnieTeal hover:bg-opacity-20 animated-border'
              } ${isActiveTab(tabName)}`}
            >
              <span
                className={`transition-all duration-200 ease-in-out ${
                  isActive ? 'font-bold' : ''
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
