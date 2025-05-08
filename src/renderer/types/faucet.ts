export enum ValidationStatus {
  CLAIMED = 'CLAIMED',
  IN_PROGRESS = 'IN_PROGRESS',
  NOT_CLAIMED = 'NOT_CLAIMED',
  FAILED = 'FAILED',
}

export interface StatusResponse {
  discordValidation: ValidationStatus;
  emailValidation: ValidationStatus;
  githubValidation: ValidationStatus;
  twitterValidation: ValidationStatus;
  referral: ValidationStatus;
  walletAddress: string;
}
