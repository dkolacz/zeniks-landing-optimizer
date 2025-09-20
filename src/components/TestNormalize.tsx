import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from './ui/button';
import { toast } from 'sonner';

export function TestNormalize() {
  const [loading, setLoading] = useState(false);

  const testNormalize = async () => {
    setLoading(true);
    console.log('Testing normalize function...');
    
    try {
      // Call the normalize function directly for result ID 24
      const { data, error } = await supabase.functions.invoke('normalize', {
        body: { result_id: 24 }
      });

      if (error) {
        console.error('Normalize error:', error);
        toast.error(`Normalize failed: ${error.message}`);
      } else {
        console.log('Normalize success:', data);
        toast.success('Normalization successful!');
        
        // Check if listing was created
        const { data: listings, count } = await supabase
          .from('listings')
          .select('*', { count: 'exact' });
          
        console.log('Total listings after normalize:', count);
        toast.success(`Total listings: ${count}`);
      }
    } catch (err) {
      console.error('Test error:', err);
      toast.error('Test failed');
    } finally {
      setLoading(false);
    }
  };

  const runManualNormalize = async () => {
    setLoading(true);
    console.log('Running manual normalize...');
    
    try {
      const { data, error } = await supabase.functions.invoke('manual-normalize');

      if (error) {
        console.error('Manual normalize error:', error);
        toast.error(`Manual normalize failed: ${error.message}`);
      } else {
        console.log('Manual normalize success:', data);
        toast.success(`Processed ${data.processed} results`);
      }
    } catch (err) {
      console.error('Manual normalize error:', err);
      toast.error('Manual normalize failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg space-y-4">
      <h3 className="text-lg font-semibold">Test Normalization</h3>
      <div className="space-x-2">
        <Button onClick={testNormalize} disabled={loading}>
          Test Single Normalize (ID 24)
        </Button>
        <Button onClick={runManualNormalize} disabled={loading} variant="outline">
          Run Manual Normalize All
        </Button>
      </div>
    </div>
  );
}