import React from 'react';

export function KoiiBalancePlaceholder() {
  return (
    <div className="animate-pulse">
      <div className="flex flex-row items-center gap-2">
        <div className="inline-block w-10 h-10 mr-2 rounded-full bg-purple-6" />
        <div className="w-24 h-8 rounded-md bg-purple-6" />
      </div>
      <div className="w-32 h-6 mt-2 rounded-md bg-purple-6 ml-14" />
    </div>
  );
}
