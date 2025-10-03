/*
  # Row Level Security (RLS) Setup
  
  1. Descrição
    - Habilita RLS em todas as tabelas do sistema
    - Cria policies permissivas para usuários autenticados
    
  2. Security Model
    - Apenas usuários autenticados podem acessar os dados
    - SELECT: qualquer usuário autenticado pode ler
    - INSERT: qualquer usuário autenticado pode inserir
    - UPDATE: qualquer usuário autenticado pode atualizar
    - DELETE: qualquer usuário autenticado pode deletar
    
  3. Tabelas Protegidas
    - students: cadastro de alunos
    - lessons: registro de aulas
    - attendance: chamadas/presenças
    - groups: grupos (leitura pública)
    
  4. Nota
    - Este é um modelo simples para um único ministério
    - Para multi-igreja, adicionar org_id e ajustar policies
*/

-- Habilitar RLS em todas as tabelas
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

-- Policies para students
CREATE POLICY "Authenticated users can view students"
  ON students FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert students"
  ON students FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update students"
  ON students FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete students"
  ON students FOR DELETE
  TO authenticated
  USING (true);

-- Policies para lessons
CREATE POLICY "Authenticated users can view lessons"
  ON lessons FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert lessons"
  ON lessons FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update lessons"
  ON lessons FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete lessons"
  ON lessons FOR DELETE
  TO authenticated
  USING (true);

-- Policies para attendance
CREATE POLICY "Authenticated users can view attendance"
  ON attendance FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert attendance"
  ON attendance FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update attendance"
  ON attendance FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete attendance"
  ON attendance FOR DELETE
  TO authenticated
  USING (true);

-- Policies para groups (leitura pública para facilitar UI)
CREATE POLICY "Anyone can view groups"
  ON groups FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage groups"
  ON groups FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);