import { ExternalNotification } from '../types';

import { isExternalNotification } from './isExternalNotification';

describe('isExternalNotification', () => {
  it('should return true for a valid ExternalNotification object', () => {
    const validNotification: ExternalNotification = {
      id: '1',
      text: 'Test Notification',
      title: 'Test',
      type: 'SUCCESS', // Assuming 'info' is a valid NotificationVariantType
      ctaLink: 'https://example.com',
      ctaText: 'Click Here',
    };
    expect(isExternalNotification(validNotification)).toBe(true);
  });

  it('should return false for an object missing required properties', () => {
    const invalidNotification = {
      id: '1',
      text: 'Test Notification',
      // title is missing
      type: 'info',
      ctaLink: 'https://example.com',
      // ctaText is missing
    };
    expect(isExternalNotification(invalidNotification)).toBe(false);
  });

  it('should return true for a valid ExternalNotification object with optional properties', () => {
    const validNotificationWithOptional: ExternalNotification = {
      id: '2',
      text: 'Another Test Notification',
      title: 'Another Test',
      type: 'WARNING',
      ctaLink: 'https://example.org',
      ctaText: 'Learn More',
      persist: true,
      conditions: {
        version: '1.0.0',
        excludeAppVersions: ['0.9.9'],
      },
    };
    expect(isExternalNotification(validNotificationWithOptional)).toBe(true);
  });

  it('should return false for an object with invalid types for properties', () => {
    const invalidNotificationTypes = {
      id: 1, // Should be a string
      text: 'Invalid Type Notification',
      title: 'Invalid Type',
      type: 'error',
      ctaLink: 'https://example.net',
      ctaText: 'Act Now',
      persist: 'yes', // Should be a boolean
    };
    expect(isExternalNotification(invalidNotificationTypes)).toBe(false);
  });

  it('should return false for an object with invalid conditions property', () => {
    const invalidConditionsNotification = {
      id: '3',
      text: 'Invalid Conditions Notification',
      title: 'Invalid Conditions',
      type: 'info', // Assuming 'info' is a valid NotificationVariantType
      ctaLink: 'https://example.com',
      ctaText: 'Click Here',
      conditions: {
        version: 1.0, // Should be a string
        excludeAppVersions: ['1.0', 2.0], // All elements should be strings
      },
    };
    expect(isExternalNotification(invalidConditionsNotification)).toBe(false);
  });
});
