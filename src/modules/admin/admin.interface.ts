export interface IUpdateUserStatus {
  status: "ACTIVE" | "SUSPENDED";
}

export interface IUserFilters {
  role?: string;
  status?: string;
  search?: string;
  page?: string;
  limit?: string;
}

export interface IAdminGearFilters {
  category?: string;
  providerId?: string;
  search?: string;
  page?: string;
  limit?: string;
}

export interface IAdminRentalFilters {
  status?: string;
  customerId?: string;
  page?: string;
  limit?: string;
}
