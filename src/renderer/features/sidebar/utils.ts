export const countDecimals = (value: number): number => {
  if (Math.floor(value) === value) return 0;

  const strValue = value.toString();

  if (strValue.indexOf('e') !== -1) {
    const parts = strValue.split('e');
    const e = parseInt(parts[1], 10);

    if (value < 1) {
      return Math.abs(e);
    }

    return 0;
  }

  return strValue.split('.')[1].length || 0;
};

type TimeResult = {
  value: string;
  format: 'minutes' | 'minute';
};

export function getTimeToNextRewardHumanReadable(
  milliseconds: number
): TimeResult {
  if (milliseconds < 60000) {
    return { value: '< 1', format: 'minute' };
  }

  const minutes = Math.floor(milliseconds / 60000);

  if (minutes === 1) {
    return { value: '1', format: 'minute' };
  } else {
    return { value: minutes.toString(), format: 'minutes' };
  }
}
