import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

type LinkProps = {
  text: string;
  to: string;
};

function Link({ text, to }: LinkProps): JSX.Element {
  return (
    <RouterLink
      className="text-finnieTeal-700 font-semibold underline inline-block"
      to={to}
    >
      {text}
    </RouterLink>
  );
}

export default Link;
