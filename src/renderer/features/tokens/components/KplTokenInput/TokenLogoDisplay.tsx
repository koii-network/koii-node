import React from 'react';

import KoiiTokenLogo from 'assets/svgs/koii-token-logo.svg';
import TokenPlaceholder from 'assets/svgs/token_placeholder.png';

import { TokenItemType } from '../../types';

type TokenLogoDisplayProps = {
  token: TokenItemType;
};

export function TokenLogoDisplay({ token }: TokenLogoDisplayProps) {
  if (token.name === 'Koii' && token.symbol === 'KOII') {
    return <KoiiTokenLogo className="w-8 h-8 rounded-full" />;
  }

  return (
    <img
      src={token.logoURI}
      onError={(e) => {
        e.currentTarget.src = TokenPlaceholder;
      }}
      alt={token.name}
      className="w-8 h-8 rounded-full"
    />
  );
}
