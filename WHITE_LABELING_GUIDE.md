# White Labeling Guide

This guide explains how to customize the app with your organization's branding. Follow these instructions to create a branded version that maintains visual harmony while reflecting your identity.

## Setup Requirements

1. Create a `branding` folder at the root level of the application (same level as `src`, `release`, `assets`, etc.) containing:
   - `branding.json` - Configuration file
   - `logo.svg` - Your organization's logo (1:1 aspect ratio)

## Configuration Structure

The `branding.json` file should include:

    {
      "appName": "Your App Name",
      "onboardingTaskID": "Optional: Your Task ID",
      "colors": {
        // Color tokens (see below)
      }
    }

## Color System

Our theme uses an intuitive depth-based scale where higher numbers indicate darker colors. This ensures consistent visual hierarchy across the application.

### Required Color Tokens

#### Base Colors
- `base`: Your primary brand color
- `highlight`: Secondary accent color

#### Depth Scale (Darkest to Lightest)
- `depth-100`: Darkest (98% dark)
- `depth-90`: Very dark (90% dark)
- `depth-80`: Dark (80% dark)
- `depth-70`: Medium-dark (70% dark)
- `depth-60`: Medium (60% dark)
- `depth-50`: Medium-light (50% dark)
- `depth-40`: Light (40% dark)
- `depth-30`: Very light (30% dark)
- `depth-20`: Extra light (20% dark)
- `depth-10`: Lightest (10% dark)

#### Gradient Colors
- `gradient-start`: Top-left gradient color
- `gradient-end`: Bottom-right gradient color

## Design Guidelines

1. **Color Selection**
   - Start with your `base` brand color
   - Maintain consistent color temperature throughout the scale
   - Ensure sufficient contrast between adjacent depth levels
   - Test readability of text on all background colors

2. **Logo Requirements**
   - Provide an SVG file
   - Must be square (1:1 aspect ratio)
   - Should be clearly visible on dark backgrounds
   - Recommended size: 512x512px

3. **Optional Task ID**
   - Include `onboardingTaskID` to customize the onboarding experience
   - Must be a valid task ID from your organization

## Example Configuration

Here's a sample `branding.json` using Ferrari's branding:

    {
      "appName": "Ferrari Node",
      "onboardingTaskID": "E1EF4QTSMVXvVCGLu5iCBVhwvYdkUAq1qxvVg3e4xP5F",
      "colors": {
        "base": "#D40000",
        "depth-100": "#1A1A1A",
        "depth-90": "#2C2C2C",
        "depth-80": "#242424",
        "depth-70": "#242424",
        "depth-60": "#333333",
        "depth-50": "#4A0000",
        "depth-40": "#D40000",
        "depth-30": "#FF2800",
        "depth-20": "#FFEF00",
        "depth-10": "#FFB800",
        "highlight": "#FFA200",
        "gradient-start": "rgba(20, 20, 20, 1)",
        "gradient-end": "rgba(40, 0, 0, 0.95)"
      }
    }

## Validation

Before submitting:
1. Verify all required colors are defined
2. Check that your logo meets the specifications
3. Test the color scheme for accessibility
4. Ensure the `onboardingTaskID` is valid (if provided)

## Support

For additional assistance or to report issues, please contact our support team or open an issue in our repository.
