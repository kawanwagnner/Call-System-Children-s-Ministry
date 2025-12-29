/*
  # Dados de Teste para Sistema de Recepção
  
  Inserir dados de exemplo para testar o sistema:
  - Membros e visitantes
  - Eventos/cultos
  - Registros de presença
*/

-- Inserir membros de exemplo
INSERT INTO reception_members (full_name, birth_date, sex, member_type, group_id, contact_phone, contact_email, address) VALUES 
  ('João Silva Santos', '1985-03-15', 'M', 'Membro', 
   (SELECT id FROM reception_groups WHERE name = 'Célula Central' LIMIT 1), 
   '(11) 99999-1111', 'joao.silva@email.com', 'Rua das Flores, 123'),
   
  ('Maria Oliveira Costa', '1990-07-22', 'F', 'Membro', 
   (SELECT id FROM reception_groups WHERE name = 'Célula Norte' LIMIT 1), 
   '(11) 99999-2222', 'maria.oliveira@email.com', 'Av. Principal, 456'),
   
  ('Pedro Rodrigues Lima', '1978-11-08', 'M', 'Membro', 
   (SELECT id FROM reception_groups WHERE name = 'Ministério de Louvor' LIMIT 1), 
   '(11) 99999-3333', 'pedro.lima@email.com', 'Rua da Igreja, 789'),
   
  ('Ana Paula Ferreira', '1995-01-30', 'F', 'Membro', 
   (SELECT id FROM reception_groups WHERE name = 'Célula Sul' LIMIT 1), 
   '(11) 99999-4444', 'ana.ferreira@email.com', 'Rua da Paz, 321'),
   
  ('Carlos Eduardo Souza', '1982-09-12', 'M', 'Visitante', 
   NULL, '(11) 99999-5555', 'carlos.souza@email.com', 'Av. Liberdade, 654'),
   
  ('Juliana Santos Rocha', '1988-05-25', 'F', 'Visitante', 
   NULL, '(11) 99999-6666', 'juliana.rocha@email.com', 'Rua Nova, 987'),
   
  ('Roberto Alves Pereira', '1975-12-03', 'M', 'Membro', 
   (SELECT id FROM reception_groups WHERE name = 'Diretoria' LIMIT 1), 
   '(11) 99999-7777', 'roberto.alves@email.com', 'Rua Central, 147'),
   
  ('Fernanda Lima Silva', '1992-08-18', 'F', 'Membro', 
   (SELECT id FROM reception_groups WHERE name = 'Célula Central' LIMIT 1), 
   '(11) 99999-8888', 'fernanda.silva@email.com', 'Av. Brasil, 258'),
   
  ('Marcos Antonio Cruz', '1980-04-07', 'M', 'Visitante', 
   NULL, '(11) 99999-9999', 'marcos.cruz@email.com', 'Rua dos Santos, 369'),
   
  ('Priscila Dias Costa', '1987-10-14', 'F', 'Membro', 
   (SELECT id FROM reception_groups WHERE name = 'Célula Norte' LIMIT 1), 
   '(11) 99999-0000', 'priscila.dias@email.com', 'Rua da Esperança, 741');

-- Inserir eventos/cultos de exemplo
INSERT INTO reception_events (title, date, start_time, event_type, leader, notes) VALUES 
  ('Culto de Domingo - Manhã', '2025-10-05', '09:00:00', 'Culto', 'Pastor João', 'Culto principal de domingo'),
  ('Culto de Domingo - Noite', '2025-10-05', '19:00:00', 'Culto', 'Pastor João', 'Culto de domingo à noite'),
  ('Reunião de Oração', '2025-10-02', '19:30:00', 'Reunião', 'Presbítero Carlos', 'Reunião semanal de oração'),
  ('Culto de Quarta', '2025-10-01', '19:30:00', 'Culto', 'Pastor João', 'Culto de meio de semana'),
  ('Encontro de Jovens', '2025-09-28', '19:00:00', 'Evento Especial', 'Preletor Ana', 'Evento especial para jovens'),
  ('Culto de Domingo - Manhã', '2025-09-29', '09:00:00', 'Culto', 'Pastor João', 'Culto principal de domingo'),
  ('Santa Ceia', '2025-10-06', '19:00:00', 'Evento Especial', 'Pastor João', 'Celebração da Santa Ceia');

-- Inserir registros de presença para o evento mais recente (05/10/2025 - manhã)
WITH recent_event AS (
  SELECT id FROM reception_events 
  WHERE date = '2025-10-05' AND start_time = '09:00:00' 
  LIMIT 1
)
INSERT INTO reception_attendance (event_id, member_id, present, check_in_time) 
SELECT 
  re.id,
  rm.id,
  CASE 
    WHEN rm.full_name IN ('João Silva Santos', 'Maria Oliveira Costa', 'Pedro Rodrigues Lima', 'Ana Paula Ferreira', 'Fernanda Lima Silva', 'Priscila Dias Costa') THEN true
    ELSE false
  END,
  CASE 
    WHEN rm.full_name IN ('João Silva Santos', 'Maria Oliveira Costa', 'Pedro Rodrigues Lima', 'Ana Paula Ferreira', 'Fernanda Lima Silva', 'Priscila Dias Costa') 
    THEN '2025-10-05 08:30:00'::timestamptz + (random() * interval '30 minutes')
    ELSE NULL
  END
FROM recent_event re
CROSS JOIN reception_members rm
WHERE rm.member_type = 'Membro';

-- Inserir alguns visitantes também no evento de hoje
WITH recent_event AS (
  SELECT id FROM reception_events 
  WHERE date = '2025-10-05' AND start_time = '09:00:00' 
  LIMIT 1
)
INSERT INTO reception_attendance (event_id, member_id, present, check_in_time) 
SELECT 
  re.id,
  rm.id,
  CASE 
    WHEN rm.full_name = 'Carlos Eduardo Souza' THEN true
    ELSE false
  END,
  CASE 
    WHEN rm.full_name = 'Carlos Eduardo Souza' 
    THEN '2025-10-05 08:45:00'::timestamptz
    ELSE NULL
  END
FROM recent_event re
CROSS JOIN reception_members rm
WHERE rm.member_type = 'Visitante';