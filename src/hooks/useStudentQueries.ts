import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Student = Database['public']['Tables']['students']['Row'];

// Query Keys - centralizados para facilitar invalidação
export const studentKeys = {
  all: ['students'] as const,
  lists: () => [...studentKeys.all, 'list'] as const,
  list: (context: 'ministerio' | 'recepcao') => [...studentKeys.lists(), context] as const,
  details: () => [...studentKeys.all, 'detail'] as const,
  detail: (id: string) => [...studentKeys.details(), id] as const,
  status: () => [...studentKeys.all, 'status'] as const,
  statusList: (context: 'ministerio' | 'recepcao') => [...studentKeys.status(), context] as const,
};

// Hook para listar todos os alunos com status
export function useStudentsWithStatus(context: 'ministerio' | 'recepcao' = 'ministerio') {
  return useQuery({
    queryKey: studentKeys.statusList(context),
    queryFn: async () => {
      if (context === 'recepcao') {
        // Carrega dados da Recepção
        const { data: membersData, error: membersError } = await supabase
          .from('reception_members')
          .select(`
            *,
            reception_groups:group_id(name)
          `)
          .order('full_name');

        if (membersError) throw membersError;

        // Get status data from view
        const { data: statusData, error: statusError } = await supabase
          .from('v_reception_member_status')
          .select('*');

        if (statusError) throw statusError;

        const membersWithStatus = membersData.map((member: any) => {
          const statusInfo = statusData.find((s: any) => s.member_id === member.id);
          return {
            student_id: member.id,
            member_id: member.id, // Adiciona member_id para compatibilidade com AttendancePage
            id: member.id,
            group_id: member.group_id, // Adiciona group_id para filtro por grupo da aula
            full_name: member.full_name,
            member_type: member.member_type,
            contact_phone: member.contact_phone,
            contact_email: member.contact_email,
            group_name: member.reception_groups?.name || null,
            status: (statusInfo as any)?.status || 'Sem Registro',
            attendance_percentage: (statusInfo as any)?.attendance_percentage || 0,
            total_events: (statusInfo as any)?.total_events || 0,
            total_presences: (statusInfo as any)?.total_presences || 0,
            birth_date: member.birth_date,
            sex: member.sex,
            address: member.address,
            notes: member.notes
          };
        });

        return membersWithStatus;
      } else {
        // Carrega dados do Ministério Infantil
        const { data: studentsData, error: studentsError } = await supabase
          .from('students')
          .select(`
            *,
            groups:group_id(name)
          `)
          .order('full_name');

        if (studentsError) throw studentsError;

        const { data: statusData, error: statusError } = await supabase
          .from('v_student_status')
          .select('student_id, status');

        if (statusError) throw statusError;

        const studentsWithStatus = studentsData.map((student: any) => {
          const statusInfo = statusData.find((s: any) => s.student_id === student.id);
          return {
            ...student,
            student_id: student.id, // Garante que student_id está presente
            group_id: student.group_id, // Adiciona group_id explicitamente
            group_name: student.groups?.name || null,
            status: statusInfo?.status || 'Sem Registro'
          };
        });

        return studentsWithStatus;
      }
    },
  });
}

// Hook para listar todos os alunos (sem status)
export function useStudents(context: 'ministerio' | 'recepcao' = 'ministerio') {
  return useQuery({
    queryKey: studentKeys.list(context),
    queryFn: async () => {
      const tableName = context === 'recepcao' ? 'reception_members' : 'students';
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .order('full_name');

      if (error) throw error;
      return data as Student[];
    },
  });
}

// Hook para obter um aluno específico
export function useStudent(id: string | undefined, context: 'ministerio' | 'recepcao' = 'ministerio') {
  return useQuery({
    queryKey: studentKeys.detail(id || ''),
    queryFn: async () => {
      if (!id) return null;

      const tableName = context === 'recepcao' ? 'reception_members' : 'students';
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Student;
    },
    enabled: !!id, // Só executa se tiver id
  });
}

// Hook para criar um aluno
export function useCreateStudent(context: 'ministerio' | 'recepcao' = 'ministerio') {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newStudent: any) => {
      const tableName = context === 'recepcao' ? 'reception_members' : 'students';
      const { data, error } = await supabase
        .from(tableName)
        .insert([newStudent])
        .select()
        .single();

      if (error) throw error;
      return data as Student;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentKeys.list(context) });
      queryClient.invalidateQueries({ queryKey: studentKeys.statusList(context) });
    },
  });
}

// Hook para atualizar um aluno
export function useUpdateStudent(context: 'ministerio' | 'recepcao' = 'ministerio') {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Student> }) => {
      const tableName = context === 'recepcao' ? 'reception_members' : 'students';
      const { data, error } = await supabase
        .from(tableName)
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Student;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: studentKeys.list(context) });
      queryClient.invalidateQueries({ queryKey: studentKeys.statusList(context) });
      queryClient.invalidateQueries({ queryKey: studentKeys.detail(data.id) });
    },
  });
}

// Hook para deletar um aluno
export function useDeleteStudent(context: 'ministerio' | 'recepcao' = 'ministerio') {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const tableName = context === 'recepcao' ? 'reception_members' : 'students';
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentKeys.list(context) });
      queryClient.invalidateQueries({ queryKey: studentKeys.statusList(context) });
    },
  });
}
