import { getShouldDisplayNotification } from './getShouldDisplayNotification';

describe('getShouldDisplayNotification', () => {
  it('should return true if no conditions are provided', () => {
    const result = getShouldDisplayNotification();
    expect(result).toBe(true);
  });

  it('should return true if no requiredData is provided', () => {
    const result = getShouldDisplayNotification({});
    expect(result).toBe(true);
  });

  it('should return true if no conditions or requiredData are provided', () => {
    const result = getShouldDisplayNotification({}, { appVersion: '1.0.0' });
    expect(result).toBe(true);
  });

  it('should return false if the app version does not match the condition', () => {
    const result = getShouldDisplayNotification(
      { version: '2.0.0' },
      { appVersion: '1.0.0' }
    );
    expect(result).toBe(false);
  });

  it('should return true if the app version matches the condition', () => {
    const result = getShouldDisplayNotification(
      { version: '1.0.0' },
      { appVersion: '1.0.0' }
    );
    expect(result).toBe(true);
  });

  it('should return false if the app version is excluded', () => {
    const result = getShouldDisplayNotification(
      { excludeAppVersions: ['1.0.0', '1.2.0'] },
      { appVersion: '1.0.0' }
    );
    expect(result).toBe(false);
  });

  it('should return true if the app version is not excluded', () => {
    const result = getShouldDisplayNotification(
      { excludeAppVersions: ['1.0.0', '1.2.0'] },
      { appVersion: '1.1.0' }
    );
    expect(result).toBe(true);
  });
});
