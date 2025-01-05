import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function addToMailchimp(email: string, fullName: string, listingUrl: string) {
  console.log('Starting Mailchimp contact creation with:', { email, fullName, listingUrl });
  
  const audienceId = "91ede30ac7";
  const apiKey = Deno.env.get('MAILCHIMP_API_KEY');
  
  if (!apiKey) {
    console.error('Mailchimp API key not configured');
    throw new Error('Mailchimp API key not configured');
  }

  const [_, datacenter] = apiKey.split('-');
  
  if (!datacenter) {
    console.error('Invalid Mailchimp API key format');
    throw new Error('Invalid Mailchimp API key format');
  }

  const url = `https://${datacenter}.api.mailchimp.com/3.0/lists/${audienceId}/members`;
  
  const [firstName, ...lastNameParts] = fullName.split(' ');
  const lastName = lastNameParts.join(' ');

  const requestBody = {
    email_address: email,
    status: "subscribed",
    merge_fields: {
      FNAME: firstName || '',
      LNAME: lastName || '',
      MMERGE3: listingUrl
    }
  };

  console.log('Sending request to Mailchimp:', {
    url,
    requestBody: JSON.stringify(requestBody)
  });

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`anystring:${apiKey}`)}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    console.log('Mailchimp API response:', {
      status: response.status,
      data: data
    });
    
    if (!response.ok) {
      console.error('Mailchimp API error:', {
        status: response.status,
        statusText: response.statusText,
        data,
      });
      throw new Error(`Mailchimp API error: ${data.detail || data.title || 'Unknown error'}`);
    }

    console.log('Successfully added member to Mailchimp');
    return data;
  } catch (error) {
    console.error('Failed to add member to Mailchimp:', error);
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { session_id } = await req.json();
    console.log('Processing payment status for session:', session_id);

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);
    console.log('Stripe session status:', session.payment_status);

    if (session.payment_status === 'paid') {
      // Create Supabase client
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      );

      // Get the form data from the database
      const { data: requestData, error: fetchError } = await supabaseClient
        .from('listing_analysis_requests')
        .select('*')
        .eq('stripe_session_id', session_id)
        .single();

      if (fetchError) {
        console.error('Error fetching analysis request:', fetchError);
        throw new Error('Failed to fetch analysis request data');
      }

      if (!requestData) {
        console.error('No analysis request found for session:', session_id);
        throw new Error('Analysis request not found');
      }

      console.log('Analysis request data retrieved:', requestData);

      // Only update if payment status is not already completed
      if (requestData.payment_status !== 'completed') {
        const { error: updateError } = await supabaseClient
          .from('listing_analysis_requests')
          .update({
            payment_status: 'completed',
            stripe_payment_id: session.payment_intent as string,
          })
          .eq('id', requestData.id);

        if (updateError) {
          console.error('Error updating payment status:', updateError);
          throw new Error('Failed to update payment status');
        }

        console.log('Payment status updated successfully');

        // Add user to Mailchimp only after successful payment update
        try {
          await addToMailchimp(
            requestData.email,
            requestData.full_name,
            requestData.listing_url
          );
          console.log('Successfully added to Mailchimp');
        } catch (mailchimpError) {
          console.error('Mailchimp integration error:', mailchimpError);
          // Log but don't throw the error - we want the payment success to go through
        }
      } else {
        console.log('Payment already marked as completed, skipping update');
      }

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