type timeUnits = 'd' | 'h' | 'm' | 's';

export interface ParsedRoundTime {
  value: number;
  unit: 'd' | 'h' | 'm' | 's';
}

export function parseRoundTime(value: number): ParsedRoundTime {
  const days = value / (24 * 60 * 60 * 1000);
  if (days > 1) return { value: days, unit: 'd' };

  const hours = value / (60 * 60 * 1000);
  if (hours > 1) return { value: hours, unit: 'h' };

  const minutes = value / (60 * 1000);
  if (minutes > 1) return { value: minutes, unit: 'm' };

  const seconds = value / 1000;
  return { value: seconds, unit: 's' };
}

export function formatRoundTimeWithFullUnit({
  value,
  unit,
  useShortUnits,
}: {
  value: number;
  unit: 'd' | 'h' | 'm' | 's';
  useShortUnits?: boolean;
}): string {
  const shortToExt: Record<timeUnits, string> = {
    d: useShortUnits ? 'd' : 'day',
    h: useShortUnits ? 'h' : 'hour',
    m: useShortUnits ? 'm' : 'minute',
    s: useShortUnits ? 's' : 'second',
  };
  let formattedValue = '';

  if (unit === 'd') {
    const days = Math.floor(value);
    const remainingHours = Math.floor((value - days) * 24);
    formattedValue = `${days}${useShortUnits ? '' : ' '}${shortToExt.d}${
      days === 1 || useShortUnits ? '' : 's'
    }`;
    if (remainingHours > 0) {
      formattedValue += ` ${remainingHours}${useShortUnits ? '' : ' '}${
        shortToExt.h
      }${remainingHours === 1 || useShortUnits ? '' : 's'}`;
    }
  } else if (unit === 'h') {
    const hours = Math.floor(value);
    const remainingMinutes = Math.floor((value - hours) * 60);
    formattedValue = `${hours}${useShortUnits ? '' : ' '}${shortToExt.h}${
      hours === 1 || useShortUnits ? '' : 's'
    }`;
    if (remainingMinutes > 0) {
      formattedValue += ` ${remainingMinutes}${useShortUnits ? '' : ' '}${
        shortToExt.m
      }${remainingMinutes === 1 || useShortUnits ? '' : 's'}`;
    }
  } else if (unit === 'm') {
    const minutes = Math.floor(value);
    const seconds = Math.round((value - minutes) * 60);
    formattedValue = `${minutes}${useShortUnits ? '' : ' '}${shortToExt.m}${
      minutes === 1 || useShortUnits ? '' : 's'
    }`;
    if (seconds > 0) {
      formattedValue += ` ${seconds}${useShortUnits ? '' : ' '}${shortToExt.s}${
        seconds === 1 || useShortUnits ? '' : 's'
      }`;
    }
  } else {
    formattedValue = `${Math.floor(value)}${useShortUnits ? '' : ' '}${
      shortToExt[unit]
    }${Math.floor(value) === 1 || useShortUnits ? '' : 's'}`;
  }
  return formattedValue;
}
