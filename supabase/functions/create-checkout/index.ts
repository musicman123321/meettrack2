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
    const { amount, successUrl, customerEmail, metadata } = await req.json();

    if (!amount || !successUrl || !customerEmail) {
      throw new Error(
        "Missing required parameters (need amount, successUrl, customerEmail)",
      );
    }

    // Validate required environment variables
    const organizationId = Deno.env.get("POLAR_ORGANIZATION_ID");
    if (!organizationId) {
      throw new Error("POLAR_ORGANIZATION_ID environment variable is required");
    }

    // Create checkout session for "Pay What You Want" product
    const result = await polar.checkouts.create({
      organization_id: organizationId,
      product_name: "Meet Prep Tracker Support", // Updated product name
      amount: Math.round(amount * 100), // Convert to cents
      success_url: successUrl,
      customer_email: customerEmail,
      metadata: {
        ...metadata,
        environment: "production",
        timestamp: new Date().toISOString(),
      },
    });

    return new Response(
      JSON.stringify({
        sessionId: result.id,
        url: result.url,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
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
      },
    );
  }
});
