
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { requestId, email } = await req.json();
    console.log('Received checkout request for request_id:', requestId, 'email:', email);

    if (!requestId) {
      throw new Error('request_id is required');
    }

    if (!email) {
      throw new Error('email is required');
    }

    // Initialize Stripe with the secret key from environment variables
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Verify the request exists
    const { data: requestData, error: requestError } = await supabaseClient
      .from('requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (requestError || !requestData) {
      console.error('Error fetching request:', requestError);
      throw new Error('Request not found');
    }

    console.log('Found request:', requestData);

    // Create Stripe checkout session
    console.log('Creating payment session...');
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: 'price_1SBJVMAGm0tqztuhV76F3LhY',
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `https://zeniks.co/report?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://zeniks.co/?canceled=1`,
      metadata: {
        request_id: requestId,
      },
    });

    // Update the request with status, session ID, and customer email
    const { error: updateError } = await supabaseClient
      .from('requests')
      .update({
        status: 'awaiting_payment',
        stripe_session_id: session.id,
        customer_email: email
      })
      .eq('id', requestId);

    if (updateError) {
      console.error('Error updating request:', updateError);
      throw new Error('Failed to update request status');
    }

    console.log('Payment session created:', session.id);
    return new Response(
      JSON.stringify({ url: session.url }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error creating payment session:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
