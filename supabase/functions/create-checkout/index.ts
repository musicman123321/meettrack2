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
  // Log incoming request
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
    // Validate content type
    const contentType = req.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      const error = new Error("Unsupported content type");
      debugLog("Content type error:", { contentType });
      return new Response(
        JSON.stringify({ error: "Content type must be application/json" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const body = await req.text();
    debugLog("Raw request body:", body);

    let requestData;
    try {
      requestData = JSON.parse(body);
      debugLog("Parsed request data:", requestData);
    } catch (parseError) {
      debugLog("JSON parse error:", parseError);
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { amount, successUrl, customerEmail, metadata } = requestData;

    // Validate required parameters
    const missingParams = [];
    if (!amount) missingParams.push("amount");
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
    const accessToken = Deno.env.get("POLAR_ACCESS_TOKEN");

    debugLog("Environment variables check:", {
      hasOrganizationId: !!organizationId,
      hasAccessToken: !!accessToken,
    });

    if (!organizationId || !accessToken) {
      const error = new Error(
        !organizationId
          ? "POLAR_ORGANIZATION_ID is required"
          : "POLAR_ACCESS_TOKEN is required"
      );
      debugLog("Environment error:", error.message);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Prepare checkout data
    const checkoutData = {
      organization_id: organizationId,
      product_name: "Meet Prep Tracker Support",
      amount: Math.round(amount * 100), // Convert to cents
      success_url: successUrl,
      customer_email: customerEmail,
      metadata: {
        ...metadata,
        environment: "production",
        backendTimestamp: new Date().toISOString(),
      },
    };

    debugLog("Creating checkout with data:", checkoutData);

    // Call Polar API
    let result;
    try {
      result = await polar.checkouts.create(checkoutData);
      debugLog("Polar API response:", result);
    } catch (polarError) {
      debugLog("Polar API error:", {
        error: polarError,
        response: polarError.response?.data,
      });
      return new Response(
        JSON.stringify({
          error: "Error creating Polar checkout",
          details: polarError.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        sessionId: result.id,
        url: result.url,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    debugLog("Unexpected error:", {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    });

    return new Response(
      JSON.stringify({
        error: "An unexpected error occurred",
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
