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
    console.log('Starting payment status update process...');
    const { session_id } = await req.json();
    
    if (!session_id) {
      console.error('No session_id provided in request');
      throw new Error('Session ID is required');
    }

    console.log('Processing session:', session_id);

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    // Retrieve the session with expanded payment_intent
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['payment_intent'],
    });

    console.log('Retrieved session status:', session.payment_status);
    console.log('Session metadata:', session.metadata);
    console.log('Payment intent:', session.payment_intent);

    if (session.payment_status === 'paid') {
      console.log('Payment confirmed as paid, updating database...');
      
      // Initialize Supabase client with service role key for full access
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      );

      if (!session.metadata?.request_id) {
        console.error('No request_id found in session metadata');
        throw new Error('No request_id found in session metadata');
      }

      // Get payment intent ID
      const paymentIntentId = typeof session.payment_intent === 'string' 
        ? session.payment_intent 
        : session.payment_intent?.id;

      console.log('Updating database for request:', session.metadata.request_id);
      console.log('Update data:', {
        payment_status: 'completed',
        status: 'paid',
        stripe_session_id: session.id,
        stripe_payment_id: paymentIntentId,
      });

      // Update the analysis request
      const { data: updateData, error: updateError } = await supabaseClient
        .from('listing_analysis_requests')
        .update({
          payment_status: 'completed',
          status: 'paid',
          stripe_session_id: session.id,
          stripe_payment_id: paymentIntentId,
        })
        .eq('id', session.metadata.request_id)
        .select();

      if (updateError) {
        console.error('Database update error:', updateError);
        throw new Error(`Failed to update payment status: ${updateError.message}`);
      }

      console.log('Database update successful:', updateData);

      return new Response(
        JSON.stringify({ status: 'paid', data: updateData }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    console.log('Payment not yet paid, status:', session.payment_status);
    return new Response(
      JSON.stringify({ status: session.payment_status }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error processing payment status:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});