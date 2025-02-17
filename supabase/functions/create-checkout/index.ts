
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
    const { listingUrl, platform, fullName, email } = await req.json();
    console.log('Received request:', { listingUrl, platform, fullName, email });

    // Initialize Stripe with the secret key from environment variables
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // First, create the analysis request record
    console.log('Creating initial database record...');
    const { data: insertData, error: insertError } = await supabaseClient
      .from('listing_analysis_requests')
      .insert({
        listing_url: listingUrl,
        platform,
        full_name: fullName,
        email,
        payment_status: 'pending',
        status: 'requested'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating initial record:', insertError);
      throw new Error('Failed to create analysis request');
    }

    console.log('Created initial record:', insertData);

    // Create Stripe checkout session
    console.log('Creating payment session...');
    const session = await stripe.checkout.sessions.create({
      customer_email: email,
      line_items: [
        {
          price: 'price_1Qih2YEQ1gZWqi10f290YZ38', // Updated price ID
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/payment?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/payment?status=cancelled`,
      metadata: {
        request_id: insertData.id, // Include the request ID in metadata
      },
    });

    // Update the record with the session ID
    const { error: updateError } = await supabaseClient
      .from('listing_analysis_requests')
      .update({
        stripe_session_id: session.id
      })
      .eq('id', insertData.id);

    if (updateError) {
      console.error('Error updating session ID:', updateError);
      throw new Error('Failed to update session ID');
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
