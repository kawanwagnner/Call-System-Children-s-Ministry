/*
  # Limpeza e Inserção de Dados de Teste
  
  Esta migration limpa os dados existentes e insere novos dados 
  para testar o sistema de status (Ativo/Faltoso/Inativo).
  
  ATENÇÃO: Esta migration remove todos os dados existentes!
*/

-- Limpar dados existentes (respeitando foreign keys)
DELETE FROM attendance;
DELETE FROM lessons;
DELETE FROM students;
DELETE FROM groups;

-- 1. INSERIR GRUPOS
INSERT INTO groups (id, name, created_at) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Peniel', '2024-01-01 10:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Betel', '2024-01-01 10:00:00+00');

-- 2. INSERIR ALUNOS
INSERT INTO students (id, full_name, birth_date, sex, group_id, guardian_name, guardian_contact, notes, created_at) VALUES
  -- Grupo Peniel (mais novos)
  ('550e8400-e29b-41d4-a716-446655440101', 'Ana Clara Silva', '2018-03-15', 'F', '550e8400-e29b-41d4-a716-446655440001', 'Maria Silva', '(11) 99999-1111', 'Criança muito ativa e participativa', '2024-02-01 09:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440102', 'Pedro Santos', '2017-08-22', 'M', '550e8400-e29b-41d4-a716-446655440001', 'João Santos', '(11) 99999-2222', 'Gosta de histórias bíblicas', '2024-02-01 09:15:00+00'),
  ('550e8400-e29b-41d4-a716-446655440103', 'Sofia Oliveira', '2018-11-10', 'F', '550e8400-e29b-41d4-a716-446655440001', 'Carla Oliveira', '(11) 99999-3333', 'Tem alergia a amendoim', '2024-02-05 10:30:00+00'),
  ('550e8400-e29b-41d4-a716-446655440104', 'Lucas Costa', '2017-12-05', 'M', '550e8400-e29b-41d4-a716-446655440001', 'Roberto Costa', '(11) 99999-4444', NULL, '2024-02-10 11:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440105', 'Isabela Lima', '2018-06-30', 'F', '550e8400-e29b-41d4-a716-446655440001', 'Fernanda Lima', '(11) 99999-5555', 'Muito tímida no início', '2024-02-15 14:20:00+00'),
  ('550e8400-e29b-41d4-a716-446655440106', 'Gabriel Rocha', '2017-09-18', 'M', '550e8400-e29b-41d4-a716-446655440001', 'Marcos Rocha', '(11) 99999-6666', 'Preletor natural do grupo', '2024-02-20 16:45:00+00'),
  ('550e8400-e29b-41d4-a716-446655440107', 'Emanuelle Ferreira', '2018-02-14', 'F', '550e8400-e29b-41d4-a716-446655440001', 'Paula Ferreira', '(11) 99999-7777', 'Gosta de cantar', '2024-03-01 08:30:00+00'),
  ('550e8400-e29b-41d4-a716-446655440108', 'Matheus Alves', '2018-04-25', 'M', '550e8400-e29b-41d4-a716-446655440001', 'Ana Alves', '(11) 99999-8888', NULL, '2024-03-05 13:15:00+00'),
  
  -- Grupo Betel (mais velhos)
  ('550e8400-e29b-41d4-a716-446655440201', 'Júlia Mendes', '2015-01-12', 'F', '550e8400-e29b-41d4-a716-446655440002', 'Cristina Mendes', '(11) 99999-9999', 'Excelente em memorização', '2024-01-15 10:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440202', 'Daniel Barbosa', '2014-07-08', 'M', '550e8400-e29b-41d4-a716-446655440002', 'Paulo Barbosa', '(11) 98888-1111', 'Ajuda com as crianças menores', '2024-01-20 11:30:00+00'),
  ('550e8400-e29b-41d4-a716-446655440203', 'Larissa Cardoso', '2015-10-22', 'F', '550e8400-e29b-41d4-a716-446655440002', 'Juliana Cardoso', '(11) 98888-2222', 'Tem facilidade com desenho', '2024-01-25 15:45:00+00'),
  ('550e8400-e29b-41d4-a716-446655440204', 'Samuel Nascimento', '2014-12-03', 'M', '550e8400-e29b-41d4-a716-446655440002', 'Ricardo Nascimento', '(11) 98888-3333', NULL, '2024-02-01 09:20:00+00'),
  ('550e8400-e29b-41d4-a716-446655440205', 'Beatriz Moreira', '2015-05-17', 'F', '550e8400-e29b-41d4-a716-446655440002', 'Sônia Moreira', '(11) 98888-4444', 'Gosta de teatro', '2024-02-08 12:10:00+00'),
  ('550e8400-e29b-41d4-a716-446655440206', 'João Victor Reis', '2014-09-11', 'M', '550e8400-e29b-41d4-a716-446655440002', 'Vanessa Reis', '(11) 98888-5555', 'Muito questionador', '2024-02-12 14:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440207', 'Amanda Pereira', '2015-08-26', 'F', '550e8400-e29b-41d4-a716-446655440002', 'Carlos Pereira', '(11) 98888-6666', 'Organizada e responsável', '2024-02-18 16:30:00+00'),
  ('550e8400-e29b-41d4-a716-446655440208', 'Rafael Araújo', '2015-03-09', 'M', '550e8400-e29b-41d4-a716-446655440002', 'Luciana Araújo', '(11) 98888-7777', NULL, '2024-03-02 10:45:00+00'),
  
  -- Alunos para testar status "Inativo" (cadastrados há mais de 60 dias)
  ('550e8400-e29b-41d4-a716-446655440301', 'Carlos Inactive', '2017-05-10', 'M', '550e8400-e29b-41d4-a716-446655440001', 'Pai Carlos', '(11) 97777-1111', 'Aluno inativo há meses', '2024-06-01 10:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440302', 'Marina Ausente', '2015-12-20', 'F', '550e8400-e29b-41d4-a716-446655440002', 'Mãe Marina', '(11) 97777-2222', 'Não vem há muito tempo', '2024-05-15 10:00:00+00');

-- 3. INSERIR AULAS
INSERT INTO lessons (id, title, date, teacher, notes, created_at) VALUES
  -- Aula antiga para testar status "Inativo" (mais de 60 dias atrás)
  ('550e8400-e29b-41d4-a716-446655440310', 'Aula Antiga - Davi', '2025-07-01', 'Tia Antiga', 'Aula de mais de 60 dias atrás', '2025-07-01 08:00:00+00'),
  
  -- Aulas recentes (setembro/outubro 2025)
  ('550e8400-e29b-41d4-a716-446655440301', 'A Criação do Mundo', '2025-09-01', 'Tia Sarah', 'Usamos fantoches e música', '2025-09-01 08:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440302', 'Noé e a Arca', '2025-09-08', 'Tio Carlos', 'Teatro com as crianças', '2025-09-08 08:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440303', 'Abraão - O Amigo de Deus', '2025-09-15', 'Tia Sarah', 'Dinâmica sobre obediência', '2025-09-15 08:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440304', 'José do Egito', '2025-09-22', 'Tia Marta', 'História com desenhos', '2025-09-22 08:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440305', 'Moisés no Egito', '2025-09-29', 'Tio Carlos', 'Encenação das pragas', '2025-09-29 08:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440306', 'Davi e Golias', '2025-10-01', 'Tia Sarah', 'Lição sobre coragem', '2025-10-01 08:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440307', 'Daniel na Cova dos Leões', '2025-10-02', 'Tia Marta', 'Sobre fidelidade a Deus', '2025-10-02 08:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440308', 'O Nascimento de Jesus', '2025-10-03', 'Tio Carlos', 'Preparação para o Natal', '2025-10-03 08:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440309', 'Jesus e as Crianças', CURRENT_DATE, 'Tia Sarah', 'Sobre o amor de Jesus', now());

-- 4. INSERIR PRESENÇAS ESTRATÉGICAS PARA TESTAR STATUS

-- Presença antiga (para aluno que ficará "Inativo")
INSERT INTO attendance (id, lesson_id, student_id, present, created_at) VALUES
  ('550e8400-e29b-41d4-a716-446655441001', '550e8400-e29b-41d4-a716-446655440310', '550e8400-e29b-41d4-a716-446655440105', true, '2025-07-01 09:00:00+00');

-- Presenças na última aula (atual) para definir status atual
INSERT INTO attendance (id, lesson_id, student_id, present, created_at) VALUES
  -- Grupo Peniel - ATIVOS (presentes na última aula)
  ('550e8400-e29b-41d4-a716-446655440901', '550e8400-e29b-41d4-a716-446655440309', '550e8400-e29b-41d4-a716-446655440101', true, now()), -- Ana Clara
  ('550e8400-e29b-41d4-a716-446655440902', '550e8400-e29b-41d4-a716-446655440309', '550e8400-e29b-41d4-a716-446655440102', true, now()), -- Pedro
  ('550e8400-e29b-41d4-a716-446655440904', '550e8400-e29b-41d4-a716-446655440309', '550e8400-e29b-41d4-a716-446655440104', true, now()), -- Lucas
  ('550e8400-e29b-41d4-a716-446655440906', '550e8400-e29b-41d4-a716-446655440309', '550e8400-e29b-41d4-a716-446655440106', true, now()), -- Gabriel
  ('550e8400-e29b-41d4-a716-446655440907', '550e8400-e29b-41d4-a716-446655440309', '550e8400-e29b-41d4-a716-446655440107', true, now()), -- Emanuelle
  
  -- Grupo Peniel - FALTOSOS (ausentes na última aula)
  ('550e8400-e29b-41d4-a716-446655440903', '550e8400-e29b-41d4-a716-446655440309', '550e8400-e29b-41d4-a716-446655440103', false, now()), -- Sofia
  ('550e8400-e29b-41d4-a716-446655440908', '550e8400-e29b-41d4-a716-446655440309', '550e8400-e29b-41d4-a716-446655440108', false, now()), -- Matheus
  
  -- Grupo Betel - ATIVOS (presentes na última aula)
  ('550e8400-e29b-41d4-a716-446655440909', '550e8400-e29b-41d4-a716-446655440309', '550e8400-e29b-41d4-a716-446655440201', true, now()), -- Júlia
  ('550e8400-e29b-41d4-a716-446655440910', '550e8400-e29b-41d4-a716-446655440309', '550e8400-e29b-41d4-a716-446655440202', true, now()), -- Daniel
  ('550e8400-e29b-41d4-a716-446655440911', '550e8400-e29b-41d4-a716-446655440309', '550e8400-e29b-41d4-a716-446655440203', true, now()), -- Larissa
  ('550e8400-e29b-41d4-a716-446655440913', '550e8400-e29b-41d4-a716-446655440309', '550e8400-e29b-41d4-a716-446655440205', true, now()), -- Beatriz
  ('550e8400-e29b-41d4-a716-446655440914', '550e8400-e29b-41d4-a716-446655440309', '550e8400-e29b-41d4-a716-446655440206', true, now()), -- João Victor
  ('550e8400-e29b-41d4-a716-446655440915', '550e8400-e29b-41d4-a716-446655440309', '550e8400-e29b-41d4-a716-446655440207', true, now()), -- Amanda
  ('550e8400-e29b-41d4-a716-446655440916', '550e8400-e29b-41d4-a716-446655440309', '550e8400-e29b-41d4-a716-446655440208', true, now()), -- Rafael
  
  -- Grupo Betel - FALTOSO (ausente na última aula)
  ('550e8400-e29b-41d4-a716-446655440912', '550e8400-e29b-41d4-a716-446655440309', '550e8400-e29b-41d4-a716-446655440204', false, now()); -- Samuel

-- Algumas presenças anteriores para dar histórico
INSERT INTO attendance (id, lesson_id, student_id, present, created_at) VALUES
  -- Aula anterior (2025-09-01) - alguns exemplos
  ('550e8400-e29b-41d4-a716-446655440401', '550e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440101', true, '2025-09-01 09:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440402', '550e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440102', true, '2025-09-01 09:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440403', '550e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440103', true, '2025-09-01 09:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440404', '550e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440104', false, '2025-09-01 09:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440405', '550e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440201', true, '2025-09-01 09:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440406', '550e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440202', true, '2025-09-01 09:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440407', '550e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440203', false, '2025-09-01 09:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440408', '550e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440204', true, '2025-09-01 09:00:00+00');

/*
  # Resultado Esperado dos Status:
  
  ## ATIVOS (presentes na última aula atual):
  - Ana Clara Silva (Peniel)
  - Pedro Santos (Peniel)
  - Lucas Costa (Peniel)
  - Gabriel Rocha (Peniel)
  - Emanuelle Ferreira (Peniel)
  - Júlia Mendes (Betel)
  - Daniel Barbosa (Betel)
  - Larissa Cardoso (Betel)
  - Beatriz Moreira (Betel)
  - João Victor Reis (Betel)
  - Amanda Pereira (Betel)
  - Rafael Araújo (Betel)
  
  ## FALTOSOS (ausentes na última aula atual):
  - Sofia Oliveira (Peniel)
  - Matheus Alves (Peniel)
  - Samuel Nascimento (Betel)
  
  ## INATIVOS (sem presença há ≥60 dias ou nunca tiveram):
  - Isabela Lima (última presença em 2025-07-01)
  - Carlos Inactive (nunca teve presença)
  - Marina Ausente (nunca teve presença)
  
  # Para testar:
  SELECT * FROM v_student_status ORDER BY status, group_name, full_name;
*/