import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useQuery, useQueryClient } from 'react-query';

import { getMainAccountPublicKey, QueryKeys } from 'renderer/services';
import { ThemeType } from 'renderer/types/common';

interface BrandingConfig {
  appName: string;
  logo: string;
  primaryColor: string;
  colors?: {
    [key: string]: string;
  };
  gradients?: {
    main?: string;
  };
}

// Theme color definitions
const themeColors = {
  // Colors ordered by depth: depth-100 (darkest) to depth-10 (lightest)
  koii: {
    base: '#171753',
    'depth-100': '#171753',
    'depth-90': '#353570',
    'depth-70': '#373765',
    'depth-80': '#403c74',
    'depth-60': '#454580',
    'depth-50': '#4A4A73',
    'depth-40': '#60608f',
    'depth-30': '#8989C7',
    'depth-20': '#9BE7C4',
    'depth-10': '#BEF0ED',
    highlight: '#49CE8B',
    'gradient-start': 'rgba(3, 3, 50, 1)',
    'gradient-end': 'rgba(23, 23, 83, 0.85)',
  },
  vip: {
    base: '#B8860B',
    'depth-100': '#000000',
    'depth-90': '#17171F',
    'depth-70': '#24242E',
    'depth-80': '#2d2d3f',
    'depth-60': '#17171F',
    'depth-50': '#B8860B',
    'depth-40': '#fcbc4d70',
    'depth-30': '#FCBD4D',
    'depth-20': '#FFC78F',
    'depth-10': '#FFD700',
    highlight: '#FFC78F',
    'gradient-start': 'rgba(56, 56, 56, 0.7)',
    'gradient-mid': 'rgba(0, 0, 0, 1)',
    'gradient-end': 'rgba(0, 0, 0, 1)',
  },
};

const defaultGradients = {
  koii: {
    main: 'linear-gradient(135deg, var(--color-gradient-start) 0%, var(--color-gradient-end) 100%)',
  },
  vip: {
    main: 'linear-gradient(180deg, var(--color-gradient-start) 0%, var(--color-gradient-mid) 50%, var(--color-gradient-end) 100%)',
  },
};

const BRANDING_CACHE_KEY = 'cached-branding-config';

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  vipAccessLevel: 'vip-enabled' | 'vip-disabled' | 'no-access';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setLocalTheme] = useState<ThemeType>(() => {
    const savedTheme = localStorage.getItem('app-theme');
    return (savedTheme as ThemeType) || 'koii';
  });

  // Initialize brandingConfig from cache
  const [cachedBrandingConfig, setCachedBrandingConfig] =
    useState<BrandingConfig | null>(() => {
      const cached = localStorage.getItem(BRANDING_CACHE_KEY);
      return cached ? (JSON.parse(cached) as BrandingConfig) : null;
    });

  const { data: mainAccount } = useQuery(
    [QueryKeys.MainAccount],
    getMainAccountPublicKey
  );

  const { data: vipAccess } = useQuery(
    ['VipAccess'],
    () =>
      window.main.checkVipAccess().then((accessLevel) => {
        // Only update theme if user has VIP access and current theme isn't already VIP
        if (accessLevel === 'vip-enabled' && theme !== 'vip') {
          setLocalTheme('vip');
          localStorage.setItem('app-theme', 'vip');
        } else if (accessLevel !== 'vip-enabled' && theme === 'vip') {
          // If user lost VIP access, switch back to koii
          setLocalTheme('koii');
          localStorage.setItem('app-theme', 'koii');
        }
        return accessLevel;
      }),
    {
      enabled: !!mainAccount,
      refetchInterval: 20000,
    }
  );

  const queryClient = useQueryClient();

  // Fetch fresh branding config
  const { data: brandingConfig } = useQuery(
    'brandingConfig',
    () => window.main.getBrandingConfig(),
    {
      onSuccess: (newConfig) => {
        if (newConfig) {
          localStorage.setItem(BRANDING_CACHE_KEY, JSON.stringify(newConfig));
          setCachedBrandingConfig(newConfig);
        } else {
          localStorage.removeItem(BRANDING_CACHE_KEY);
          setCachedBrandingConfig(null);
        }
      },
    }
  );

  // Use cached config while loading fresh config
  const effectiveBrandingConfig = brandingConfig || cachedBrandingConfig;

  // Update theme in both localStorage and DB
  const setTheme = useCallback(
    async (newTheme: ThemeType) => {
      if (!mainAccount) return;

      localStorage.setItem('app-theme', newTheme);
      setLocalTheme(newTheme);

      await window.main.toggleTheme(mainAccount, newTheme);
      queryClient.invalidateQueries(['VipAccess', mainAccount]);
    },
    [mainAccount, queryClient]
  );

  useEffect(() => {
    const root = document.documentElement;
    let colors = themeColors[theme];
    let gradients = defaultGradients[theme];

    // Override with branding colors and gradients if available
    if (effectiveBrandingConfig && theme === 'koii') {
      colors = {
        ...colors,
        ...(effectiveBrandingConfig.colors || {}),
      };

      gradients = {
        ...defaultGradients[theme],
        ...(effectiveBrandingConfig.gradients || {}),
      };

      if (
        effectiveBrandingConfig.colors?.['gradient-start'] &&
        effectiveBrandingConfig.colors?.['gradient-end']
      ) {
        gradients.main = `linear-gradient(135deg, ${effectiveBrandingConfig.colors['gradient-start']} 0%, ${effectiveBrandingConfig.colors['gradient-end']} 100%)`;
      }
    }

    // Set colors
    Object.entries(colors || {}).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
      if (value.startsWith('#')) {
        const rgbValue = hexToRgb(value);
        if (rgbValue) {
          root.style.setProperty(`--color-${key}-rgb`, rgbValue);
        }
      }
    });

    // Set gradients
    Object.entries(gradients || {}).forEach(([key, value]) => {
      root.style.setProperty(`--gradient-${key}`, value);
    });
  }, [theme, effectiveBrandingConfig]);

  // Helper function to convert hex to RGB
  const hexToRgb = (hex: string): string | null => {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    const hexValue = hex.replace(
      shorthandRegex,
      (_, r, g, b) => r + r + g + g + b + b
    );

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexValue);
    return result
      ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(
          result[3],
          16
        )}`
      : null;
  };

  const contextValue = useMemo(
    () => ({ theme, setTheme, vipAccessLevel: vipAccess || 'no-access' }),
    [theme, setTheme, vipAccess]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
