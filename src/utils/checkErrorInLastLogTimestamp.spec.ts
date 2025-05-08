import { checkErrorInLastLogTimestamp } from '.';

describe('checkErrorInLastLogTimestamp', () => {
  it('should return true if the last log entry contains "error"', () => {
    const logs = `
    [Tue, May 23, 2023, 10:51:05 AM] First log entry
    [Tue, May 23, 2023, 10:51:06 AM] Second log entry
    [Tue, May 23, 2023, 10:51:07 AM] Error: something went wrong
    `;

    expect(checkErrorInLastLogTimestamp(logs)).toBe(true);
  });

  it('should return false if there are no log entries containing "error"', () => {
    const logs = `
    [Tue, May 23, 2023, 10:51:05 AM] First log entry
    [Tue, May 23, 2023, 10:51:06 AM] Second log entry
    [Tue, May 23, 2023, 10:51:07 AM] Third log entry
    `;

    expect(checkErrorInLastLogTimestamp(logs)).toBe(false);
  });

  it('should return false if the last log entry does not contain "error", but another previous one does', () => {
    const logs = `
    [Tue, May 23, 2023, 10:51:05 AM] First log entry
    [Tue, May 23, 2023, 10:51:06 AM] Second log entry
    [Tue, May 23, 2023, 10:51:07 AM] Error: something went wrong
    [Tue, May 23, 2023, 10:51:08 AM] Fourth log entry
    `;

    expect(checkErrorInLastLogTimestamp(logs)).toBe(false);
  });

  it('should return false if there are no timestamped logs', () => {
    const logs = 'No timestamped logs here';

    expect(checkErrorInLastLogTimestamp(logs)).toBe(false);
  });

  it('should be case insensitive when checking for "error"', () => {
    const logs = `
    [Tue, May 23, 2023, 10:51:05 AM] First log entry
    [Tue, May 23, 2023, 10:51:06 AM] Second log entry
    [Tue, May 23, 2023, 10:51:07 AM] ERROR: something went wrong
    `;

    expect(checkErrorInLastLogTimestamp(logs)).toBe(true);
  });
});
