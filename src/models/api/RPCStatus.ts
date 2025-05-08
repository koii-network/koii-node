export interface RPCStatusResponse {
  id: string;
  value: number;
  label: string;
}

export interface RPCCachedData {
  timestamp: number;
  data: RPCStatusResponse[];
}
