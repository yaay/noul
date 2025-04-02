export interface response<T> {
    page: number;
    perPage: number;
    totalItems: number;
    totalPages: number;
    items: T;
  }
  