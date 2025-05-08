import React from 'react';

type PropsType = {
  title: string;
};

export function SectionHeader({ title }: PropsType) {
  return (
    <div className="mb-4 text-2xl leading-10 text-white border-b-2 border-finnieTeal">
      {title}
    </div>
  );
}
