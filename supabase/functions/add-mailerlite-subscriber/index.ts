import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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
    const { email, airbnb_url } = await req.json();
    console.log('Adding subscriber to MailerLite:', { email, airbnb_url });

    const subscriberData = {
      email: email,
      fields: {
        airbnb_url: airbnb_url
      },
      groups: ['142779501276824694'] // Group ID for report requests
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
    
    return new Response(
      JSON.stringify({ success: true, message: 'Subscriber added successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error adding subscriber:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});