import DOMPurify from 'dompurify';
import React, { ComponentProps, FC, useMemo, useState } from 'react';
import { useQuery } from 'react-query';

import KoiiLogo from 'assets/svgs/koii-logo-white.svg';

const BRAND_LOGO_CACHE_KEY = 'cached-brand-logo';

export const useBrandLogo = (
  Logo?: React.FunctionComponent<React.SVGAttributes<SVGElement>>
) => {
  const { data: brandingConfig } = useQuery(
    'brandingConfig',
    window.main.getBrandingConfig,
    {
      onSuccess: (config) => {
        if (!config) {
          localStorage.removeItem(BRAND_LOGO_CACHE_KEY);
          setCachedLogo(null);
        }
      },
    }
  );

  // Initialize from cache first
  const [cachedLogo, setCachedLogo] = useState<string | null>(() => {
    const cached = localStorage.getItem(BRAND_LOGO_CACHE_KEY);
    return cached || null;
  });

  const { data: brandLogo } = useQuery('brandLogo', window.main.getBrandLogo, {
    enabled: !!brandingConfig,
    onSuccess: (newLogo) => {
      if (newLogo) {
        localStorage.setItem(BRAND_LOGO_CACHE_KEY, newLogo);
        setCachedLogo(newLogo);
      } else {
        localStorage.removeItem(BRAND_LOGO_CACHE_KEY);
        setCachedLogo(null);
      }
    },
  });

  // Use cached logo while loading fresh logo
  const effectiveLogo = brandLogo || cachedLogo;

  return useMemo(() => {
    if (effectiveLogo) {
      // Configure DOMPurify with comprehensive SVG options
      const sanitizedSvg = DOMPurify.sanitize(effectiveLogo, {
        USE_PROFILES: { svg: true },
        ADD_TAGS: [
          'svg',
          'path',
          'g',
          'circle',
          'rect',
          'line',
          'polyline',
          'polygon',
          'ellipse',
          'text',
          'tspan',
          'defs',
          'pattern',
          'mask',
          'clipPath',
          'use',
          'style',
        ],
        ADD_ATTR: [
          // Core SVG attributes
          'width',
          'height',
          'viewBox',
          'preserveAspectRatio',
          // Namespaces
          'xmlns',
          'xmlns:*',
          'xml:*',
          // Common attributes
          'id',
          'class',
          'style',
          // Positioning and dimensions
          'x',
          'y',
          'x1',
          'y1',
          'x2',
          'y2',
          'cx',
          'cy',
          'r',
          'rx',
          'ry',
          // Path and shape
          'd',
          'points',
          'transform',
          'transform-origin',
          // Presentation attributes
          'fill',
          'fill-*',
          'stroke',
          'stroke-*',
          'color',
          'opacity',
          'visibility',
          // Other common attributes
          'offset',
          'stop-color',
          'stop-opacity',
          'font-*',
          'text-*',
          'clip-*',
          'mask',
          'filter',
          'marker-*',
          'patternUnits',
        ],
        FORBID_TAGS: ['script', 'foreignObject'],
        FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
      });

      try {
        // Extract just the SVG content
        const svgContent = sanitizedSvg.match(/<svg[^>]*>[\s\S]*<\/svg>/i)?.[0];

        if (!svgContent) {
          console.warn('Invalid SVG content after sanitization');
          return Logo || KoiiLogo;
        }

        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');

        // Check for parsing errors
        // eslint-disable-next-line @cspell/spellchecker
        const parserError = svgDoc.querySelector('parsererror');
        if (parserError) {
          console.warn('SVG parsing error:', parserError.textContent);
          return Logo || KoiiLogo;
        }

        const svg = svgDoc.documentElement;

        // Ensure viewBox exists for better scaling
        if (
          !svg.getAttribute('viewBox') &&
          svg.getAttribute('width') &&
          svg.getAttribute('height')
        ) {
          svg.setAttribute(
            'viewBox',
            `0 0 ${svg.getAttribute('width')} ${svg.getAttribute('height')}`
          );
        }

        // eslint-disable-next-line react/function-component-definition
        const BrandLogoComponent: FC<ComponentProps<'svg'>> = (props) => (
          <svg
            {...Object.fromEntries(
              [...svg.attributes].map((attr) => [attr.name, attr.value])
            )}
            {...props}
            // eslint-disable-next-line react/destructuring-assignment
            className={`py-2 ${props.className || ''}`}
            dangerouslySetInnerHTML={{ __html: svg.innerHTML }}
          />
        );
        return BrandLogoComponent;
      } catch (error) {
        console.error('Error processing SVG:', error);
        return Logo || KoiiLogo;
      }
    }
    return Logo || KoiiLogo;
  }, [effectiveLogo, Logo]);
};
