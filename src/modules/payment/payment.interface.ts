export interface ICreatePaymentSession {
  rentalOrderId: string;
  method?: "STRIPE" | "SSLCOMMERZ";
}

export interface IConfirmPayment {
  sessionId: string;
}
