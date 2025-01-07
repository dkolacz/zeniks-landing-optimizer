import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function addToMailerLite(email: string, fullName: string, listingUrl: string, platform: string) {
  const apiKey = Deno.env.get('MAILERLITE_API_KEY');
  const groupId = "142779501276824694";

  if (!apiKey) {
    console.error('MailerLite API key not configured');
    return;
  }

  try {
    console.log('Attempting to add subscriber to MailerLite:', { email, fullName, listingUrl, platform });
    
    const response = await fetch('https://connect.mailerlite.com/api/subscribers', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        fields: {
          name: fullName,
          listing_url: listingUrl,
          platform: platform
        },
        groups: [groupId],
        status: 'active'
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('MailerLite API error:', data);
      throw new Error(`MailerLite API error: ${JSON.stringify(data)}`);
    }
    
    console.log('Successfully added subscriber to MailerLite:', data);
    return data;
  } catch (error) {
    console.error('Error adding to MailerLite:', error);
    // We don't throw here to avoid breaking the payment flow
    return null;
  }
}

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

      console.log('Successfully stored analysis request in database');

      // Add user to MailerLite after successful payment and database update
      await addToMailerLite(
        session.metadata?.email || '',
        session.metadata?.full_name || '',
        session.metadata?.listing_url || '',
        session.metadata?.platform || ''
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