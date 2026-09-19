export interface ICreateGearItem {
  name: string;
  description: string;
  brand?: string;
  images?: string[];
  pricePerDay: number;
  stock: number;
  specifications?: Record<string, unknown>;
  categoryId: string;
  isAvailable?: boolean;
}

export interface IUpdateGearItem {
  name?: string;
  description?: string;
  brand?: string;
  images?: string[];
  pricePerDay?: number;
  stock?: number;
  specifications?: Record<string, unknown>;
  categoryId?: string;
  isAvailable?: boolean;
}

export interface IGearFilters {
  category?: string;
  brand?: string;
  minPrice?: string;
  maxPrice?: string;
  search?: string;
  inStock?: string;
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: string;
}
