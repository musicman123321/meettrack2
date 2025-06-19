import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Polar } from "https://esm.sh/@polar-sh/sdk";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-customer-email",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

const polar = new Polar({
  accessToken: Deno.env.get("POLAR_ACCESS_TOKEN") || "",
  // Use environment variable for flexibility
  server:
    Deno.env.get("POLAR_ENVIRONMENT") === "sandbox" ? "sandbox" : "production",
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { productPriceId, successUrl, customerEmail, metadata } =
      await req.json();

    if (!productPriceId || !successUrl || !customerEmail) {
      throw new Error("Missing required parameters");
    }

    // Create checkout with proper Polar API structure
    const checkoutData = {
      product_price_id: productPriceId, // Note the underscore format
      success_url: successUrl,
      customer_email: customerEmail,
      ...(metadata && { metadata }),
    };

    const result = await polar.checkouts.create(checkoutData);

    console.log("Polar checkout result:", result);

    return new Response(
      JSON.stringify({ sessionId: result.id, url: result.url }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error creating checkout session:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
