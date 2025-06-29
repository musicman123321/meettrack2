import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

// PayPal API Base URLs
const PAYPAL_API_BASE = "https://api-m.paypal.com"; // Production
// const PAYPAL_API_BASE = "https://api-m.sandbox.paypal.com"; // Sandbox

// Get PayPal Access Token
async function getPayPalAccessToken(): Promise<string> {
  const clientId = Deno.env.get("PAYPAL_CLIENT_ID");
  const clientSecret = Deno.env.get("PAYPAL_SECRET");

  if (!clientId || !clientSecret) {
    throw new Error("PayPal credentials not configured");
  }

  const auth = btoa(`${clientId}:${clientSecret}`);

  console.log("Requesting PayPal access token...");

  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("PayPal token error:", errorText);
    throw new Error(`Failed to get PayPal access token: ${response.status}`);
  }

  const data = await response.json();
  console.log("PayPal access token obtained successfully");
  return data.access_token;
}

// Create PayPal Order
async function createPayPalOrder(
  accessToken: string,
  orderData: any,
): Promise<any> {
  console.log(
    "Creating PayPal order with data:",
    JSON.stringify(orderData, null, 2),
  );

  const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "PayPal-Request-Id": crypto.randomUUID(),
    },
    body: JSON.stringify(orderData),
  });

  const responseData = await response.json();

  if (!response.ok) {
    console.error("PayPal order creation error:", responseData);
    throw new Error(
      `Failed to create PayPal order: ${JSON.stringify(responseData)}`,
    );
  }

  console.log("PayPal order created successfully:", responseData.id);
  return responseData;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.text();
    console.log("Raw request body:", body);

    let requestData;
    try {
      requestData = JSON.parse(body);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      throw new Error("Invalid JSON in request body");
    }

    console.log("Parsed request data:", requestData);
    const { amount, successUrl, cancelUrl, customerEmail, metadata } =
      requestData;

    // Validate required parameters
    if (!amount || !successUrl) {
      console.error("Missing parameters:", {
        amount,
        successUrl,
        customerEmail,
      });
      throw new Error("Missing required parameters (need amount, successUrl)");
    }

    // Validate amount
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      throw new Error("Invalid amount provided");
    }

    // Get PayPal access token
    const accessToken = await getPayPalAccessToken();

    // Create PayPal order data
    const orderData = {
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: numAmount.toFixed(2),
          },
          description: "Meet Prep Tracker Support Donation",
          custom_id: JSON.stringify({
            type: "donation",
            source: "powerlifting-app",
            customerEmail: customerEmail || "anonymous@example.com",
            timestamp: new Date().toISOString(),
            ...metadata,
          }),
        },
      ],
      application_context: {
        return_url: successUrl,
        cancel_url: cancelUrl || successUrl,
        brand_name: "Meet Prep Tracker",
        user_action: "PAY_NOW",
      },
    };

    // Create the order
    const order = await createPayPalOrder(accessToken, orderData);

    // Find the approval URL
    const approvalUrl = order.links?.find(
      (link: any) => link.rel === "approve",
    )?.href;

    if (!approvalUrl) {
      throw new Error("No approval URL found in PayPal response");
    }

    return new Response(
      JSON.stringify({
        orderId: order.id,
        approvalUrl,
        status: order.status,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("PayPal order creation error:", error);

    const errorDetails = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    };

    console.error("Detailed error:", errorDetails);

    return new Response(
      JSON.stringify({
        error: error.message || "An error occurred while creating PayPal order",
        timestamp: new Date().toISOString(),
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
