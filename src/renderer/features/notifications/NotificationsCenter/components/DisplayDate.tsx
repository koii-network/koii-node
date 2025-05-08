import { format } from 'date-fns';
import React from 'react';

export function DisplayDate({ dateInMs }: { dateInMs: number | string }) {
  if (!dateInMs) return null;
  const date = new Date(dateInMs);
  const formattedDate = format(date, 'dd MMM yyyy, HH:mm:ss');
  if (formattedDate === 'Invalid Date' || !formattedDate) {
    return <div className="text-xs text-white">Invalid Date</div>;
  }
  return <div className="text-xs text-white">{formattedDate}</div>;
}
