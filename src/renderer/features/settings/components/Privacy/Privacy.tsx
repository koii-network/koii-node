import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { AppRoute } from 'renderer/types/routes';

export function Privacy() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate(AppRoute.Unlock);
  }, [navigate]);

  return <div />; // or a spinner, placeholder, etc.
}
