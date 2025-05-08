export interface CreateNodeWalletsFromJsonResponse {
  stakingWalletPubKey: string;
  mainAccountPubKey: string;
}

export interface CreateNodeWalletsFromJsonParam {
  accountName: string;
  jsonKey: any;
}
