
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
    let normalizedSource = leadSourceMapping[lead_source.toLowerCase()]
    
    // If not found in mapping, check if it's a valid source from lead_sources table
    if (!normalizedSource) {
      console.log(`Source "${lead_source}" not found in mapping, using as is`)
      normalizedSource = lead_source.toLowerCase()
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
