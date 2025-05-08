import React from 'react';

export function CoinListPlaceholder() {
  return (
    <div className="flex flex-row items-start justify-center animate-pulse">
      <div className="flex min-w-[360px] ml-2 gap-2 mt-2 justify-center">
        {[...Array(7)].map((_, index) => (
          <div key={index} className="w-10 h-10 rounded-full bg-purple-6" />
        ))}
      </div>
    </div>
  );
}
