import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Fixed orders to guarantee deterministic key ordering
const AMENITY_ORDER = [
  "Scenic views",
  "Bathroom",
  "Bedroom and laundry",
  "Entertainment",
  "Family",
  "Heating and cooling",
  "Home safety",
  "Internet and office",
  "Kitchen and dining",
  "Location features",
  "Outdoor",
  "Parking and facilities",
  "Services",
  "Not included",
];

const HOUSE_RULES_ORDER = [
  "Checking in and out",
  "During stay",
  "Before leave",
  "Aditional rules",
  "General",
];

// Helper functions
function cleanText(text: string): string {
  if (!text) return "";
  // Unescape HTML entities and collapse whitespace
  const unescaped = text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
  return unescaped.replace(/\s+/g, " ").trim();
}

function parseFirstInt(s: string | number | null | undefined): number | null {
  if (typeof s === "number") return Math.floor(s);
  if (!s) return null;
  const match = String(s).match(/(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

function moneyToFloat(s: string | null | undefined): number {
  if (!s) return 0.0;
  const cleaned = String(s).replace(/[^\d.]/g, "");
  return cleaned ? parseFloat(cleaned) : 0.0;
}

function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function parseDescriptionSections(htmlText: string, locationDescriptions: any[] = []): Record<string, string> {
  const sections: Record<string, string> = {
    listing_description: "",
    space: "",
    guest_access: "",
    other_notes: "",
    neighbourhood: "",
    getting_around: "",
  };

  if (!htmlText) return sections;

  // Extract neighbourhood and getting_around from location_descriptions
  for (const loc of locationDescriptions || []) {
    const title = (loc.title || "").toLowerCase();
    if (title.includes("neighborhood") || title.includes("neighbourhood")) {
      sections.neighbourhood = cleanText(loc.content || "");
    } else if (title.includes("getting around")) {
      sections.getting_around = cleanText(loc.content || "");
    }
  }

  // Find all <b> tags with their positions
  const bTagRegex = /<b[^>]*>(.*?)<\/b>/gi;
  const matches = [...htmlText.matchAll(bTagRegex)];

  console.log(`Found ${matches.length} section headers in description`);

  if (matches.length === 0) {
    // No sections, entire text is listing_description
    sections.listing_description = cleanText(stripHtmlTags(htmlText));
    return sections;
  }

  // Text before first <b> tag is listing_description
  const firstBIndex = matches[0].index!;
  if (firstBIndex > 0) {
    sections.listing_description = cleanText(stripHtmlTags(htmlText.substring(0, firstBIndex)));
  }

  // Process each <b> tag and extract content until next <b> tag
  for (let i = 0; i < matches.length; i++) {
    const label = cleanText(matches[i][1] || "").toLowerCase();
    
    // Start after the closing </b> tag
    const startIndex = matches[i].index! + matches[i][0].length;
    // End at the next <b> tag or end of string
    const endIndex = i + 1 < matches.length ? matches[i + 1].index! : htmlText.length;
    
    const content = cleanText(stripHtmlTags(htmlText.substring(startIndex, endIndex)));

    console.log(`Section "${label}" → content length: ${content.length}`);

    // Map label to section key
    if (label.includes('space')) {
      sections.space = content;
      console.log(`✓ Assigned to space: ${content.substring(0, 60)}...`);
    } else if (label.includes('guest access') || label.includes('guest interaction')) {
      sections.guest_access = content;
      console.log(`✓ Assigned to guest_access: ${content.substring(0, 60)}...`);
    } else if (
      label.includes('other things to note') ||
      label.includes('other things') ||
      label.includes('other notes')
    ) {
      sections.other_notes = content;
      console.log(`✓ Assigned to other_notes: ${content.substring(0, 60)}...`);
    } else {
      console.log(`⚠ Label "${label}" did not match any known section`);
    }
  }

  console.log('Final sections:', {
    listing_description: sections.listing_description.substring(0, 60),
    space: sections.space.substring(0, 60),
    guest_access: sections.guest_access.substring(0, 60),
    other_notes: sections.other_notes.substring(0, 60),
    neighbourhood: sections.neighbourhood.substring(0, 60),
    getting_around: sections.getting_around.substring(0, 60),
  });

  return sections;
}

function collectHouseRules(rawDetails: any): Record<string, Array<{ title: string }>> {
  const out: Record<string, Array<{ title: string }>> = {};
  HOUSE_RULES_ORDER.forEach(k => out[k] = []);

  const hr = rawDetails?.house_rules || {};
  for (const sec of hr.general || []) {
    const title = (sec.title || "").toLowerCase();
    const items = (sec.values || []).map((v: any) => ({ title: v.title || "" }));

    if (title.includes("check")) {
      out["Checking in and out"] = items;
    } else if (title.includes("stay") || title.includes("during")) {
      out["During stay"] = items;
    } else if (title.includes("before") || title.includes("leave")) {
      out["Before leave"] = items;
    } else {
      out["General"].push(...items);
    }
  }

  return out;
}

function collectAmenities(rawDetails: any): Record<string, Array<{ title: string; available: boolean; subtitle: string }>> {
  const out: Record<string, Array<{ title: string; available: boolean; subtitle: string }>> = {};
  AMENITY_ORDER.forEach(k => out[k] = []);

  for (const group of rawDetails?.amenities || []) {
    const cat = group.title;
    const values = group.values || [];
    if (!cat || !Array.isArray(values)) continue;

    if (!out[cat]) out[cat] = [];
    for (const v of values) {
      out[cat].push({
        title: v.title || "",
        available: Boolean(v.available),
        subtitle: v.subtitle || "",
      });
    }
  }

  return out;
}

function collectReviews(rawReviews: any[]): any[] {
  const out: any[] = [];
  for (const r of rawReviews || []) {
    const reviewee = r.reviewee?.firstName || r.reviewee?.hostName || "";
    const reviewer = r.reviewer?.firstName || r.reviewer?.hostName || "";
    const localized = r.localizedReview;
    const comments = r.comments;

    let localizedOut: any;
    if (localized === null && typeof comments === "string") {
      localizedOut = comments;
    } else {
      localizedOut = localized;
    }

    out.push({
      rating: parseInt(r.rating || 0, 10),
      reviewee,
      reviewer,
      createdAt: r.createdAt || "",
      subtitleItems: r.subtitleItems || [],
      localizedReview: localizedOut,
      localizedResponse: r.response === null ? null : r.localizedResponse,
      reviewHighlight: r.reviewHighlight || "",
    });
  }
  return out;
}

function normalizeListing(raw: any): any {
  const data = raw.data || {};
  const details = data.details || {};
  const price = data.price || {};
  const out: any = { listing: {} };
  const listing = out.listing;

  // Basic
  const listingId = raw.listing_id || data.listing_id || raw.id || "";
  listing.id = listingId;
  listing.url = listingId ? `https://www.airbnb.com/rooms/${listingId}` : "";
  listing.language = details.language || raw.language || "en";
  listing.is_guest_favorite = Boolean(details.is_guest_favorite || raw.is_guest_favorite || false);
  listing.title = details.title || raw.title || "";

  // Description
  const descHtml = details.description || raw.description || "";
  const locationDescriptions = details.location_descriptions || [];
  
  listing.description = {
    html: descHtml,
    text: cleanText(stripHtmlTags(descHtml)),
    sections: parseDescriptionSections(descHtml, locationDescriptions),
  };

  // Property
  const items = details.sub_description?.items || [];
  const bedrooms = items.find((x: any) => typeof x === "string" && x.toLowerCase().includes("bedroom"));
  const beds = items.find((x: any) => typeof x === "string" && (x.toLowerCase().trim().endsWith("bed") || x.toLowerCase().includes("beds")));
  const baths = items.find((x: any) => typeof x === "string" && x.toLowerCase().includes("bath"));

  listing.property = {
    room_type: details.room_type || "",
    property_type: details.sub_description?.title || "",
    home_tier: details.home_tier || null,
    is_guest_favorite: Boolean(details.is_guest_favorite || false),
    capacity: details.person_capacity || null,
    bedrooms: parseFirstInt(bedrooms),
    beds: parseFirstInt(beds),
    baths: baths ? parseFloat(String(parseFirstInt(baths))) : null,
  };

  // Host
  const host = details.host || {};
  listing.host = {
    id: host.id || "",
    name: host.name || "",
    is_superhost: Boolean(details.is_super_host || false),
  };

  // Location
  const coords = details.coordinates || {};
  listing.location = {
    lat: coords.latitude || null,
    lng: coords.longitude || null,
    city: "",
    region: "",
    country: "",
  };

  // Amenities
  listing.amenities = collectAmenities(details);

  // House rules
  listing["House rules"] = collectHouseRules(details);

  // Images
  listing.images = (details.images || []).map((i: any) => ({
    url: i.url || "",
    title: i.title || "",
  }));

  // Ratings
  listing.ratings = details.rating || {
    value: 0,
    accuracy: 0,
    checking: 0,
    location: 0,
    cleanliness: 0,
    review_count: 0,
    communication: 0,
    guest_satisfaction: 0,
  };

  // Reviews
  listing.reviews = collectReviews(data.reviews || []);

  // Price
  const detailsPrices = price.details || {};
  const baseKey = Object.keys(detailsPrices).find(k => k.includes("nights x $")) || "";
  const basePrice = baseKey.includes("$") ? moneyToFloat(baseKey.split("$")[1]) : 0.0;
  
  const mainPrice = String(price.main?.price || "");
  const totalPrice = String(detailsPrices.Total || "");

  listing.price = {
    base_price: basePrice,
    cleaning_fee: 0.0,
    service_fee: 0.0,
    taxes: moneyToFloat(detailsPrices.Taxes),
    total: moneyToFloat(totalPrice || mainPrice),
    currency: (mainPrice.includes("$") || totalPrice.includes("$")) ? "USD" : "",
  };

  return out;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { result_id } = await req.json();
    console.log(`Normalizing data for result_id: ${result_id}`);

    // Read from requests table
    const { data: requestData, error: fetchError } = await supabase
      .from('requests')
      .select('data, listing_id')
      .eq('id', result_id)
      .single();

    if (fetchError) {
      console.error('Error fetching request data:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch request data', details: fetchError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!requestData?.data) {
      console.error('No data found for result_id:', result_id);
      return new Response(
        JSON.stringify({ error: 'No data found for the given result_id' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Normalize the data
    console.log('Normalizing listing data...');
    const normalized = normalizeListing(requestData.data);
    const wrapped = { listing_json: normalized };

    // Write to results table
    console.log('Writing normalized data to results table...');
    const { error: insertError } = await supabase
      .from('results')
      .upsert({
        request_id: result_id,
        listing_id: requestData.listing_id,
        normalized_data: wrapped,
        created_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error('Error writing normalized data:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to write normalized data', details: insertError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Successfully normalized data for result_id: ${result_id}`);
    return new Response(
      JSON.stringify({ success: true, result_id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Unexpected error in normalize function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
