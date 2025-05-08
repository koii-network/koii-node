import React from 'react';

import { Referral } from 'renderer/features/settings/components/GeneralSettings/Referral';
import { SectionHeader } from 'renderer/features/settings/components/SectionHeader';

export function ReferralsView() {
  return (
    <div>
      <SectionHeader title="Referrals" />
      <Referral />
    </div>
  );
}
