import { TimeFormat } from 'models';
/**
 * @dev The standard cron format is a string of five space-separated fields (*****),
 * but used "cron" package requires six fields (******) with seconds as the first field.
 */
export const getCronTime = (time: TimeFormat, days: number[]): string => {
  // Regular expression for validating HH:MM:SS format
  const timeFormat = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;

  // Check if time is in HH:MM:SS format
  if (!timeFormat.test(time)) {
    throw new Error('Invalid time format. Expected HH:MM:SS.');
  }
  if (!days.every((day) => day >= 0 && day <= 7)) {
    throw new Error('Invalid days array. Expected values between 0 and 7.');
  }

  const [hours, minutes] = time.split(':').map(Number);
  const cronDays = days.length > 0 ? days.join(',') : '*';
  const seconds = 0; // Always set seconds to 0
  return `${seconds} ${minutes} ${hours} * * ${cronDays}`;
};
