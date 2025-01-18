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
    console.log('Processing payment status for session:', session_id);

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    // Retrieve the session
    const session = await stripe.checkout.sessions.retrieve(session_id);
    console.log('Retrieved Stripe session:', { 
      payment_status: session.payment_status,
      customer_email: session.customer_email
    });
    
    if (session.payment_status === 'paid') {
      // Create Supabase client
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      );

      console.log('Updating database record...');
      
      // Update the database record
      const { error: updateError } = await supabaseClient
        .from('listing_analysis_requests')
        .update({
          payment_status: 'completed',
          status: 'paid', // Set status to 'paid'
          stripe_session_id: session_id,
          stripe_payment_id: session.payment_intent as string,
        })
        .eq('stripe_session_id', session_id);

      if (updateError) {
        console.error('Error updating database:', updateError);
        throw new Error('Failed to update analysis request');
      }

      console.log('Successfully updated database record');

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