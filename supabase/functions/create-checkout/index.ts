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

    // Updated to match Polar API requirements
    const result = await polar.checkouts.create({
      products: [
        {
          price_id: productPriceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      customer_email: customerEmail,
      ...(metadata && { metadata }),
    });

    return new Response(
      JSON.stringify({ sessionId: result.id, url: result.url }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Detailed error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
