import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Group = Database['public']['Tables']['groups']['Row'];
type ReceptionGroup = Database['public']['Tables']['reception_groups']['Row'];

// Query Keys
export const groupKeys = {
  all: ['groups'] as const,
  lists: () => [...groupKeys.all, 'list'] as const,
  list: (context: 'ministerio' | 'recepcao') => [...groupKeys.lists(), context] as const,
};

// Hook para listar grupos
export function useGroups(context: 'ministerio' | 'recepcao' = 'ministerio') {
  return useQuery({
    queryKey: groupKeys.list(context),
    queryFn: async () => {
      const tableName = context === 'recepcao' ? 'reception_groups' : 'groups';
      const { data, error } = await supabase
        .from(tableName)
        .select('*');

      if (error) throw error;
      return data as (Group | ReceptionGroup)[];
    },
  });
}
