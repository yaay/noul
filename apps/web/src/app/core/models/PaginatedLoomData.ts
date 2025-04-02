import { loom } from "./loom";

export interface LoomItems {
  id: number;
  title: string;
  created: Date; 
  created_by: string;
}

export interface PaginatedLoomData {
    page: number;
    perPage: number;
    totalItems: number;
    totalPages: number;
    items: LoomItems[];
  }

