/*
  # View para Status Dinâmico dos Alunos
  
  1. Descrição
    - Cria uma view que calcula o status de cada aluno dinamicamente
    - Status possíveis:
      - "Ativo": aluno com presença recente
      - "Faltoso": faltou à última aula registrada
      - "Inativo": sem presença há 60 dias ou mais
  
  2. Lógica de Cálculo
    - Inativo: última presença (present=true) foi há ≥60 dias OU nunca teve presença e foi cadastrado há ≥60 dias
    - Faltoso: tem registro de ausência (present=false) na última aula do sistema
    - Ativo: todos os demais casos
  
  3. Campos Retornados
    - student_id: ID do aluno
    - full_name: Nome completo
    - group_name: Nome do grupo (Peniel/Betel)
    - reference_present_at: Data de referência da última presença
    - status: Status calculado (Ativo/Faltoso/Inativo)
*/

CREATE OR REPLACE VIEW v_student_status AS
WITH last_lesson AS (
  SELECT MAX(date) as last_date FROM lessons
),
last_presence AS (
  SELECT 
    a.student_id,
    MAX(CASE WHEN a.present THEN l.date END) as last_present_date,
    MAX(CASE WHEN NOT a.present THEN l.date END) as last_absent_date,
    MAX(l.date) as last_attendance_date
  FROM attendance a
  JOIN lessons l ON l.id = a.lesson_id
  GROUP BY a.student_id
),
last_lesson_attendance AS (
  SELECT DISTINCT
    a.student_id,
    a.present as was_present_last_lesson
  FROM attendance a
  JOIN lessons l ON l.id = a.lesson_id
  JOIN last_lesson ll ON l.date = ll.last_date
)
SELECT 
  s.id as student_id,
  s.full_name,
  g.name as group_name,
  COALESCE(lp.last_present_date, s.created_at::date) as reference_present_at,
  CASE
    WHEN (CURRENT_DATE - COALESCE(lp.last_present_date, s.created_at::date)) >= 60 THEN 'Inativo'
    WHEN lla.was_present_last_lesson = false THEN 'Faltoso'
    ELSE 'Ativo'
  END as status
FROM students s
LEFT JOIN groups g ON g.id = s.group_id
LEFT JOIN last_presence lp ON lp.student_id = s.id
LEFT JOIN last_lesson_attendance lla ON lla.student_id = s.id;