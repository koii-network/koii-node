import React from 'react';

import OrcaLogo from 'assets/svgs/Orca-Logo.png';

import { AddonItem } from './AddonItem';

const ADDONS = [
  {
    name: 'ORCA Node Operator',
    description:
      'Use ORCA to earn extra rewards with AI tasks, right from your computer! Orca tasks run in a sandbox that keeps them separate from your computer, making them more secure. In order to install the Orca software, we require temporary admin access.',
    logo: OrcaLogo,
    url: 'https://docs.chaindeck.io/orcaNode',
  },
];

export function AddOnsList() {
  return (
    <div className="m-4 mt-0">
      <div className="mb-4 text-2xl font-semibold text-left">Add-ons</div>
      <div className="mb-4">
        Add-ons are programs from our partners that you can download to make
        your node more powerful so you can earn more. All add-ons in this list
        have been vetted by the Koii team.
      </div>
      <div className="pr-4">
        {ADDONS.map((addon) => {
          return (
            <AddonItem
              key={addon.name}
              name={addon.name}
              description={addon.description}
              logo={addon.logo}
              url={addon.url}
            />
          );
        })}
      </div>
    </div>
  );
}
