import { parse, format, add } from 'date-fns';

/**
 * Add two time strings in 'HH:mm:ss' format.
 *
 * @param time - The base time string in 'HH:mm:ss' format.
 * @param timeToAdd - The time string to add in 'HH:mm:ss' format.
 * @returns The resulting time string in 'HH:mm:ss' format.
 */
export function addTime(time: string, timeToAdd: string): string {
  const parsedTime = parse(time, 'HH:mm:ss', new Date());
  const parsedTimeToAdd = parse(timeToAdd, 'HH:mm:ss', new Date());

  const hoursToAdd = parsedTimeToAdd.getHours();
  const minutesToAdd = parsedTimeToAdd.getMinutes();
  const secondsToAdd = parsedTimeToAdd.getSeconds();

  const newTime = add(parsedTime, {
    hours: hoursToAdd,
    minutes: minutesToAdd,
    seconds: secondsToAdd,
  });

  const newTimeString = format(newTime, 'HH:mm:ss');

  return newTimeString;
}
