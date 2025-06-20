import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Polar } from "https://esm.sh/@polar-sh/sdk";
import { error } from "node:console";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

const polar = new Polar({
  accessToken: Deno.env.get("POLAR_ACCESS_TOKEN") || "",
  server:
    Deno.env.get("POLAR_ENVIRONMENT") === "sandbox" ? "sandbox" : "production",
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { amount, successUrl, customerEmail, metadata } = await req.json();

    if (!amount || !successUrl || !customerEmail) {
      throw new Error(
        "Missing required parameters (need amount, successUrl, customerEmail)"
      );
    }

    // For "Pay What You Want" products, use the organization ID and product name
    const result = await polar.checkouts.create({
      organization_id: Deno.env.get("POLAR_ORGANIZATION_ID"),
      product_name: "Powerlifting Meet Tracker", // Must match exactly
      amount: Math.round(amount * 100), // Convert to cents
      success_url: successUrl,
      customer_email: customerEmail,
      metadata: metadata || {},
    });

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
    return new Response(
      JSON.stringify({
        error: error.message,
        details: error.cause?.issues || null,
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
