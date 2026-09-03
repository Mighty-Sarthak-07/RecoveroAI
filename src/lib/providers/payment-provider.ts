import { PaymentProvider } from "@/src/types/recovery";

export class DemoPaymentProvider implements PaymentProvider {
  async retryDebit(mandateId: string, amount: number): Promise<{ success: boolean; transactionId?: string }> {
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    return {
      success: true,
      transactionId,
    };
  }

  async checkStatus(transactionId: string): Promise<"succeeded" | "failed" | "pending"> {
    return "succeeded";
  }
}

export const defaultPaymentProvider = new DemoPaymentProvider();
