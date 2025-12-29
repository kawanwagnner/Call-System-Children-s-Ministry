import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

// Query Keys
export const reportKeys = {
  all: ['reports'] as const,
  context: (context: 'ministerio' | 'recepcao') => [...reportKeys.all, context] as const,
};

// Hook para obter dados de relatórios
export function useReportsData(context: 'ministerio' | 'recepcao') {
  return useQuery({
    queryKey: reportKeys.context(context),
    queryFn: async () => {
      if (context === 'recepcao') {
        // Carregar dados da recepção
        const [membersRes, groupRes, eventsRes] = await Promise.all([
          supabase.from('v_reception_member_status').select('*'),
          supabase.from('reception_groups').select('*'),
          supabase.from('v_reception_attendance_summary').select('*').order('date', { ascending: false }).limit(10)
        ]);

        if (membersRes.error) throw membersRes.error;
        if (groupRes.error) throw groupRes.error;
        if (eventsRes.error) throw eventsRes.error;

        // Processar membros
        const memberStats = membersRes.data.map((member: any) => ({
          full_name: member.full_name,
          presenca_percent: member.attendance_percentage,
          presencas: member.total_presences,
          faltas: member.total_events - member.total_presences,
          member_type: member.member_type
        }));

        // Ausentes (membros com baixa frequência)
        const lowAttendanceMembers = membersRes.data
          .filter((m: any) => m.attendance_percentage < 50)
          .map((m: any) => ({
            full_name: m.full_name,
            group_name: m.group_name,
            member_type: m.member_type,
            contact_phone: m.contact_phone,
            contact_email: m.contact_email
          }));

        // Processar grupos (simplificado)
        const groupStats = groupRes.data.map((group: any) => ({
          grupo: group.name,
          presenca_percent: null,
          presencas: 0,
          faltas: 0
        }));

        // Processar eventos
        const lessonStats = eventsRes.data.map((event: any) => ({
          date: event.date,
          title: event.title || 'Evento',
          presentes: event.total_present || 0,
          ausentes: event.total_absent || 0,
          total: event.total_marked || 0
        }));

        return {
          absentToday: lowAttendanceMembers,
          studentStats: memberStats,
          groupStats,
          lessonStats
        };
      } else {
        // Carregar dados do Ministério Infantil
        const [lessonsRes, studentsRes, groupsRes, recentLessonsRes] = await Promise.all([
          supabase.from('lessons').select(`
            id,
            title,
            date,
            attendance (
              present,
              student_id
            )
          `).order('date', { ascending: false }),
          
          supabase.from('students').select(`
            id,
            full_name,
            guardian_name,
            guardian_contact,
            groups (name)
          `),
          
          supabase.from('groups').select(`
            id,
            name
          `),
          
          supabase.from('lessons').select(`
            id,
            title,
            date,
            attendance (
              present,
              student_id
            )
          `).order('date', { ascending: false }).limit(10)
        ]);

        if (lessonsRes.error) throw lessonsRes.error;
        if (studentsRes.error) throw studentsRes.error;
        if (groupsRes.error) throw groupsRes.error;
        if (recentLessonsRes.error) throw recentLessonsRes.error;

        // Processar estatísticas de alunos
        const studentMap = new Map();
        lessonsRes.data.forEach((lesson: any) => {
          lesson.attendance?.forEach((att: any) => {
            const student = studentsRes.data.find((s: any) => s.id === att.student_id);
            if (student) {
              if (!studentMap.has(student.id)) {
                studentMap.set(student.id, {
                  full_name: student.full_name,
                  presencas: 0,
                  faltas: 0,
                  guardian_name: student.guardian_name,
                  guardian_contact: student.guardian_contact,
                  group_name: student.groups?.name
                });
              }
              const stats = studentMap.get(student.id);
              if (att.present) {
                stats.presencas++;
              } else {
                stats.faltas++;
              }
            }
          });
        });

        const studentStats = Array.from(studentMap.values()).map((stats: any) => ({
          ...stats,
          presenca_percent: stats.presencas + stats.faltas > 0
            ? Math.round((stats.presencas / (stats.presencas + stats.faltas)) * 100)
            : null
        }));

        // Alunos ausentes da última aula registrada
        let absentToday: any[] = [];
        let lastLessonDate: string | null = null;
        
        if (lessonsRes.data.length > 0) {
          const lastLesson = lessonsRes.data[0]; // Última aula (já ordenado por data desc)
          lastLessonDate = lastLesson.date;
          
          const absentStudentIds = lastLesson.attendance
            ?.filter((a: any) => !a.present)
            .map((a: any) => a.student_id) || [];
          
          absentToday = studentsRes.data
            .filter((s: any) => absentStudentIds.includes(s.id))
            .map((s: any) => ({
              full_name: s.full_name,
              guardian_name: s.guardian_name,
              guardian_contact: s.guardian_contact,
              group_name: s.groups?.name
            }));
        }

        // Alunos com baixa frequência (< 50%)
        const lowAttendanceStudents = studentStats
          .filter((s: any) => s.presenca_percent !== null && s.presenca_percent < 50)
          .map((s: any) => ({
            full_name: s.full_name,
            guardian_name: s.guardian_name,
            guardian_contact: s.guardian_contact,
            group_name: s.group_name,
            presenca_percent: s.presenca_percent
          }));

        // Estatísticas por grupo (simplificado)
        const groupStats = groupsRes.data.map((group: any) => ({
          grupo: group.name,
          presenca_percent: null,
          presencas: 0,
          faltas: 0
        }));

        // Estatísticas de aulas recentes
        const lessonStats = recentLessonsRes.data.map((lesson: any) => {
          const presentes = lesson.attendance?.filter((a: any) => a.present).length || 0;
          const ausentes = lesson.attendance?.filter((a: any) => !a.present).length || 0;
          return {
            date: lesson.date,
            title: lesson.title,
            presentes,
            ausentes,
            total: presentes + ausentes
          };
        });

        return {
          absentToday,
          lastLessonDate,
          lowAttendanceStudents,
          studentStats,
          groupStats,
          lessonStats
        };
      }
    },
  });
}
