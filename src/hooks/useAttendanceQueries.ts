import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

// Query Keys
export const attendanceKeys = {
  all: ['attendance'] as const,
  lists: () => [...attendanceKeys.all, 'list'] as const,
  list: (lessonId: string, context: 'ministerio' | 'recepcao') => 
    [...attendanceKeys.lists(), lessonId, context] as const,
};

// Hook para obter attendance de uma aula/evento específico
export function useAttendance(lessonId: string | undefined, context: 'ministerio' | 'recepcao' = 'ministerio') {
  return useQuery({
    queryKey: attendanceKeys.list(lessonId || '', context),
    queryFn: async () => {
      if (!lessonId) return null;

      const tableName = context === 'recepcao' ? 'reception_attendance' : 'attendance';
      const memberIdField = context === 'recepcao' ? 'member_id' : 'student_id';
      const eventIdField = context === 'recepcao' ? 'event_id' : 'lesson_id';

      const { data, error } = await supabase
        .from(tableName)
        .select(`${memberIdField}, present`)
        .eq(eventIdField, lessonId);

      if (error) throw error;

      // Converter para Record<string, boolean>
      const attendanceMap: Record<string, boolean> = {};
      data?.forEach((record: any) => {
        const memberId = record[memberIdField];
        attendanceMap[memberId] = record.present;
      });

      return attendanceMap;
    },
    enabled: !!lessonId,
  });
}

// Hook para salvar attendance (marca presença de vários alunos de uma vez)
export function useSaveAttendance(context: 'ministerio' | 'recepcao' = 'ministerio') {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      lessonId, 
      attendance 
    }: { 
      lessonId: string; 
      attendance: Record<string, boolean>;
    }) => {
      const tableName = context === 'recepcao' ? 'reception_attendance' : 'attendance';
      const memberIdField = context === 'recepcao' ? 'member_id' : 'student_id';
      const eventIdField = context === 'recepcao' ? 'event_id' : 'lesson_id';

      // Deletar attendance existente
      await supabase
        .from(tableName)
        .delete()
        .eq(eventIdField, lessonId);

      // Inserir novos registros apenas para os marcados
      const records = Object.entries(attendance)
        .filter(([_, present]) => present !== undefined)
        .map(([studentId, present]) => ({
          [eventIdField]: lessonId,
          [memberIdField]: studentId,
          present
        }));

      if (records.length > 0) {
        const { error } = await supabase
          .from(tableName)
          .insert(records);

        if (error) throw error;
      }

      return { lessonId, totalMarked: records.length };
    },
    onSuccess: ({ lessonId }) => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.list(lessonId, context) });
      // Invalida também os status dos estudantes
      queryClient.invalidateQueries({ queryKey: ['students', 'status'] });
    },
  });
}
