import React from 'react';

export function AccountBalancesHeaderPlaceholder() {
  return (
    <div className="flex items-center gap-4 w-[320px] animate-pulse">
      <div className="bg-purple-6 h-6 w-[100px] rounded-md mr-2" />
      <div className="flex items-center justify-center gap-3">
        <div className="w-auto h-[30px] rounded-lg flex items-center gap-[3px] max-w-[320px] bg-purple-6 px-2">
          <div className="w-full h-4 rounded-md bg-purple-6" />
          <div className="bg-purple-6 h-6.5 w-6.5 rounded-md" />
        </div>
      </div>
    </div>
  );
}
