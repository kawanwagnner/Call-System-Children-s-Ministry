export type GroupName = 'Peniel' | 'Lírios';
export type StudentStatus = 'Ativo' | 'Faltoso' | 'Inativo';
export type Sex = 'M' | 'F';

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
