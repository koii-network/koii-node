export interface PaginationParameters {
  offset: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  content: T[];
  hasNext: boolean;
  itemsCount: number;
}
