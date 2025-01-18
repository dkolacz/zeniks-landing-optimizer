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
    const { session_id } = await req.json();
    console.log('Processing payment status update for session:', session_id);

    if (!session_id) {
      throw new Error('Session ID is required');
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    // Retrieve the session and payment details
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['payment_intent']
    });

    console.log('Retrieved Stripe session:', { 
      payment_status: session.payment_status,
      customer_email: session.customer_email,
      payment_intent: session.payment_intent,
      metadata: session.metadata
    });
    
    if (session.payment_status === 'paid') {
      // Initialize Supabase client
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      );

      if (!session.metadata?.request_id) {
        console.error('No request_id found in session metadata');
        throw new Error('No request_id found in session metadata');
      }

      // Update the analysis request with all required fields
      const { error: updateError } = await supabaseClient
        .from('listing_analysis_requests')
        .update({
          payment_status: 'completed',
          status: 'paid',
          stripe_session_id: session_id,
          stripe_payment_id: typeof session.payment_intent === 'string' 
            ? session.payment_intent 
            : session.payment_intent?.id
        })
        .eq('id', session.metadata.request_id);

      if (updateError) {
        console.error('Error updating payment status:', updateError);
        throw new Error(`Failed to update payment status: ${updateError.message}`);
      }

      console.log('Successfully updated payment status in database for request:', session.metadata.request_id);

      return new Response(
        JSON.stringify({ status: 'paid' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

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