/* eslint-disable @cspell/spellchecker */
export const whitelistedFilter = {
  memcmp: {
    offset: 0 /* offset where the whitelisted bytes start */,
    bytes: 'aRN1MbEZhbr2W97MTP3RhQjjqHgoZN',
  },
};

export const getProgramAccountFilter = () => [whitelistedFilter];
