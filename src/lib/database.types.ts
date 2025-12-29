export type GroupName = 'Peniel' | 'Lírios';
export type StudentStatus = 'Ativo' | 'Faltoso' | 'Inativo';
export type Sex = 'M' | 'F';

// Tipos para Recepção
export type MemberType = 'Membro' | 'Visitante';
export type EventType = 'Culto' | 'Reunião' | 'Evento Especial';
export type MemberStatus = 'Ativo' | 'Moderado' | 'Inativo' | 'Sem Registro';

export interface Database {
  public: {
    Tables: {
      groups: {
        Row: {
          id: string;
          name: GroupName;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: GroupName;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: GroupName;
          created_at?: string;
        };
      };
      students: {
        Row: {
          id: string;
          full_name: string;
          birth_date: string | null;
          sex: Sex | null;
          group_id: string | null;
          guardian_name: string | null;
          guardian_contact: string | null;
          notes: string | null;
          photo_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          birth_date?: string | null;
          sex?: Sex | null;
          group_id?: string | null;
          guardian_name?: string | null;
          guardian_contact?: string | null;
          notes?: string | null;
          photo_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          birth_date?: string | null;
          sex?: Sex | null;
          group_id?: string | null;
          guardian_name?: string | null;
          guardian_contact?: string | null;
          notes?: string | null;
          photo_url?: string | null;
          created_at?: string;
        };
      };
      lessons: {
        Row: {
          id: string;
          title: string;
          date: string;
          teacher: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          date: string;
          teacher?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          date?: string;
          teacher?: string | null;
          notes?: string | null;
          created_at?: string;
        };
      };
      attendance: {
        Row: {
          id: string;
          lesson_id: string;
          student_id: string;
          present: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          lesson_id: string;
          student_id: string;
          present: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          lesson_id?: string;
          student_id?: string;
          present?: boolean;
          created_at?: string;
        };
      };
      // Tabelas da Recepção
      reception_groups: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
        };
      };
      reception_members: {
        Row: {
          id: string;
          full_name: string;
          birth_date: string | null;
          sex: Sex | null;
          member_type: MemberType;
          group_id: string | null;
          contact_phone: string | null;
          contact_email: string | null;
          address: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          birth_date?: string | null;
          sex?: Sex | null;
          member_type: MemberType;
          group_id?: string | null;
          contact_phone?: string | null;
          contact_email?: string | null;
          address?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          birth_date?: string | null;
          sex?: Sex | null;
          member_type?: MemberType;
          group_id?: string | null;
          contact_phone?: string | null;
          contact_email?: string | null;
          address?: string | null;
          notes?: string | null;
          created_at?: string;
        };
      };
      reception_events: {
        Row: {
          id: string;
          title: string;
          date: string;
          start_time: string | null;
          event_type: EventType;
          leader: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          date: string;
          start_time?: string | null;
          event_type: EventType;
          leader?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          date?: string;
          start_time?: string | null;
          event_type?: EventType;
          leader?: string | null;
          notes?: string | null;
          created_at?: string;
        };
      };
      reception_attendance: {
        Row: {
          id: string;
          event_id: string;
          member_id: string;
          present: boolean;
          check_in_time: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          member_id: string;
          present: boolean;
          check_in_time?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          member_id?: string;
          present?: boolean;
          check_in_time?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      v_student_status: {
        Row: {
          student_id: string;
          full_name: string;
          group_name: GroupName | null;
          reference_present_at: string;
          status: StudentStatus;
        };
      };
      v_reception_member_status: {
        Row: {
          member_id: string;
          full_name: string;
          member_type: MemberType;
          group_name: string | null;
          status: MemberStatus;
          total_events: number;
          total_presences: number;
          attendance_percentage: number;
        };
      };
      v_reception_attendance_summary: {
        Row: {
          event_id: string;
          title: string;
          date: string;
          event_type: EventType;
          leader: string | null;
          total_registered: number;
          total_present: number;
          total_absent: number;
          attendance_percentage: number;
        };
      };
    };
  };
}

export type Student = Database['public']['Tables']['students']['Row'];
export type StudentInsert = Database['public']['Tables']['students']['Insert'];
export type StudentUpdate = Database['public']['Tables']['students']['Update'];

export type Lesson = Database['public']['Tables']['lessons']['Row'];
export type LessonInsert = Database['public']['Tables']['lessons']['Insert'];
export type LessonUpdate = Database['public']['Tables']['lessons']['Update'];

export type Attendance = Database['public']['Tables']['attendance']['Row'];
export type AttendanceInsert = Database['public']['Tables']['attendance']['Insert'];

export type Group = Database['public']['Tables']['groups']['Row'];

export type StudentWithStatus = Database['public']['Views']['v_student_status']['Row'];

// Tipos para Recepção
export type ReceptionGroup = Database['public']['Tables']['reception_groups']['Row'];
export type ReceptionGroupInsert = Database['public']['Tables']['reception_groups']['Insert'];
export type ReceptionGroupUpdate = Database['public']['Tables']['reception_groups']['Update'];

export type ReceptionMember = Database['public']['Tables']['reception_members']['Row'];
export type ReceptionMemberInsert = Database['public']['Tables']['reception_members']['Insert'];
export type ReceptionMemberUpdate = Database['public']['Tables']['reception_members']['Update'];

export type ReceptionEvent = Database['public']['Tables']['reception_events']['Row'];
export type ReceptionEventInsert = Database['public']['Tables']['reception_events']['Insert'];
export type ReceptionEventUpdate = Database['public']['Tables']['reception_events']['Update'];

export type ReceptionAttendance = Database['public']['Tables']['reception_attendance']['Row'];
export type ReceptionAttendanceInsert = Database['public']['Tables']['reception_attendance']['Insert'];

export type ReceptionMemberWithStatus = Database['public']['Views']['v_reception_member_status']['Row'];
export type ReceptionAttendanceSummary = Database['public']['Views']['v_reception_attendance_summary']['Row'];

// Tipos para as funções RPC (Remote Procedure Calls)
export interface VerificacaoAlunosNaoMarcados {
  total_alunos: number;
  total_marcados: number;
  total_nao_marcados: number;
  alunos_nao_marcados: string[];
  precisa_confirmacao: boolean;
  mensagem_confirmacao: string;
}

export interface ResultadoSalvarChamada {
  success: boolean;
  message: string;
  lesson_id: string;
  resumo: {
    total_alunos: number;
    total_presentes: number;
    total_ausentes: number;
    total_nao_marcados: number;
  };
  alunos_nao_marcados: string[];
  todos_alunos_ausentes: string[];
  precisa_confirmacao: boolean;
  mensagem_confirmacao: string;
  timestamp: string;
}
