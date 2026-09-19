export interface IRentalOrderItemInput {
  gearItemId: string;
  quantity: number;
}

export interface ICreateRentalOrder {
  startDate: Date;
  endDate: Date;
  items: IRentalOrderItemInput[];
}

export type TProviderOrderStatus = "CONFIRMED" | "PICKED_UP" | "RETURNED";
