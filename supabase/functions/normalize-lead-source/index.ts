
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

console.log("Normalize Lead Source Function initialized")

const leadSourceMapping: Record<string, string> = {
  'fb': 'facebook',
  'ig': 'instagram',
  'website': 'website',
  'whatsapp': 'whatsapp',
  'webhook': 'webhook',
  'indicacao': 'indicacao',
  'outros': 'outros'
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { lead_source } = await req.json()
    console.log('Received lead_source:', lead_source)

    // Normalize the lead source
    let normalizedSource = leadSourceMapping[lead_source.toLowerCase()]
    
    // If not found in mapping, default to 'outros'
    if (!normalizedSource) {
      console.log(`Unknown lead source "${lead_source}", defaulting to "outros"`)
      normalizedSource = 'outros'
    }

    console.log('Normalized to:', normalizedSource)

    return new Response(
      JSON.stringify({ normalized_source: normalizedSource }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }
})
