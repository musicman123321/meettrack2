import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, paypal-transmission-id, paypal-cert-id, paypal-auth-algo, paypal-transmission-time, paypal-auth-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
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
  return data.access_token;
}

// Verify PayPal Webhook Signature
async function verifyPayPalWebhook(
  request: Request,
  body: string,
  accessToken: string,
): Promise<boolean> {
  try {
    const webhookId = Deno.env.get("PAYPAL_WEBHOOK_ID");
    if (!webhookId) {
      console.error("PAYPAL_WEBHOOK_ID not configured");
      return false;
    }

    const headers = {
      "PAYPAL-TRANSMISSION-ID":
        request.headers.get("paypal-transmission-id") || "",
      "PAYPAL-CERT-ID": request.headers.get("paypal-cert-id") || "",
      "PAYPAL-AUTH-ALGO": request.headers.get("paypal-auth-algo") || "",
      "PAYPAL-TRANSMISSION-TIME":
        request.headers.get("paypal-transmission-time") || "",
      "PAYPAL-AUTH-VERSION": request.headers.get("paypal-auth-version") || "",
    };

    console.log("Verifying webhook with headers:", headers);

    const verificationData = {
      transmission_id: headers["PAYPAL-TRANSMISSION-ID"],
      cert_id: headers["PAYPAL-CERT-ID"],
      auth_algo: headers["PAYPAL-AUTH-ALGO"],
      transmission_time: headers["PAYPAL-TRANSMISSION-TIME"],
      webhook_id: webhookId,
      webhook_event: JSON.parse(body),
    };

    const response = await fetch(
      `${PAYPAL_API_BASE}/v1/notifications/verify-webhook-signature`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(verificationData),
      },
    );

    const result = await response.json();
    console.log("Webhook verification result:", result);

    return response.ok && result.verification_status === "SUCCESS";
  } catch (error) {
    console.error("Error verifying PayPal webhook:", error);
    return false;
  }
}

// Store webhook event in database
async function storeWebhookEvent(
  supabaseClient: any,
  eventData: any,
): Promise<any> {
  try {
    const { data, error } = await supabaseClient
      .from("paypal_webhook_events")
      .insert({
        event_id: eventData.id,
        event_type: eventData.event_type,
        create_time: eventData.create_time,
        resource_type: eventData.resource_type,
        summary: eventData.summary,
        resource: eventData.resource,
        processed: false,
        created_at: new Date().toISOString(),
      })
      .select();

    if (error) {
      console.error("Error storing webhook event:", error);
      throw error;
    }

    console.log("Webhook event stored successfully:", eventData.id);
    return data;
  } catch (error) {
    console.error("Error in storeWebhookEvent:", error);
    throw error;
  }
}

// Handle payment capture completed
async function handlePaymentCaptureCompleted(
  supabaseClient: any,
  eventData: any,
) {
  console.log("Handling payment capture completed:", eventData.resource.id);

  try {
    const resource = eventData.resource;
    const customData = resource.custom_id ? JSON.parse(resource.custom_id) : {};

    // Store the successful payment
    const { data, error } = await supabaseClient
      .from("paypal_payments")
      .insert({
        capture_id: resource.id,
        amount: parseFloat(resource.amount.value),
        currency: resource.amount.currency_code,
        status: resource.status,
        customer_email: customData.customerEmail || "anonymous@example.com",
        payment_type: customData.type || "donation",
        source: customData.source || "unknown",
        metadata: customData,
        captured_at: resource.create_time,
        created_at: new Date().toISOString(),
      })
      .select();

    if (error) {
      console.error("Error storing payment:", error);
      throw error;
    }

    console.log("Payment stored successfully:", resource.id);
    return data;
  } catch (error) {
    console.error("Error handling payment capture completed:", error);
    throw error;
  }
}

// Handle payment capture denied
async function handlePaymentCaptureDenied(supabaseClient: any, eventData: any) {
  console.log("Handling payment capture denied:", eventData.resource.id);

  try {
    const resource = eventData.resource;
    const customData = resource.custom_id ? JSON.parse(resource.custom_id) : {};

    // Store the failed payment
    const { data, error } = await supabaseClient
      .from("paypal_payments")
      .insert({
        capture_id: resource.id,
        amount: parseFloat(resource.amount.value),
        currency: resource.amount.currency_code,
        status: "DENIED",
        customer_email: customData.customerEmail || "anonymous@example.com",
        payment_type: customData.type || "donation",
        source: customData.source || "unknown",
        metadata: customData,
        captured_at: resource.create_time,
        created_at: new Date().toISOString(),
      })
      .select();

    if (error) {
      console.error("Error storing denied payment:", error);
      throw error;
    }

    console.log("Denied payment stored successfully:", resource.id);
    return data;
  } catch (error) {
    console.error("Error handling payment capture denied:", error);
    throw error;
  }
}

// Main webhook handler
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  let eventId: string | null = null;

  try {
    // Get the raw body for signature verification
    const rawBody = await req.text();
    console.log("Received PayPal webhook:", rawBody.substring(0, 200) + "...");

    // Get PayPal access token for verification
    const accessToken = await getPayPalAccessToken();

    // Verify the webhook signature
    const isValidSignature = await verifyPayPalWebhook(
      req,
      rawBody,
      accessToken,
    );

    if (!isValidSignature) {
      console.error("Invalid PayPal webhook signature");
      return new Response(
        JSON.stringify({ error: "Invalid webhook signature" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Parse the webhook event
    const eventData = JSON.parse(rawBody);
    console.log("Processing PayPal webhook event:", eventData.event_type);
    eventId = eventData.id;

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Store the webhook event
    await storeWebhookEvent(supabaseClient, eventData);

    // Handle the event based on type
    switch (eventData.event_type) {
      case "PAYMENT.CAPTURE.COMPLETED":
        await handlePaymentCaptureCompleted(supabaseClient, eventData);
        break;
      case "PAYMENT.CAPTURE.DENIED":
        await handlePaymentCaptureDenied(supabaseClient, eventData);
        break;
      default:
        console.log(`Unhandled PayPal event type: ${eventData.event_type}`);
        break;
    }

    return new Response(
      JSON.stringify({ message: "Webhook processed successfully" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error processing PayPal webhook:", error);

    // Try to update event status to error if we have an eventId
    if (eventId) {
      try {
        const supabaseClient = createClient(
          Deno.env.get("SUPABASE_URL") ?? "",
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
        );

        await supabaseClient
          .from("paypal_webhook_events")
          .update({
            error_message: error.message,
            processed: false,
          })
          .eq("event_id", eventId);
      } catch (updateErr) {
        console.error("Error updating webhook event with error:", updateErr);
      }
    }

    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
