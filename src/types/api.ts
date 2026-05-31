export type ApiResponse<T> =
  | {
      ok: true;
      data: T;
    }
  | {
      ok: false;
      error: string;
      details?: unknown;
    };

export type Pagination = {
  page: number;
  pageSize: number;
  total: number;
};

export type PaginatedResponse<T> = {
  items: T[];
  pagination: Pagination;
};

