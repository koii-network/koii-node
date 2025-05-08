import { getTimeToNextRewardHumanReadable, countDecimals } from './utils'; // Replace with the correct path to your module

describe('utils', () => {
  describe('getTimeToNextRewardHumanReadable', () => {
    // Test for less than 1 minute
    it('should return < 1 minute for times less than 60000 milliseconds', () => {
      const result = getTimeToNextRewardHumanReadable(30000);
      expect(result).toEqual({ value: '< 1', format: 'minute' });
    });

    // Test for exactly 1 minute
    it('should return 1 minute for 60000 milliseconds', () => {
      const result = getTimeToNextRewardHumanReadable(60000);
      expect(result).toEqual({ value: '1', format: 'minute' });
    });

    // Test for more than 1 minute
    it('should return the correct number of minutes for times greater than 60000 milliseconds', () => {
      const result = getTimeToNextRewardHumanReadable(120000);
      expect(result).toEqual({ value: '2', format: 'minutes' });
    });

    // Test for more than 1 minute but not a whole number
    it('should round down to the nearest whole number of minutes', () => {
      const result = getTimeToNextRewardHumanReadable(125000);
      expect(result).toEqual({ value: '2', format: 'minutes' });
    });

    // Test for 0 milliseconds
    it('should return < 1 minute for 0 milliseconds', () => {
      const result = getTimeToNextRewardHumanReadable(0);
      expect(result).toEqual({ value: '< 1', format: 'minute' });
    });
  });

  describe('countDecimals', () => {
    it('should return 0 for integers', () => {
      expect(countDecimals(1)).toBe(0);
      expect(countDecimals(100)).toBe(0);
      expect(countDecimals(1234567890)).toBe(0);
    });

    it('should return the correct number of decimals for floating point numbers', () => {
      expect(countDecimals(1.2)).toBe(1);
      expect(countDecimals(0.123)).toBe(3);
      expect(countDecimals(123.456789)).toBe(6);
    });

    it('should count trailing zeros in the decimal part', () => {
      expect(countDecimals(1.2)).toBe(1);
      expect(countDecimals(0.123)).toBe(3);
      expect(countDecimals(123.456)).toBe(3);
    });

    it('should handle edge cases', () => {
      expect(countDecimals(0)).toBe(0); // 0 is technically an integer
      expect(countDecimals(0.0000001)).toBe(7);
      expect(countDecimals(1.0)).toBe(0);
    });
  });
});
