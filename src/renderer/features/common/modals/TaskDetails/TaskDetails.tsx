import React from 'react';

import { getKoiiFromRoe } from 'utils';

type PropsType = {
  owner: string;
  totalBounty: number;
  nodesParticipating: number;
  totalKoiiStaked: number;
  currentTopStake: number;
  myCurrentStake: number;
};

function PropertyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center mb-1 text-left justify-left">
      <div className="w-[200px]">{`${label}:`}</div>
      <div className="w-[200px] font-semibold text-left text-finnieEmerald-light">
        {value}
      </div>
    </div>
  );
}

export function TaskDetails({
  owner,
  totalBounty,
  nodesParticipating,
  totalKoiiStaked,
  currentTopStake,
  myCurrentStake,
}: PropsType) {
  return (
    <div>
      <PropertyRow label="Owner" value={owner} />
      <PropertyRow
        label="Total bounty"
        value={`${getKoiiFromRoe(totalBounty)} KOII`}
      />
      <PropertyRow
        label="Nodes participating"
        value={`${nodesParticipating}`}
      />
      <PropertyRow
        label="Total KOII staked"
        value={`${getKoiiFromRoe(totalKoiiStaked)} KOII`}
      />
      <PropertyRow
        label="Current top stake"
        value={`${getKoiiFromRoe(currentTopStake)} KOII`}
      />
      <PropertyRow
        label="My current stake"
        value={`${getKoiiFromRoe(myCurrentStake)} KOII`}
      />
    </div>
  );
}
