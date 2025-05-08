export const checkErrorInLastLogTimestamp = (taskLogs: string) => {
  const logEntries = taskLogs.match(/\[(.*?)\](.*?)(?=\[\w+|$)/gs);
  if (!logEntries) {
    console.log('No timestamped logs found');
    return false;
  }
  const lastLogEntry = logEntries[logEntries.length - 1];
  const hasError = lastLogEntry.toLowerCase().includes('error');
  return hasError;
};
