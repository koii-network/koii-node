import { useState } from 'react';
// import { useQuery } from 'react-query';

export const useBrandingConfig = () => {
  // const { data: brandingConfig } = useQuery(
  //   'brandingConfig',
  //   window.main.getBrandingConfig
  // );

  // Get the cached branding config
  const [cachedBrandingConfig] = useState<{
    appName: string;
    logo: string;
  } | null>(() => {
    const cached = localStorage.getItem('cached-branding-config');
    return cached
      ? (JSON.parse(cached) as { appName: string; logo: string })
      : null;
  });

  return cachedBrandingConfig;
};
