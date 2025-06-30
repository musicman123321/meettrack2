// PayPal API Types
export interface PayPalOrderRequest {
  intent: "CAPTURE";
  purchase_units: {
    amount: {
      currency_code: string;
      value: string;
    };
    description?: string;
    custom_id?: string;
  }[];
  application_context?: {
    return_url?: string;
    cancel_url?: string;
    brand_name?: string;
    user_action?: "PAY_NOW" | "CONTINUE";
  };
}

export interface PayPalOrderResponse {
  id: string;
  status:
    | "CREATED"
    | "SAVED"
    | "APPROVED"
    | "VOIDED"
    | "COMPLETED"
    | "PAYER_ACTION_REQUIRED";
  links: {
    href: string;
    rel: string;
    method: string;
  }[];
  create_time: string;
  update_time: string;
}

export interface PayPalCaptureResponse {
  id: string;
  status:
    | "COMPLETED"
    | "DECLINED"
    | "PARTIALLY_REFUNDED"
    | "PENDING"
    | "REFUNDED";
  purchase_units: {
    reference_id: string;
    payments: {
      captures: {
        id: string;
        status: string;
        amount: {
          currency_code: string;
          value: string;
        };
        final_capture: boolean;
        create_time: string;
        update_time: string;
      }[];
    };
  }[];
}

export interface PayPalWebhookEvent {
  id: string;
  event_type: "PAYMENT.CAPTURE.COMPLETED" | "PAYMENT.CAPTURE.DENIED";
  create_time: string;
  resource_type: string;
  resource_version: string;
  event_version: string;
  summary: string;
  resource: {
    id: string;
    amount: {
      currency_code: string;
      value: string;
    };
    final_capture: boolean;
    seller_protection: {
      status: string;
      dispute_categories: string[];
    };
    seller_receivable_breakdown: {
      gross_amount: {
        currency_code: string;
        value: string;
      };
      paypal_fee: {
        currency_code: string;
        value: string;
      };
      net_amount: {
        currency_code: string;
        value: string;
      };
    };
    status: string;
    create_time: string;
    update_time: string;
    custom_id?: string;
  };
  links: {
    href: string;
    rel: string;
    method: string;
  }[];
}

export interface PayPalAccessTokenResponse {
  scope: string;
  access_token: string;
  token_type: string;
  app_id: string;
  expires_in: number;
  nonce: string;
}

export interface PayPalErrorResponse {
  name: string;
  message: string;
  debug_id: string;
  details?: {
    issue: string;
    description: string;
  }[];
  links?: {
    href: string;
    rel: string;
    method: string;
  }[];
}
