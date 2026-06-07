import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useRealtimeData<T>(
  tableName: string, 
  orderByColumn: string = 'created_at', 
  ascending: boolean = true,
  fallbackData?: T[]
) {
  const [data, setData] = useState<T[]>(fallbackData || []);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      const { data: fetchedData, error } = await supabase
        .from(tableName)
        .select('*')
        .order(orderByColumn, { ascending });

      if (fetchedData && fetchedData.length > 0) {
        setData(fetchedData as T[]);
      } else if (fallbackData && fallbackData.length > 0 && !fetchedData?.length && !error) {
         // Optionally seed data if table is empty, handled by the components if needed
      }
      setLoading(false);
    };

    fetchData();

    const channel = supabase
      .channel(`realtime_${tableName}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: tableName },
        async () => {
          const { data: updatedData } = await supabase
            .from(tableName)
            .select('*')
            .order(orderByColumn, { ascending });
            
          if (updatedData) {
            setData(updatedData as T[]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tableName, orderByColumn, ascending]);

  return { data, loading, setData };
}
