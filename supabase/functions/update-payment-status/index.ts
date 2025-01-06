import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function addToMailchimp(email: string, fullName: string, listingUrl: string) {
  const audienceId = "91ede30ac7";
  const dataCenter = Deno.env.get('MAILCHIMP_API_KEY')?.split('-')[1];
  const apiKey = Deno.env.get('MAILCHIMP_API_KEY');

  if (!apiKey || !dataCenter) {
    console.error('Mailchimp API key not configured');
    return;
  }

  const url = `https://${dataCenter}.api.mailchimp.com/3.0/lists/${audienceId}/members`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `apikey ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email_address: email,
        status: 'subscribed',
        merge_fields: {
          FNAME: fullName,
          URL: listingUrl,
        },
      }),
    });

    const data = await response.json();
    console.log('Mailchimp response:', data);

    if (!response.ok) {
      throw new Error(`Failed to add to Mailchimp: ${data.detail}`);
    }
  } catch (error) {
    console.error('Error adding to Mailchimp:', error);
    // We don't throw here to avoid breaking the payment flow
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { session_id } = await req.json();

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    // Retrieve the session
    const session = await stripe.checkout.sessions.retrieve(session_id);
    
    if (session.payment_status === 'paid') {
      // Create Supabase client
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      );

      // Store the form data in Supabase
      const { error: insertError } = await supabaseClient
        .from('listing_analysis_requests')
        .insert({
          listing_url: session.metadata?.listing_url,
          platform: session.metadata?.platform,
          full_name: session.metadata?.full_name,
          email: session.metadata?.email,
          payment_status: 'completed',
          stripe_session_id: session_id,
          stripe_payment_id: session.payment_intent as string,
        });

      if (insertError) {
        console.error('Error inserting data:', insertError);
        throw new Error('Failed to store analysis request');
      }

      // Add user to Mailchimp after successful payment and database update
      await addToMailchimp(
        session.metadata?.email || '',
        session.metadata?.full_name || '',
        session.metadata?.listing_url || ''
      );

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