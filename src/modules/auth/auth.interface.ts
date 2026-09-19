export interface IRegisterUser {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  role?: "CUSTOMER" | "PROVIDER";
}

export interface ILoginUser {
  email: string;
  password: string;
}
