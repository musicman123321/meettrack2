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

  console.log("Requesting PayPal access token for capture...");

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
  console.log("PayPal access token obtained successfully for capture");
  return data.access_token;
}

// Capture PayPal Order
async function capturePayPalOrder(
  accessToken: string,
  orderId: string
): Promise<any> {
  console.log("Capturing PayPal order:", orderId);

  const response = await fetch(
    `${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "PayPal-Request-Id": crypto.randomUUID(),
      },
<<<<<<< HEAD
    },
=======
    }
  const responseData = await response.json();
  if (!response.ok) {
    console.error("PayPal order capture error:", responseData);
    throw new Error(
<<<<<<< HEAD
      `Failed to capture PayPal order: ${JSON.stringify(responseData)}`,
=======
      `Failed to capture PayPal order: ${JSON.stringify(responseData)}`
>>>>>>> asdfa5
    );
  }

  console.log("PayPal order captured successfully:", orderId);
  return responseData;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.text();
    console.log("Raw capture request body:", body);

    let requestData;
    try {
      requestData = JSON.parse(body);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      throw new Error("Invalid JSON in request body");
    }

    console.log("Parsed capture request data:", requestData);
    const { orderId } = requestData;

    // Validate required parameters
    if (!orderId) {
      console.error("Missing orderId parameter");
      throw new Error("Missing required parameter: orderId");
    }

    // Get PayPal access token
    const accessToken = await getPayPalAccessToken();

    // Capture the order
    const captureResult = await capturePayPalOrder(accessToken, orderId);

    // Extract capture details
    const capture = captureResult.purchase_units?.[0]?.payments?.captures?.[0];
    if (!capture) {
      throw new Error("No capture data found in PayPal response");
    }

    console.log("Capture completed:", {
      captureId: capture.id,
      status: capture.status,
      amount: capture.amount,
    });

    return new Response(
      JSON.stringify({
        orderId: captureResult.id,
        captureId: capture.id,
        status: capture.status,
        amount: capture.amount,
        captureResult,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
<<<<<<< HEAD
      },
=======
      }
>>>>>>> asdfa5
    );
  } catch (error) {
    console.error("PayPal order capture error:", error);

    const errorDetails = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    };

    console.error("Detailed capture error:", errorDetails);

    return new Response(
      JSON.stringify({
        error:
          error.message || "An error occurred while capturing PayPal order",
        timestamp: new Date().toISOString(),
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
<<<<<<< HEAD
      },
=======
      }
>>>>>>> asdfa5
    );
  }
});
