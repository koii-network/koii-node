import { set, isPast, addDays } from 'date-fns';

export function getTimeUntilScheduleStarts(
  startTime: string,
  days: number[]
): string {
  const [hours, minutes] = startTime.split(':').map(Number);
  const now = new Date();

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < 14; i++) {
    const targetDay = (now.getDay() + i) % 7;
    if (days.includes(targetDay)) {
      const targetDate = addDays(now, i);
      const eventDate = set(targetDate, {
        hours,
        minutes,
        seconds: 0,
        milliseconds: 0,
      });

      // If the eventDate is in the past, skip to the next possible day
      if (isPast(eventDate) && i === 0) {
        // eslint-disable-next-line no-continue
        continue;
      }

      const diffInMilliseconds = eventDate.getTime() - now.getTime();
      const diffInDays = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24));
      const remainderHours = diffInMilliseconds % (1000 * 60 * 60 * 24);
      const diffInHours = Math.floor(remainderHours / (1000 * 60 * 60));
      const remainderMinutes = remainderHours % (1000 * 60 * 60);
      const diffInMinutes = Math.floor(remainderMinutes / (1000 * 60));
      const remainderSeconds = remainderMinutes % (1000 * 60);
      const diffInSeconds = Math.floor(remainderSeconds / 1000);

      let timeUntilStart = '';
      if (diffInDays > 0) timeUntilStart += `${diffInDays}d `;
      if (diffInHours > 0 || diffInDays > 0)
        timeUntilStart += `${diffInHours}h `;
      if (diffInMinutes > 0 || diffInHours > 0 || diffInDays > 0)
        timeUntilStart += `${diffInMinutes}m `;
      if (
        diffInSeconds > 0 ||
        diffInMinutes > 0 ||
        diffInHours > 0 ||
        diffInDays > 0
      )
        timeUntilStart += `${diffInSeconds}s`;

      return timeUntilStart.trim();
    }
  }

  return 'No event scheduled';
}
