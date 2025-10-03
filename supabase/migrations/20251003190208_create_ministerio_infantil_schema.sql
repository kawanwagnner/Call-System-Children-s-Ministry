/*
  # Sistema de Chamada — Ministério Infantil
  
  1. New Tables
    - `groups` - Grupos do ministério (Peniel e Betel)
      - `id` (uuid, primary key)
      - `name` (text) - Nome do grupo, apenas 'Peniel' ou 'Betel'
      - `created_at` (timestamptz)
    
    - `students` - Cadastro de alunos
      - `id` (uuid, primary key)
      - `full_name` (text) - Nome completo do aluno
      - `birth_date` (date) - Data de nascimento
      - `sex` (text) - Sexo (M/F)
      - `group_id` (uuid) - Referência ao grupo
      - `guardian_name` (text) - Nome do responsável
      - `guardian_contact` (text) - Contato do responsável
      - `notes` (text) - Observações
      - `created_at` (timestamptz)
    
    - `lessons` - Aulas/Lições ministradas
      - `id` (uuid, primary key)
      - `title` (text) - Tema/Nome da aula
      - `date` (date) - Data da aula
      - `teacher` (text) - Nome do ministrante
      - `notes` (text) - Observações
      - `created_at` (timestamptz)
    
    - `attendance` - Registro de presença
      - `id` (uuid, primary key)
      - `lesson_id` (uuid) - Referência à aula
      - `student_id` (uuid) - Referência ao aluno
      - `present` (boolean) - Se o aluno estava presente
      - `created_at` (timestamptz)
      - Unique constraint em (lesson_id, student_id)
  
  2. Indexes
    - Index em attendance.student_id para busca rápida
    - Index em attendance.lesson_id para busca rápida
    - Index em students.group_id para filtros por grupo
  
  3. Security
    - RLS será habilitado em todas as tabelas
    - Policies serão criadas em migração separada
*/

-- Criar tabela de grupos
CREATE TABLE IF NOT EXISTS groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (name IN ('Peniel','Betel')),
  created_at timestamptz DEFAULT now()
);

-- Criar tabela de alunos
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  birth_date date,
  sex text CHECK (sex IN ('M','F')),
  group_id uuid REFERENCES groups(id) ON DELETE SET NULL,
  guardian_name text,
  guardian_contact text,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Criar tabela de aulas
CREATE TABLE IF NOT EXISTS lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  date date NOT NULL,
  teacher text,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Criar tabela de presença
CREATE TABLE IF NOT EXISTS attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  present boolean NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (lesson_id, student_id)
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON attendance (student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_lesson_id ON attendance (lesson_id);
CREATE INDEX IF NOT EXISTS idx_students_group_id ON students (group_id);