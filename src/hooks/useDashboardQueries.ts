import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

// Query Keys
export const dashboardKeys = {
  all: ['dashboard'] as const,
  stats: (context: 'ministerio' | 'recepcao') => [...dashboardKeys.all, 'stats', context] as const,
};

// Hook para obter estatísticas do dashboard
export function useDashboardStats(context: 'ministerio' | 'recepcao' = 'ministerio') {
  return useQuery({
    queryKey: dashboardKeys.stats(context),
    queryFn: async () => {
      if (context === 'recepcao') {
        const [membersRes, eventsRes, recentEventsRes] = await Promise.all([
          supabase.from('reception_members').select('id', { count: 'exact' }),
          supabase.from('reception_events').select('id', { count: 'exact' }),
          supabase.from('reception_events').select('*').order('date', { ascending: false }).limit(1)
        ]);

        return {
          totalStudents: membersRes.count || 0,
          totalLessons: eventsRes.count || 0,
          lastLessonDate: (recentEventsRes.data as any)?.[0]?.date || null
        };
      } else {
        const [studentsRes, lessonsRes, recentLessonsRes] = await Promise.all([
          supabase.from('students').select('id', { count: 'exact' }),
          supabase.from('lessons').select('id', { count: 'exact' }),
          supabase.from('lessons').select('*').order('date', { ascending: false }).limit(1)
        ]);

        return {
          totalStudents: studentsRes.count || 0,
          totalLessons: lessonsRes.count || 0,
          lastLessonDate: (recentLessonsRes.data as any)?.[0]?.date || null
        };
      }
    },
  });
}
