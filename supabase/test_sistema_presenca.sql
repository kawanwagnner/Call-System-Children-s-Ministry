/*
  # Script de Teste - Sistema de Status e Funções de Presença
  
  Este arquivo contém queries de teste para validar o funcionamento do
  sistema de status (Ativo/Faltoso/Inativo) e das funções de marcação de presença.
  
  Execute após rodar as migrations e o sample_data.sql
*/

-- ================================================
-- 1. TESTAR SISTEMA DE STATUS ATUAL
-- ================================================

-- Ver todos os alunos e seus status atuais
SELECT 
  'STATUS ATUAL DOS ALUNOS' as teste,
  student_id,
  full_name,
  group_name,
  status,
  reference_present_at,
  (CURRENT_DATE - reference_present_at) as dias_sem_presenca
FROM v_student_status 
ORDER BY status, group_name, full_name;

-- Contar alunos por status
SELECT 
  'CONTAGEM POR STATUS' as teste,
  status,
  COUNT(*) as quantidade
FROM v_student_status 
GROUP BY status 
ORDER BY status;

-- ================================================
-- 2. TESTAR FUNÇÕES DE MARCAÇÃO DE PRESENÇA
-- ================================================

-- Teste 1: Marcar um aluno faltoso como presente (deve mudar para Ativo)
SELECT 'TESTE 1: Marcar Sofia (faltosa) como presente' as teste;
SELECT marcar_presenca(
  '550e8400-e29b-41d4-a716-446655440309'::UUID, -- última aula
  '550e8400-e29b-41d4-a716-446655440103'::UUID  -- Sofia Oliveira (estava faltosa)
);

-- Verificar se o status mudou
SELECT 
  'RESULTADO TESTE 1' as teste,
  full_name, 
  status 
FROM v_student_status 
WHERE student_id = '550e8400-e29b-41d4-a716-446655440103'::UUID;

-- Teste 2: Marcar um aluno ativo como ausente (deve mudar para Faltoso)
SELECT 'TESTE 2: Marcar Ana Clara (ativa) como ausente' as teste;
SELECT marcar_ausencia(
  '550e8400-e29b-41d4-a716-446655440309'::UUID, -- última aula
  '550e8400-e29b-41d4-a716-446655440101'::UUID  -- Ana Clara Silva (estava ativa)
);

-- Verificar se o status mudou
SELECT 
  'RESULTADO TESTE 2' as teste,
  full_name, 
  status 
FROM v_student_status 
WHERE student_id = '550e8400-e29b-41d4-a716-446655440101'::UUID;

-- Teste 3: Marcar vários alunos presentes em lote
SELECT 'TESTE 3: Marcar vários alunos presentes em lote' as teste;
SELECT marcar_presenca_lote(
  '550e8400-e29b-41d4-a716-446655440309'::UUID, -- última aula
  ARRAY[
    '550e8400-e29b-41d4-a716-446655440104'::UUID, -- Lucas Costa
    '550e8400-e29b-41d4-a716-446655440106'::UUID, -- Gabriel Rocha
    '550e8400-e29b-41d4-a716-446655440108'::UUID  -- Matheus Alves (era faltoso)
  ]::UUID[]
);

-- Verificar resultados do lote
SELECT 
  'RESULTADO TESTE 3' as teste,
  full_name, 
  status 
FROM v_student_status 
WHERE student_id = ANY(ARRAY[
  '550e8400-e29b-41d4-a716-446655440104'::UUID,
  '550e8400-e29b-41d4-a716-446655440106'::UUID,
  '550e8400-e29b-41d4-a716-446655440108'::UUID
]::UUID[]);

-- ================================================
-- 3. TESTAR FUNÇÃO GET_CHAMADA_AULA
-- ================================================

-- Ver chamada completa da última aula
SELECT 'CHAMADA DA ÚLTIMA AULA (após testes)' as teste;
SELECT 
  student_id,
  full_name,
  group_name,
  present,
  status
FROM get_chamada_aula('550e8400-e29b-41d4-a716-446655440309'::UUID)
ORDER BY group_name, full_name;

-- ================================================
-- 4. TESTAR FUNÇÃO DE ESTATÍSTICAS
-- ================================================

-- Ver estatísticas de alguns alunos
SELECT 'ESTATÍSTICAS DE ALUNOS - Ana Clara' as teste;
SELECT get_estatisticas_aluno('550e8400-e29b-41d4-a716-446655440101'::UUID, 90);

SELECT 'ESTATÍSTICAS DE ALUNOS - Sofia Oliveira' as teste;
SELECT get_estatisticas_aluno('550e8400-e29b-41d4-a716-446655440103'::UUID, 90);

SELECT 'ESTATÍSTICAS DE ALUNOS - Isabela (inativa)' as teste;
SELECT get_estatisticas_aluno('550e8400-e29b-41d4-a716-446655440105'::UUID, 90);

-- ================================================
-- 5. VERIFICAÇÃO FINAL DO SISTEMA DE STATUS
-- ================================================

-- Status final após todas as alterações
SELECT 
  'STATUS FINAL APÓS TESTES' as teste,
  student_id,
  full_name,
  group_name,
  status,
  reference_present_at
FROM v_student_status 
ORDER BY status, group_name, full_name;

-- Contagem final por status
SELECT 
  'CONTAGEM FINAL POR STATUS' as teste,
  status,
  COUNT(*) as quantidade
FROM v_student_status 
GROUP BY status 
ORDER BY status;

-- ================================================
-- 6. TESTE DE CRIAÇÃO DE NOVA AULA E CHAMADA
-- ================================================

-- Criar uma nova aula para hoje
INSERT INTO lessons (id, title, date, teacher, notes, created_at) VALUES
  (gen_random_uuid(), 'Teste - Aula de Hoje', CURRENT_DATE, 'Tia Teste', 'Aula criada para teste do sistema', now());

-- Pegar o ID da nova aula
SELECT 'NOVA AULA CRIADA' as teste, id, title, date FROM lessons WHERE date = CURRENT_DATE;

/*
  # Como executar este teste:
  
  1. Execute primeiro as migrations:
     - 20251003190208_create_ministerio_infantil_schema.sql
     - 20251003190236_create_student_status_view.sql  
     - 20251003190259_setup_row_level_security.sql
     - 20251003190300_create_attendance_functions.sql
  
  2. Execute o sample_data.sql para popular os dados
  
  3. Execute este arquivo de teste
  
  4. Observe os resultados para validar:
     - Se os status mudam corretamente (Ativo ↔ Faltoso ↔ Inativo)
     - Se as funções de marcação funcionam
     - Se as estatísticas estão corretas
     - Se a chamada retorna dados consistentes
  
  # Resultados esperados:
  
  - Alunos ATIVOS: comparecem regularmente
  - Alunos FALTOSOS: faltaram à última aula registrada
  - Alunos INATIVOS: sem presença há 60+ dias ou nunca tiveram presença
  
  As funções devem permitir mudanças de status em tempo real conforme
  as presenças são marcadas.
*/