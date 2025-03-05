import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useEnrollmentForm } from '../EnrollmentFormProvider';

export function useClientPreFill(clientId?: string) {
  const { updateFormData } = useEnrollmentForm();

  useEffect(() => {
    console.log('useClientPreFill - Checking for client ID:', clientId);
    
    if (!clientId) {
      console.log('No client ID provided, skipping pre-fill');
      return;
    }

    async function fetchClientData() {
      console.log('Fetching client data for ID:', clientId);
      
      const { data: client, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single();

      if (error) {
        console.error('Error fetching client data:', error);
        return;
      }

      if (!client) {
        console.log('No client found with ID:', clientId);
        return;
      }

      console.log('Client data fetched:', client);

      // Pre-fill form data with client information
      updateFormData({
        full_name: client.name,
        email: client.email,
        mobile_phone: client.phone_number,
        // Keep other fields empty for manual input
      });
    }

    fetchClientData();
  }, [clientId, updateFormData]);
}
