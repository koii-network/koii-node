import { TimeFormat } from 'models';

import { getCronTime } from './getCronTime';

describe('getCronTime function', () => {
  it('should return a valid cron expression for valid input', () => {
    const startTime: TimeFormat = '23:00:00';
    const days = [1, 2, 3];
    const result = getCronTime(startTime, days);
    expect(result).toBe('0 0 23 * * 1,2,3');
  });

  it('should return a cron expression with * for days when days array is empty', () => {
    const startTime: TimeFormat = '15:30:00';
    const days: number[] = [];
    const result = getCronTime(startTime, days);
    expect(result).toBe('0 30 15 * * *');
  });

  it('should throw an error for invalid startTime format', () => {
    const startTime = '25:00:00'; // Invalid hours
    const days = [1, 2, 3];
    expect(() => getCronTime(startTime as TimeFormat, days)).toThrow(
      'Invalid time format. Expected HH:MM:SS.'
    );
  });
});
