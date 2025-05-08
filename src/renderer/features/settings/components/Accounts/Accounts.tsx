import React from 'react';

import { SectionHeader } from '../SectionHeader';

import { AccountsTable } from './AccountsTable';

export function Accounts() {
  return (
    <div className="flex flex-col h-full text-white">
      <SectionHeader title="Wallet" />
      <AccountsTable />
    </div>
  );
}
