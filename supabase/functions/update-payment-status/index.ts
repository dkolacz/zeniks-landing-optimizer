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

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    // Retrieve the session
    const session = await stripe.checkout.sessions.retrieve(session_id);
    console.log('Retrieved Stripe session:', { 
      payment_status: session.payment_status,
      metadata: session.metadata
    });
    
    if (session.payment_status === 'paid') {
      // Initialize Supabase client
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      );

      // Get the customer data from the database
      const { data: requestData, error: fetchError } = await supabaseClient
        .from('listing_analysis_requests')
        .select('*')
        .eq('stripe_session_id', session_id)
        .single();

      if (fetchError) {
        console.error('Error fetching request data:', fetchError);
        throw new Error('Failed to fetch request data');
      }

      // Update payment status in database
      const { error: updateError } = await supabaseClient
        .from('listing_analysis_requests')
        .update({
          payment_status: 'completed',
          status: 'paid',
          stripe_payment_id: session.payment_intent as string,
        })
        .eq('stripe_session_id', session_id);

      if (updateError) {
        console.error('Error updating payment status:', updateError);
        throw new Error('Failed to update payment status');
      }

      // Add subscriber to MailerLite
      try {
        console.log('Adding subscriber to MailerLite...');
        const response = await fetch('https://connect.mailerlite.com/api/subscribers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('MAILERLITE_API_KEY')}`,
          },
          body: JSON.stringify({
            email: requestData.email,
            fields: {
              name: requestData.full_name,
              platform: requestData.platform,
              listing_url: requestData.listing_url
            },
            groups: ['98402686150123456'] // Replace with your actual group ID
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('MailerLite API error:', errorData);
          throw new Error('Failed to add subscriber to MailerLite');
        }

        const data = await response.json();
        console.log('Successfully added subscriber to MailerLite:', data);
      } catch (error) {
        console.error('Error adding subscriber to MailerLite:', error);
        // We don't throw here to not break the payment flow
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Payment not completed' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );

  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});