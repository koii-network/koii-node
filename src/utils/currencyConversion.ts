const ROE_PER_KOII = 1000000000;

const toMax3Decimals = (value: number) =>
  +parseFloat(String(+value)).toFixed(3);

export const getKoiiFromRoe = (roe: number) =>
  toMax3Decimals(roe / ROE_PER_KOII);

export const getDenominationFromMainUnit = (
  value: number,
  decimals: number
) => {
  return value * 10 ** decimals;
};

export const getMainUnitFromDenomination = (
  value: number,
  decimals: number
) => {
  return value / 10 ** decimals;
};

export const getRoeFromKoii = (koii: number) => koii * ROE_PER_KOII;

export const getFullKoiiFromRoe = (roe: number) => roe / ROE_PER_KOII;
