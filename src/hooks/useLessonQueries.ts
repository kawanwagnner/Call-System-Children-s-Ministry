import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Lesson = Database['public']['Tables']['lessons']['Row'];
type ReceptionEvent = Database['public']['Tables']['reception_events']['Row'];

// Query Keys
export const lessonKeys = {
  all: ['lessons'] as const,
  lists: () => [...lessonKeys.all, 'list'] as const,
  list: (context: 'ministerio' | 'recepcao') => [...lessonKeys.lists(), context] as const,
  details: () => [...lessonKeys.all, 'detail'] as const,
  detail: (id: string) => [...lessonKeys.details(), id] as const,
};

// Hook para listar aulas/eventos
export function useLessons(context: 'ministerio' | 'recepcao' = 'ministerio') {
  return useQuery({
    queryKey: lessonKeys.list(context),
    queryFn: async () => {
      const tableName = context === 'recepcao' ? 'reception_events' : 'lessons';
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      return data as (Lesson | ReceptionEvent)[];
    },
  });
}

// Hook para obter uma aula/evento específico
export function useLesson(id: string | undefined, context: 'ministerio' | 'recepcao' = 'ministerio') {
  return useQuery({
    queryKey: lessonKeys.detail(id || ''),
    queryFn: async () => {
      if (!id) return null;
      const tableName = context === 'recepcao' ? 'reception_events' : 'lessons';

      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Lesson | ReceptionEvent;
    },
    enabled: !!id,
  });
}

// Hook para criar uma aula/evento
export function useCreateLesson(context: 'ministerio' | 'recepcao' = 'ministerio') {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newLesson: Omit<Lesson | ReceptionEvent, 'id' | 'created_at'>) => {
      const tableName = context === 'recepcao' ? 'reception_events' : 'lessons';
      const { data, error } = await supabase
        .from(tableName)
        .insert([newLesson])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lessonKeys.list(context) });
    },
  });
}

// Hook para atualizar uma aula/evento
export function useUpdateLesson(context: 'ministerio' | 'recepcao' = 'ministerio') {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Lesson | ReceptionEvent> }) => {
      const tableName = context === 'recepcao' ? 'reception_events' : 'lessons';
      const { data, error } = await supabase
        .from(tableName)
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: lessonKeys.list(context) });
      queryClient.invalidateQueries({ queryKey: lessonKeys.detail(data.id) });
    },
  });
}

// Hook para deletar uma aula/evento
export function useDeleteLesson(context: 'ministerio' | 'recepcao' = 'ministerio') {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const tableName = context === 'recepcao' ? 'reception_events' : 'lessons';
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lessonKeys.list(context) });
    },
  });
}
