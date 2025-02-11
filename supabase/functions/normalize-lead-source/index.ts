
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

    // Handle null or undefined lead source
    if (!lead_source) {
      console.log('No lead source provided, defaulting to "outros"')
      return new Response(
        JSON.stringify({ normalized_source: 'outros' }),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      )
    }

    // Normalize the lead source
    const sourceLower = lead_source.toLowerCase().trim()
    let normalizedSource = leadSourceMapping[sourceLower]
    
    console.log('Looking up mapping for:', sourceLower)
    console.log('Found mapping:', normalizedSource)

    // If not found in mapping, default to 'outros'
    if (!normalizedSource) {
      console.log(`Source "${sourceLower}" not found in mapping, defaulting to "outros"`)
      normalizedSource = 'outros'
    }

    console.log('Final normalized source:', normalizedSource)

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
