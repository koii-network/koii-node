import React, { useEffect, useMemo, useRef } from 'react';

import { useTheme } from '../../theme/ThemeContext';

type SparkleButtonStyles = {
  [key: string]: string;
} & React.CSSProperties;

function SparkleButton({
  text,
  onClick,
  buttonId,
}: {
  text: string;
  onClick: () => void;
  buttonId: string;
}) {
  const { theme } = useTheme();
  const particlesRef = useRef([]);

  const themeStyles = useMemo(
    (): { [key: string]: SparkleButtonStyles } => ({
      koii: {
        '--sparkle-button-bg': 'var(--color-depth-90)',
        '--sparkle-button-border':
          'linear-gradient(to right, #e5a925, #fdfc73, #c1c132e4, #b6700f, #aa5f06)',
        '--sparkle-button-shadow': 'var(--color-depth-30)',
        '--sparkle-button-particle': 'white',
        '--sparkle-button-text': '#e9be6f',
      } as SparkleButtonStyles,
      vip: {
        '--sparkle-button-bg': '#17171f',
        '--sparkle-button-border':
          'linear-gradient(to right, #FFC78F, #DAA520, #FFC78F)',
        '--sparkle-button-shadow': 'depth-20',
        '--sparkle-button-particle': '#FFC78F',
        '--sparkle-button-text': '#FFC78F',
      } as SparkleButtonStyles,
    }),
    []
  );

  const RANDOM = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1) + min);

  useEffect(() => {
    particlesRef.current.forEach((particle) => {
      if (particle) {
        // @ts-expect-error // TODO - Ignore for now... when having time, fix this
        particle.setAttribute(
          'style',
          `
          --x: ${RANDOM(20, 80)};
          --y: ${RANDOM(20, 80)};
          --duration: ${RANDOM(6, 20)};
          --delay: ${RANDOM(1, 10)};
          --alpha: ${RANDOM(40, 90) / 100};
          --origin-x: ${
            Math.random() > 0.5 ? RANDOM(300, 800) * -1 : RANDOM(300, 800)
          }%;
          --origin-y: ${
            Math.random() > 0.5 ? RANDOM(300, 800) * -1 : RANDOM(300, 800)
          }%;
          --size: ${RANDOM(40, 90) / 100};
        `
        );
      }
    });
  }, []);

  return (
    <div className="relative inline-block">
      <button
        className="sparkle-button relative p-1 w-[165px] md2:w-[300px] h-9 mt-3.5 z-0"
        onClick={onClick}
        id={buttonId}
        style={themeStyles[theme]}
      >
        <span className="backdrop" />
        <span className="sparkle-button-text">
          <span className="block font-semibold" data-testid={buttonId}>
            {text}
          </span>
        </span>

        <span
          aria-hidden="true"
          className="particle-pen absolute pointer-events-none"
        >
          {Array.from({ length: 20 }).map((_, i) => (
            <svg
              key={i}
              className="particle pointer-events-none"
              ref={(el) => {
                // eslint-disable-next-line
                // @ts-ignore
                particlesRef.current[i] = el;
              }}
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6.937 3.846L7.75 1L8.563 3.846C8.77313 4.58114 9.1671 5.25062 9.70774 5.79126C10.2484 6.3319 10.9179 6.72587 11.653 6.936L14.5 7.75L11.654 8.563C10.9189 8.77313 10.2494 9.1671 9.70874 9.70774C9.1681 10.2484 8.77413 10.9179 8.564 11.653L7.75 14.5L6.937 11.654C6.72687 10.9189 6.3329 10.2494 5.79226 9.70874C5.25162 9.1681 4.58214 8.77413 3.847 8.564L1 7.75L3.846 6.937C4.58114 6.72687 5.25062 6.3329 5.79126 5.79226C6.3319 5.25162 6.72587 4.58214 6.936 3.847L6.937 3.846Z"
                fill="currentColor"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ))}
        </span>
      </button>
    </div>
  );
}

export default SparkleButton;
