export interface ICreateReview {
  gearItemId: string;
  rentalOrderId: string;
  rating: number;
  comment?: string;
}
