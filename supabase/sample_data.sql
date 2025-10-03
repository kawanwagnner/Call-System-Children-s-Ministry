/*
  # Dados de Exemplo - Sistema de Chamada Ministério Infantil
  
  Este arquivo contém INSERT statements para popular todas as tabelas
  do sistema com dados de exemplo realistas.
  
  Ordem de inserção:
  1. groups - Grupos do ministério
  2. students - Alunos cadastrados
  3. lessons - Aulas ministradas
  4. attendance - Registro de presenças
*/

-- 1. INSERIR GRUPOS
INSERT INTO groups (id, name, created_at) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Peniel', '2024-01-01 10:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Lírios', '2024-01-01 10:00:00+00');

-- 2. INSERIR ALUNOS
INSERT INTO students (id, full_name, birth_date, sex, group_id, guardian_name, guardian_contact, notes, created_at) VALUES
  -- Grupo Peniel (mais novos)
  ('550e8400-e29b-41d4-a716-446655440101', 'Ana Clara Silva', '2018-03-15', 'F', '550e8400-e29b-41d4-a716-446655440001', 'Maria Silva', '(11) 99999-1111', 'Criança muito ativa e participativa', '2024-02-01 09:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440102', 'Pedro Santos', '2017-08-22', 'M', '550e8400-e29b-41d4-a716-446655440001', 'João Santos', '(11) 99999-2222', 'Gosta de histórias bíblicas', '2024-02-01 09:15:00+00'),
  ('550e8400-e29b-41d4-a716-446655440103', 'Sofia Oliveira', '2018-11-10', 'F', '550e8400-e29b-41d4-a716-446655440001', 'Carla Oliveira', '(11) 99999-3333', 'Tem alergia a amendoim', '2024-02-05 10:30:00+00'),
  ('550e8400-e29b-41d4-a716-446655440104', 'Lucas Costa', '2017-12-05', 'M', '550e8400-e29b-41d4-a716-446655440001', 'Roberto Costa', '(11) 99999-4444', NULL, '2024-02-10 11:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440105', 'Isabela Lima', '2018-06-30', 'F', '550e8400-e29b-41d4-a716-446655440001', 'Fernanda Lima', '(11) 99999-5555', 'Muito tímida no início', '2024-02-15 14:20:00+00'),
  ('550e8400-e29b-41d4-a716-446655440106', 'Gabriel Rocha', '2017-09-18', 'M', '550e8400-e29b-41d4-a716-446655440001', 'Marcos Rocha', '(11) 99999-6666', 'Líder natural do grupo', '2024-02-20 16:45:00+00'),
  ('550e8400-e29b-41d4-a716-446655440107', 'Emanuelle Ferreira', '2018-02-14', 'F', '550e8400-e29b-41d4-a716-446655440001', 'Paula Ferreira', '(11) 99999-7777', 'Gosta de cantar', '2024-03-01 08:30:00+00'),
  ('550e8400-e29b-41d4-a716-446655440108', 'Matheus Alves', '2018-04-25', 'M', '550e8400-e29b-41d4-a716-446655440001', 'Ana Alves', '(11) 99999-8888', NULL, '2024-03-05 13:15:00+00'),
  
  -- Grupo Lírios (mais velhos)
  ('550e8400-e29b-41d4-a716-446655440201', 'Júlia Mendes', '2015-01-12', 'F', '550e8400-e29b-41d4-a716-446655440002', 'Cristina Mendes', '(11) 99999-9999', 'Excelente em memorização', '2024-01-15 10:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440202', 'Daniel Barbosa', '2014-07-08', 'M', '550e8400-e29b-41d4-a716-446655440002', 'Paulo Barbosa', '(11) 98888-1111', 'Ajuda com as crianças menores', '2024-01-20 11:30:00+00'),
  ('550e8400-e29b-41d4-a716-446655440203', 'Larissa Cardoso', '2015-10-22', 'F', '550e8400-e29b-41d4-a716-446655440002', 'Juliana Cardoso', '(11) 98888-2222', 'Tem facilidade com desenho', '2024-01-25 15:45:00+00'),
  ('550e8400-e29b-41d4-a716-446655440204', 'Samuel Nascimento', '2014-12-03', 'M', '550e8400-e29b-41d4-a716-446655440002', 'Ricardo Nascimento', '(11) 98888-3333', NULL, '2024-02-01 09:20:00+00'),
  ('550e8400-e29b-41d4-a716-446655440205', 'Beatriz Moreira', '2015-05-17', 'F', '550e8400-e29b-41d4-a716-446655440002', 'Sônia Moreira', '(11) 98888-4444', 'Gosta de teatro', '2024-02-08 12:10:00+00'),
  ('550e8400-e29b-41d4-a716-446655440206', 'João Victor Reis', '2014-09-11', 'M', '550e8400-e29b-41d4-a716-446655440002', 'Vanessa Reis', '(11) 98888-5555', 'Muito questionador', '2024-02-12 14:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440207', 'Amanda Pereira', '2015-08-26', 'F', '550e8400-e29b-41d4-a716-446655440002', 'Carlos Pereira', '(11) 98888-6666', 'Organizada e responsável', '2024-02-18 16:30:00+00'),
  ('550e8400-e29b-41d4-a716-446655440208', 'Rafael Araújo', '2015-03-09', 'M', '550e8400-e29b-41d4-a716-446655440002', 'Luciana Araújo', '(11) 98888-7777', NULL, '2024-03-02 10:45:00+00');

-- 3. INSERIR AULAS
INSERT INTO lessons (id, title, date, teacher, notes, created_at) VALUES
  ('550e8400-e29b-41d4-a716-446655440301', 'A Criação do Mundo', '2024-09-01', 'Tia Sarah', 'Usamos fantoches e música', '2024-09-01 08:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440302', 'Noé e a Arca', '2024-09-08', 'Tio Carlos', 'Teatro com as crianças', '2024-09-08 08:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440303', 'Abraão - O Amigo de Deus', '2024-09-15', 'Tia Sarah', 'Dinâmica sobre obediência', '2024-09-15 08:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440304', 'José do Egito', '2024-09-22', 'Tia Marta', 'História com desenhos', '2024-09-22 08:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440305', 'Moisés no Egito', '2024-09-29', 'Tio Carlos', 'Encenação das pragas', '2024-09-29 08:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440306', 'Davi e Golias', '2024-10-06', 'Tia Sarah', 'Lição sobre coragem', '2024-10-06 08:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440307', 'Daniel na Cova dos Leões', '2024-10-13', 'Tia Marta', 'Sobre fidelidade a Deus', '2024-10-13 08:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440308', 'O Nascimento de Jesus', '2024-10-20', 'Tio Carlos', 'Preparação para o Natal', '2024-10-20 08:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440309', 'Jesus e as Crianças', '2024-10-27', 'Tia Sarah', 'Sobre o amor de Jesus', '2024-10-27 08:00:00+00');

-- 4. INSERIR PRESENÇAS
-- Aula 1 - A Criação do Mundo (2024-09-01)
INSERT INTO attendance (id, lesson_id, student_id, present, created_at) VALUES
  -- Grupo Peniel
  ('550e8400-e29b-41d4-a716-446655440401', '550e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440101', true, '2024-09-01 09:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440402', '550e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440102', true, '2024-09-01 09:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440403', '550e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440103', false, '2024-09-01 09:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440404', '550e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440104', true, '2024-09-01 09:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440405', '550e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440105', true, '2024-09-01 09:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440406', '550e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440106', true, '2024-09-01 09:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440407', '550e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440107', true, '2024-09-01 09:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440408', '550e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440108', false, '2024-09-01 09:00:00+00'),
  -- Grupo Lírios
  ('550e8400-e29b-41d4-a716-446655440409', '550e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440201', true, '2024-09-01 09:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440410', '550e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440202', true, '2024-09-01 09:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440411', '550e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440203', true, '2024-09-01 09:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440412', '550e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440204', true, '2024-09-01 09:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440413', '550e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440205', false, '2024-09-01 09:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440414', '550e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440206', true, '2024-09-01 09:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440415', '550e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440207', true, '2024-09-01 09:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440416', '550e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440208', true, '2024-09-01 09:00:00+00');

-- Aula 2 - Noé e a Arca (2024-09-08)
INSERT INTO attendance (id, lesson_id, student_id, present, created_at) VALUES
  -- Grupo Peniel
  ('550e8400-e29b-41d4-a716-446655440501', '550e8400-e29b-41d4-a716-446655440302', '550e8400-e29b-41d4-a716-446655440101', true, '2024-09-08 09:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440502', '550e8400-e29b-41d4-a716-446655440302', '550e8400-e29b-41d4-a716-446655440102', false, '2024-09-08 09:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440503', '550e8400-e29b-41d4-a716-446655440302', '550e8400-e29b-41d4-a716-446655440103', true, '2024-09-08 09:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440504', '550e8400-e29b-41d4-a716-446655440302', '550e8400-e29b-41d4-a716-446655440104', true, '2024-09-08 09:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440505', '550e8400-e29b-41d4-a716-446655440302', '550e8400-e29b-41d4-a716-446655440105', true, '2024-09-08 09:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440506', '550e8400-e29b-41d4-a716-446655440302', '550e8400-e29b-41d4-a716-446655440106', true, '2024-09-08 09:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440507', '550e8400-e29b-41d4-a716-446655440302', '550e8400-e29b-41d4-a716-446655440107', true, '2024-09-08 09:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440508', '550e8400-e29b-41d4-a716-446655440302', '550e8400-e29b-41d4-a716-446655440108', true, '2024-09-08 09:00:00+00'),
  -- Grupo Lírios
  ('550e8400-e29b-41d4-a716-446655440509', '550e8400-e29b-41d4-a716-446655440302', '550e8400-e29b-41d4-a716-446655440201', true, '2024-09-08 09:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440510', '550e8400-e29b-41d4-a716-446655440302', '550e8400-e29b-41d4-a716-446655440202', true, '2024-09-08 09:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440511', '550e8400-e29b-41d4-a716-446655440302', '550e8400-e29b-41d4-a716-446655440203', true, '2024-09-08 09:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440512', '550e8400-e29b-41d4-a716-446655440302', '550e8400-e29b-41d4-a716-446655440204', false, '2024-09-08 09:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440513', '550e8400-e29b-41d4-a716-446655440302', '550e8400-e29b-41d4-a716-446655440205', true, '2024-09-08 09:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440514', '550e8400-e29b-41d4-a716-446655440302', '550e8400-e29b-41d4-a716-446655440206', true, '2024-09-08 09:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440515', '550e8400-e29b-41d4-a716-446655440302', '550e8400-e29b-41d4-a716-446655440207', true, '2024-09-08 09:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440516', '550e8400-e29b-41d4-a716-446655440302', '550e8400-e29b-41d4-a716-446655440208', true, '2024-09-08 09:00:00+00');

-- Aula 3 - Abraão (2024-09-15)
INSERT INTO attendance (id, lesson_id, student_id, present, created_at) VALUES
  -- Grupo Peniel
  ('550e8400-e29b-41d4-a716-446655440601', '550e8400-e29b-41d4-a716-446655440303', '550e8400-e29b-41d4-a716-446655440101', true, '2024-09-15 09:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440602', '550e8400-e29b-41d4-a716-446655440303', '550e8400-e29b-41d4-a716-446655440102', true, '2024-09-15 09:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440603', '550e8400-e29b-41d4-a716-446655440303', '550e8400-e29b-41d4-a716-446655440103', true, '2024-09-15 09:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440604', '550e8400-e29b-41d4-a716-446655440303', '550e8400-e29b-41d4-a716-446655440104', true, '2024-09-15 09:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440605', '550e8400-e29b-41d4-a716-446655440303', '550e8400-e29b-41d4-a716-446655440105', false, '2024-09-15 09:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440606', '550e8400-e29b-41d4-a716-446655440303', '550e8400-e29b-41d4-a716-446655440106', true, '2024-09-15 09:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440607', '550e8400-e29b-41d4-a716-446655440303', '550e8400-e29b-41d4-a716-446655440107', true, '2024-09-15 09:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440608', '550e8400-e29b-41d4-a716-446655440303', '550e8400-e29b-41d4-a716-446655440108', true, '2024-09-15 09:00:00+00'),
  -- Grupo Lírios
  ('550e8400-e29b-41d4-a716-446655440609', '550e8400-e29b-41d4-a716-446655440303', '550e8400-e29b-41d4-a716-446655440201', true, '2024-09-15 09:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440610', '550e8400-e29b-41d4-a716-446655440303', '550e8400-e29b-41d4-a716-446655440202', true, '2024-09-15 09:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440611', '550e8400-e29b-41d4-a716-446655440303', '550e8400-e29b-41d4-a716-446655440203', true, '2024-09-15 09:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440612', '550e8400-e29b-41d4-a716-446655440303', '550e8400-e29b-41d4-a716-446655440204', true, '2024-09-15 09:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440613', '550e8400-e29b-41d4-a716-446655440303', '550e8400-e29b-41d4-a716-446655440205', true, '2024-09-15 09:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440614', '550e8400-e29b-41d4-a716-446655440303', '550e8400-e29b-41d4-a716-446655440206', true, '2024-09-15 09:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440615', '550e8400-e29b-41d4-a716-446655440303', '550e8400-e29b-41d4-a716-446655440207', false, '2024-09-15 09:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440616', '550e8400-e29b-41d4-a716-446655440303', '550e8400-e29b-41d4-a716-446655440208', true, '2024-09-15 09:00:00+00');

-- Aula mais recente - Jesus e as Crianças (2024-10-27)
INSERT INTO attendance (id, lesson_id, student_id, present, created_at) VALUES
  -- Grupo Peniel
  ('550e8400-e29b-41d4-a716-446655440901', '550e8400-e29b-41d4-a716-446655440309', '550e8400-e29b-41d4-a716-446655440101', true, '2024-10-27 09:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440902', '550e8400-e29b-41d4-a716-446655440309', '550e8400-e29b-41d4-a716-446655440102', true, '2024-10-27 09:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440903', '550e8400-e29b-41d4-a716-446655440309', '550e8400-e29b-41d4-a716-446655440103', false, '2024-10-27 09:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440904', '550e8400-e29b-41d4-a716-446655440309', '550e8400-e29b-41d4-a716-446655440104', true, '2024-10-27 09:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440905', '550e8400-e29b-41d4-a716-446655440309', '550e8400-e29b-41d4-a716-446655440105', true, '2024-10-27 09:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440906', '550e8400-e29b-41d4-a716-446655440309', '550e8400-e29b-41d4-a716-446655440106', true, '2024-10-27 09:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440907', '550e8400-e29b-41d4-a716-446655440309', '550e8400-e29b-41d4-a716-446655440107', true, '2024-10-27 09:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440908', '550e8400-e29b-41d4-a716-446655440309', '550e8400-e29b-41d4-a716-446655440108', false, '2024-10-27 09:00:00+00'),
  -- Grupo Lírios
  ('550e8400-e29b-41d4-a716-446655440909', '550e8400-e29b-41d4-a716-446655440309', '550e8400-e29b-41d4-a716-446655440201', true, '2024-10-27 09:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440910', '550e8400-e29b-41d4-a716-446655440309', '550e8400-e29b-41d4-a716-446655440202', true, '2024-10-27 09:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440911', '550e8400-e29b-41d4-a716-446655440309', '550e8400-e29b-41d4-a716-446655440203', true, '2024-10-27 09:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440912', '550e8400-e29b-41d4-a716-446655440309', '550e8400-e29b-41d4-a716-446655440204', false, '2024-10-27 09:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440913', '550e8400-e29b-41d4-a716-446655440309', '550e8400-e29b-41d4-a716-446655440205', true, '2024-10-27 09:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440914', '550e8400-e29b-41d4-a716-446655440309', '550e8400-e29b-41d4-a716-446655440206', true, '2024-10-27 09:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440915', '550e8400-e29b-41d4-a716-446655440309', '550e8400-e29b-41d4-a716-446655440207', true, '2024-10-27 09:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440916', '550e8400-e29b-41d4-a716-446655440309', '550e8400-e29b-41d4-a716-446655440208', true, '2024-10-27 09:00:00+00');

-- 5. INSERIR ALUNOS INATIVOS (para testar status "Inativo" - sem presença há mais de 60 dias)
INSERT INTO students (id, full_name, birth_date, sex, group_id, guardian_name, guardian_contact, notes, created_at) VALUES
  -- Alunos que foram cadastrados há mais de 60 dias mas nunca tiveram presença
  ('550e8400-e29b-41d4-a716-446655440301', 'Carlos Inactive', '2017-05-10', 'M', '550e8400-e29b-41d4-a716-446655440001', 'Pai Carlos', '(11) 97777-1111', 'Aluno inativo há meses', '2024-06-01 10:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440302', 'Marina Ausente', '2015-12-20', 'F', '550e8400-e29b-41d4-a716-446655440002', 'Mãe Marina', '(11) 97777-2222', 'Não vem há muito tempo', '2024-05-15 10:00:00+00');

-- 6. INSERIR PRESENÇA ANTIGA PARA SIMULAR ALUNOS INATIVOS
-- (Alunos com última presença há mais de 60 dias)
INSERT INTO lessons (id, title, date, teacher, notes, created_at) VALUES
  ('550e8400-e29b-41d4-a716-446655440310', 'Aula Antiga - Davi', '2024-07-01', 'Tia Antiga', 'Aula de mais de 60 dias atrás', '2024-07-01 08:00:00+00');

INSERT INTO attendance (id, lesson_id, student_id, present, created_at) VALUES
  -- Aluno que teve presença há mais de 60 dias (será "Inativo")
  ('550e8400-e29b-41d4-a716-446655441001', '550e8400-e29b-41d4-a716-446655440310', '550e8400-e29b-41d4-a716-446655440105', true, '2024-07-01 09:00:00+00');

/*
  # Resumo dos Dados Inseridos - Sistema de Status Completo
  
  ## Grupos (2 registros)
  - Peniel: para crianças menores (6-7 anos)
  - Lírios: para crianças maiores (9-11 anos)
  
  ## Alunos (18 registros)
  - 8 no grupo Peniel (nascidos em 2017-2018) - status variados
  - 8 no grupo Lírios (nascidos em 2014-2015) - status variados
  - 2 alunos extras para testar status "Inativo"
  - Dados realistas: nomes, contatos dos responsáveis, observações
  
  ## Aulas (10 registros)
  - 9 lições bíblicas recentes (setembro/outubro 2024)
  - 1 aula antiga (julho 2024) para testar status "Inativo"
  - Diferentes professores e metodologias
  - Observações sobre as atividades realizadas
  
  ## Presenças (65 registros)
  - Registros de presença/falta para múltiplas aulas
  - Padrões variados de presença para simular cenário real
  - Alunos com diferentes status:
    * ATIVO: comparecem regularmente às aulas
    * FALTOSO: faltaram à última aula (Sofia Oliveira, Matheus Alves, Samuel Nascimento)
    * INATIVO: sem presença há ≥60 dias (Carlos Inactive, Marina Ausente, Isabela Lima)
  
  ## Como testar o sistema de status:
  
  ### Ver status de todos os alunos:
  ```sql
  SELECT * FROM v_student_status ORDER BY status, group_name, full_name;
  ```
  
  ### Marcar presença usando as novas funções:
  ```sql
  -- Marcar presente
  SELECT marcar_presenca(
    '550e8400-e29b-41d4-a716-446655440309'::UUID, -- última aula
    '550e8400-e29b-41d4-a716-446655440103'::UUID  -- Sofia (estava faltosa)
  );
  
  -- Marcar ausente
  SELECT marcar_ausencia(
    '550e8400-e29b-41d4-a716-446655440309'::UUID, -- última aula
    '550e8400-e29b-41d4-a716-446655440101'::UUID  -- Ana Clara (estava ativa)
  );
  ```
  
  ### Ver chamada de uma aula:
  ```sql
  SELECT * FROM get_chamada_aula('550e8400-e29b-41d4-a716-446655440309'::UUID);
  ```
  
  ### Ver estatísticas de um aluno:
  ```sql
  SELECT get_estatisticas_aluno('550e8400-e29b-41d4-a716-446655440101'::UUID, 90);
  ```
  
  Para executar este arquivo no Supabase:
  1. Copie todo o conteúdo
  2. Cole no SQL Editor do Supabase
  3. Execute o script
  
  Nota: Se houver conflitos de UUID, o script falhará. 
  Neste caso, execute: DELETE FROM attendance; DELETE FROM lessons; DELETE FROM students; DELETE FROM groups;
  E execute o script novamente.
*/