import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Polar } from "https://esm.sh/@polar-sh/sdk";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

const polar = new Polar({
  accessToken: Deno.env.get("POLAR_ACCESS_TOKEN") || "",
  server: "production",
});

// Debug logger
const debugLog = (...args: unknown[]) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}]`, ...args);
};

serve(async (req) => {
  debugLog("Incoming request:", {
    method: req.method,
    url: req.url,
    headers: Object.fromEntries(req.headers),
  });

  if (req.method === "OPTIONS") {
    debugLog("Handling OPTIONS request");
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // First get raw body text
    const rawBody = await req.text();
    debugLog("Raw request body:", rawBody);

    // Then parse JSON
    let requestData;
    try {
      requestData = JSON.parse(rawBody);
      debugLog("Parsed request data:", requestData);
    } catch (parseError) {
      debugLog("JSON parse error:", parseError);
      return new Response(
        JSON.stringify({
          error: "Invalid JSON in request body",
          details:
            parseError instanceof Error
              ? parseError.message
              : String(parseError),
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate required parameters
    const { amount, successUrl, customerEmail, metadata } = requestData;
    const missingParams = [];
    if (amount === undefined || amount === null) missingParams.push("amount");
    if (!successUrl) missingParams.push("successUrl");
    if (!customerEmail) missingParams.push("customerEmail");

    if (missingParams.length > 0) {
      debugLog("Missing parameters:", missingParams);
      return new Response(
        JSON.stringify({
          error: "Missing required parameters",
          missing: missingParams,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate environment variables
    const organizationId = Deno.env.get("POLAR_ORGANIZATION_ID");
    const productId = Deno.env.get("POLAR_PRODUCT_ID");
    const accessToken = Deno.env.get("POLAR_ACCESS_TOKEN");

    if (!organizationId || !productId || !accessToken) {
      const errorMessage = !organizationId
        ? "POLAR_ORGANIZATION_ID is missing"
        : !productId
        ? "POLAR_PRODUCT_ID is missing"
        : "POLAR_ACCESS_TOKEN is missing";
      debugLog("Environment error:", errorMessage);
      return new Response(JSON.stringify({ error: errorMessage }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Prepare checkout data
    const checkoutData = {
      organization_id: organizationId,
      products: [
        {
          type: "paywhatyouwant",
          id: productId,
          name: "Meet Prep Tracker Support",
          price: {
            currency: "USD",
            amount: Math.round(Number(amount) * 100), // Ensure amount is a number
          },
        },
      ],
      success_url: successUrl,
      customer_email: customerEmail,
      metadata: {
        ...(metadata || {}),
        environment: "production",
        timestamp: new Date().toISOString(),
      },
    };

    debugLog("Creating checkout with data:", checkoutData);

    // Call Polar API
    const result = await polar.checkouts.create(checkoutData);
    debugLog("Polar API response:", result);

    return new Response(
      JSON.stringify({
        url: result.url,
        sessionId: result.id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    debugLog("Unexpected error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
