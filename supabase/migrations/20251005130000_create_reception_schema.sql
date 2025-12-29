/*
  # Sistema de Chamada — Recepção da Igreja
  
  1. New Tables
    - `reception_groups` - Grupos/Células da igreja
      - `id` (uuid, primary key)
      - `name` (text) - Nome do grupo/célula
      - `created_at` (timestamptz)
    
    - `reception_members` - Cadastro de membros da igreja
      - `id` (uuid, primary key)
      - `full_name` (text) - Nome completo do membro
      - `birth_date` (date) - Data de nascimento
      - `sex` (text) - Sexo (M/F)
      - `member_type` (text) - Tipo: 'Membro' ou 'Visitante'
      - `group_id` (uuid) - Referência ao grupo/célula (opcional)
      - `contact_phone` (text) - Telefone de contato
      - `contact_email` (text) - Email de contato
      - `address` (text) - Endereço
      - `notes` (text) - Observações
      - `photo_url` (text) - URL da foto
      - `created_at` (timestamptz)
    
    - `reception_events` - Cultos/Eventos da igreja
      - `id` (uuid, primary key)
      - `title` (text) - Nome do evento/culto
      - `date` (date) - Data do evento
      - `start_time` (time) - Horário de início
      - `event_type` (text) - Tipo: 'Culto', 'Reunião', 'Evento Especial'
      - `leader` (text) - Nome do Preletor/pastor responsável
      - `notes` (text) - Observações
      - `created_at` (timestamptz)
    
    - `reception_attendance` - Registro de presença nos eventos
      - `id` (uuid, primary key)
      - `event_id` (uuid) - Referência ao evento
      - `member_id` (uuid) - Referência ao membro
      - `present` (boolean) - Se o membro estava presente
      - `check_in_time` (timestamptz) - Horário do check-in
      - `created_at` (timestamptz)
      - Unique constraint em (event_id, member_id)
  
  2. Indexes
    - Index em reception_attendance.member_id para busca rápida
    - Index em reception_attendance.event_id para busca rápida
    - Index em reception_members.group_id para filtros por grupo
    - Index em reception_members.member_type para filtros por tipo
  
  3. Security
    - RLS será habilitado em todas as tabelas
    - Policies serão criadas em migração separada
*/

-- Criar tabela de grupos/células da recepção
CREATE TABLE IF NOT EXISTS reception_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Criar tabela de membros da igreja
CREATE TABLE IF NOT EXISTS reception_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  birth_date date,
  sex text CHECK (sex IN ('M', 'F')),
  member_type text NOT NULL DEFAULT 'Membro' CHECK (member_type IN ('Membro', 'Visitante')),
  group_id uuid REFERENCES reception_groups(id),
  contact_phone text,
  contact_email text,
  address text,
  notes text,
  photo_url text,
  created_at timestamptz DEFAULT now()
);

-- Criar tabela de eventos/cultos
CREATE TABLE IF NOT EXISTS reception_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  date date NOT NULL,
  start_time time,
  event_type text NOT NULL DEFAULT 'Culto' CHECK (event_type IN ('Culto', 'Reunião', 'Evento Especial')),
  leader text,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Criar tabela de presenças nos eventos
CREATE TABLE IF NOT EXISTS reception_attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES reception_events(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES reception_members(id) ON DELETE CASCADE,
  present boolean NOT NULL DEFAULT true,
  check_in_time timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(event_id, member_id)
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_reception_members_group_id ON reception_members(group_id);
CREATE INDEX IF NOT EXISTS idx_reception_members_member_type ON reception_members(member_type);
CREATE INDEX IF NOT EXISTS idx_reception_attendance_member_id ON reception_attendance(member_id);
CREATE INDEX IF NOT EXISTS idx_reception_attendance_event_id ON reception_attendance(event_id);
CREATE INDEX IF NOT EXISTS idx_reception_events_date ON reception_events(date);

-- Inserir alguns grupos padrão
INSERT INTO reception_groups (name) VALUES 
  ('Célula Central'),
  ('Célula Norte'),
  ('Célula Sul'),
  ('Ministério de Louvor'),
  ('Diretoria')
ON CONFLICT DO NOTHING;