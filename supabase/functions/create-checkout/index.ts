import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Polar } from "https://esm.sh/@polar-sh/sdk";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

// Initialize Polar with production settings
const polar = new Polar({
  accessToken: Deno.env.get("POLAR_ACCESS_TOKEN") || "",
  server: "production", // Always use production for live payments
});

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
    const { amount, successUrl, customerEmail, metadata } = requestData;

    if (!amount || !successUrl || !customerEmail) {
      console.error("Missing parameters:", {
        amount,
        successUrl,
        customerEmail,
      });
      throw new Error(
        "Missing required parameters (need amount, successUrl, customerEmail)"
      );
    }

    // Validate required environment variables
    const organizationId = Deno.env.get("POLAR_ORGANIZATION_ID");
    const accessToken = Deno.env.get("POLAR_ACCESS_TOKEN");

    console.log("Environment check:", {
      hasOrgId: !!organizationId,
      hasAccessToken: !!accessToken,
      orgIdLength: organizationId?.length || 0,
    });

    if (!organizationId) {
      throw new Error("POLAR_ORGANIZATION_ID environment variable is required");
    }

    if (!accessToken) {
      throw new Error("POLAR_ACCESS_TOKEN environment variable is required");
    }

    // Create checkout session for "Pay What You Want" product
    const checkoutData = {
      organization_id: organizationId,
      product_name: "Meet Prep Tracker Support",
      amount: Math.round(amount * 100), // Convert to cents
      success_url: successUrl,
      customer_email: customerEmail,
      metadata: {
        ...metadata,
        environment: "production",
        timestamp: new Date().toISOString(),
      },
    };

    console.log("Creating checkout with data:", checkoutData);

    const result = await polar.checkouts.create(checkoutData);

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
    console.error("Checkout error:", error);

    // Enhanced error logging for production debugging
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      cause: error.cause,
      timestamp: new Date().toISOString(),
    };

    console.error("Detailed error:", errorDetails);

    return new Response(
      JSON.stringify({
        error: error.message || "An error occurred while creating checkout",
        details: error.cause?.issues || null,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
