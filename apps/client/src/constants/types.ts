export interface PricingState {
  selectedTier: string | null;
  quantity: number;
}

// type for pagination
export type Pagination = {
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  totalPages: number;
  currentPage: number;
};