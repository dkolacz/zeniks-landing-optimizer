import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { result_id } = await req.json();
    console.log('Processing normalization for result_id:', result_id);

    // 1. Fetch raw JSON from results table
    const { data: result, error: fetchError } = await supabase
      .from('results')
      .select('id, data, listing_id')
      .eq('id', result_id)
      .single();

    if (fetchError) {
      console.error('Error fetching result:', fetchError);
      throw new Error(`Failed to fetch result: ${fetchError.message}`);
    }

    if (!result || !result.data) {
      throw new Error('No data found in result');
    }

    console.log('Raw data fetched, normalizing...');
    
    // 2. Transform raw → normalized schema
    const normalized = normalizeListing(result.data);
    
    // 3. Upsert into listings table with idempotency
    const { error: upsertError } = await supabase
      .from('listings')
      .upsert({
        listing_id: normalized.listing.id,
        listing: normalized.listing,
        schema_version: normalized.version
      }, {
        onConflict: 'listing_id'
      });

    if (upsertError) {
      console.error('Error upserting listing:', upsertError);
      throw new Error(`Failed to upsert listing: ${upsertError.message}`);
    }

    console.log('Successfully normalized and upserted listing:', normalized.listing.id);

    return new Response(
      JSON.stringify({ success: true, listing_id: normalized.listing.id }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Normalization error:', error);
    
    // Log error to normalization_errors table
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      const { result_id } = await req.json().catch(() => ({ result_id: null }));
      
      await supabase
        .from('normalization_errors')
        .insert({
          result_id: result_id,
          error_message: error.message,
          error_details: { 
            stack: error.stack,
            timestamp: new Date().toISOString()
          }
        });
    } catch (logError) {
      console.error('Failed to log error to database:', logError);
    }

    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

function normalizeListing(raw: any) {
  const id = raw.id ?? raw.listing_id;
  return {
    version: "v2",
    source: {
      provider: "PartnerPMS",
      provider_listing_id: id,
      platform: "airbnb",
      fetched_at: new Date().toISOString()
    },
    listing: {
      id,
      url: `https://www.airbnb.com/rooms/${id}`,
      language: raw.language ?? "en",
      title: raw.title ?? "",
      description: {
        html: raw.description ?? "",
        text: raw.description?.replace(/<[^>]*>/g, "") ?? "",
        sections: {
          listing_description: raw.description ?? "",
          space: raw.space ?? "",
          guest_access: raw.guest_access ?? "",
          other_notes: raw.other_notes ?? "",
          neighbourhood: raw.neighbourhood ?? "",
          getting_around: raw.getting_around ?? ""
        }
      },
      property: {
        room_type: raw.room_type ?? "",
        property_type: raw.property_type ?? "",
        home_tier: raw.home_tier ?? null,
        is_guest_favorite: raw.is_guest_favorite ?? false,
        capacity: raw.person_capacity ?? null,
        bedrooms: raw.bedrooms ?? null,
        beds: raw.beds ?? null,
        baths: raw.baths ?? null
      },
      host: {
        id: raw.host?.id ?? "",
        name: raw.host?.name ?? "",
        is_superhost: raw.host?.is_super_host ?? false
      },
      location: {
        lat: raw.coordinates?.latitude ?? null,
        lng: raw.coordinates?.longitude ?? null,
        city: raw.city ?? "",
        region: raw.region ?? "",
        country: raw.country ?? ""
      },
      highlights: raw.highlights?.map((h: any) => ({
        title: h.title,
        subtitle: h.subtitle
      })) ?? [],
      amenities: (raw.amenities ?? []).map((cat: any) => ({
        category: cat.title,
        items: cat.values.map((v: any) => ({
          title: v.title,
          subtitle: v.subtitle ?? "",
          available: v.available ?? true
        }))
      })),
      house_rules: {
        checking_in_out: extractHouseRules(raw, "Checking in and out"),
        during_stay: extractHouseRules(raw, "During your stay"),
        before_leave: extractHouseRules(raw, "Before you leave"),
        general: extractHouseRules(raw, "General"),
        additional_text: raw.house_rules?.aditional ?? ""
      },
      images: (raw.images ?? []).map((img: any) => ({
        title: img.title ?? "",
        url: img.url ?? ""
      })),
      ratings: {
        accuracy: raw.rating?.accuracy ?? 0,
        checkin: raw.rating?.checking ?? 0,
        cleanliness: raw.rating?.cleanliness ?? 0,
        communication: raw.rating?.communication ?? 0,
        location: raw.rating?.location ?? 0,
        value: raw.rating?.value ?? 0,
        overall: raw.rating?.guest_satisfaction ?? null,
        review_count: raw.rating?.review_count ?? 0
      }
    }
  };
}

function extractHouseRules(raw: any, section: string) {
  const general = raw.house_rules?.general ?? [];
  const match = general.find((g: any) => g.title === section);
  return match ? match.values.map((v: any) => ({ title: v.title })) : [];
}