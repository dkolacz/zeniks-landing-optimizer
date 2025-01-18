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

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    if (session.payment_status === 'paid') {
      // Update payment status in database
      const { data: requestData, error: updateError } = await supabaseClient
        .from('listing_analysis_requests')
        .update({
          payment_status: 'completed',
          status: 'paid',
          stripe_payment_id: session.payment_intent as string,
        })
        .eq('stripe_session_id', session_id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating payment status:', updateError);
        throw new Error('Failed to update payment status');
      }

      console.log('Payment status updated successfully:', requestData);

      // Add subscriber to MailerLite
      try {
        console.log('Starting MailerLite integration...');
        
        const subscriberData = {
          email: requestData.email,
          fields: {
            name: requestData.full_name,
            platform: requestData.platform,
            listing_url: requestData.listing_url
          },
          groups: ['98402686150123456'] // Replace with your actual group ID
        };
        
        console.log('Sending data to MailerLite:', JSON.stringify(subscriberData, null, 2));

        const mailerLiteResponse = await fetch('https://connect.mailerlite.com/api/subscribers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('MAILERLITE_API_KEY')}`,
          },
          body: JSON.stringify(subscriberData),
        });

        const responseText = await mailerLiteResponse.text();
        console.log('MailerLite raw response:', responseText);

        if (!mailerLiteResponse.ok) {
          console.error('MailerLite API error:', {
            status: mailerLiteResponse.status,
            statusText: mailerLiteResponse.statusText,
            response: responseText,
            requestData: subscriberData
          });
          throw new Error('Failed to add subscriber to MailerLite');
        }

        console.log('Successfully added subscriber to MailerLite');
      } catch (error) {
        console.error('Error in MailerLite integration:', error);
        // We don't throw here to not break the payment flow
      }

      return new Response(
        JSON.stringify({ status: 'paid' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ status: session.payment_status }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});