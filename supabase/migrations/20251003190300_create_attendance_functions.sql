/*
  # Funções para Gestão de Presença
  
  1. Descrição
    - Cria funções para marcar presença e ausência dos alunos
    - Automatiza o processo de registro de attendance
    - Integra com o sistema de status (Ativo/Faltoso/Inativo)
    
  2. Funções Criadas
    - marcar_presenca(lesson_id, student_id) - Marca aluno como presente
    - marcar_ausencia(lesson_id, student_id) - Marca aluno como ausente
    - marcar_presenca_lote(lesson_id, student_ids[]) - Marca vários alunos como presentes
    - get_chamada_aula(lesson_id) - Retorna lista de alunos com status de presença
    
  3. Lógica de Funcionamento
    - Usa UPSERT (INSERT ... ON CONFLICT DO UPDATE)
    - Mantém histórico de presenças
    - Atualiza automaticamente o created_at quando mudado
    - Integra com a view v_student_status
*/

-- Função para marcar um aluno como PRESENTE
CREATE OR REPLACE FUNCTION marcar_presenca(
  p_lesson_id UUID,
  p_student_id UUID
) RETURNS JSON AS $$
DECLARE
  resultado JSON;
BEGIN
  -- Inserir ou atualizar presença
  INSERT INTO attendance (lesson_id, student_id, present, created_at)
  VALUES (p_lesson_id, p_student_id, true, now())
  ON CONFLICT (lesson_id, student_id)
  DO UPDATE SET 
    present = true,
    created_at = now();
    
  -- Retornar resultado
  SELECT json_build_object(
    'success', true,
    'message', 'Presença registrada com sucesso',
    'lesson_id', p_lesson_id,
    'student_id', p_student_id,
    'present', true,
    'timestamp', now()
  ) INTO resultado;
  
  RETURN resultado;
EXCEPTION
  WHEN OTHERS THEN
    SELECT json_build_object(
      'success', false,
      'message', 'Erro ao registrar presença: ' || SQLERRM,
      'lesson_id', p_lesson_id,
      'student_id', p_student_id
    ) INTO resultado;
    
    RETURN resultado;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para marcar um aluno como AUSENTE
CREATE OR REPLACE FUNCTION marcar_ausencia(
  p_lesson_id UUID,
  p_student_id UUID
) RETURNS JSON AS $$
DECLARE
  resultado JSON;
BEGIN
  -- Inserir ou atualizar ausência
  INSERT INTO attendance (lesson_id, student_id, present, created_at)
  VALUES (p_lesson_id, p_student_id, false, now())
  ON CONFLICT (lesson_id, student_id)
  DO UPDATE SET 
    present = false,
    created_at = now();
    
  -- Retornar resultado
  SELECT json_build_object(
    'success', true,
    'message', 'Ausência registrada com sucesso',
    'lesson_id', p_lesson_id,
    'student_id', p_student_id,
    'present', false,
    'timestamp', now()
  ) INTO resultado;
  
  RETURN resultado;
EXCEPTION
  WHEN OTHERS THEN
    SELECT json_build_object(
      'success', false,
      'message', 'Erro ao registrar ausência: ' || SQLERRM,
      'lesson_id', p_lesson_id,
      'student_id', p_student_id
    ) INTO resultado;
    
    RETURN resultado;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para marcar vários alunos como PRESENTES em lote
CREATE OR REPLACE FUNCTION marcar_presenca_lote(
  p_lesson_id UUID,
  p_student_ids UUID[]
) RETURNS JSON AS $$
DECLARE
  student_id UUID;
  success_count INT := 0;
  error_count INT := 0;
  resultado JSON;
BEGIN
  -- Processar cada student_id
  FOREACH student_id IN ARRAY p_student_ids
  LOOP
    BEGIN
      INSERT INTO attendance (lesson_id, student_id, present, created_at)
      VALUES (p_lesson_id, student_id, true, now())
      ON CONFLICT (lesson_id, student_id)
      DO UPDATE SET 
        present = true,
        created_at = now();
        
      success_count := success_count + 1;
    EXCEPTION
      WHEN OTHERS THEN
        error_count := error_count + 1;
    END;
  END LOOP;
  
  -- Retornar resultado
  SELECT json_build_object(
    'success', error_count = 0,
    'message', format('Processados %s alunos. %s sucessos, %s erros', 
                     array_length(p_student_ids, 1), success_count, error_count),
    'lesson_id', p_lesson_id,
    'total_students', array_length(p_student_ids, 1),
    'success_count', success_count,
    'error_count', error_count,
    'timestamp', now()
  ) INTO resultado;
  
  RETURN resultado;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter lista de chamada de uma aula
CREATE OR REPLACE FUNCTION get_chamada_aula(
  p_lesson_id UUID
) RETURNS TABLE (
  student_id UUID,
  full_name TEXT,
  group_name TEXT,
  birth_date DATE,
  present BOOLEAN,
  status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id as student_id,
    s.full_name,
    g.name as group_name,
    s.birth_date,
    COALESCE(a.present, NULL) as present,
    vs.status
  FROM students s
  LEFT JOIN groups g ON g.id = s.group_id
  LEFT JOIN attendance a ON a.student_id = s.id AND a.lesson_id = p_lesson_id
  LEFT JOIN v_student_status vs ON vs.student_id = s.id
  ORDER BY g.name, s.full_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter estatísticas de presença de um aluno
CREATE OR REPLACE FUNCTION get_estatisticas_aluno(
  p_student_id UUID,
  p_periodo_dias INT DEFAULT 90
) RETURNS JSON AS $$
DECLARE
  resultado JSON;
  total_aulas INT;
  presencas INT;
  ausencias INT;
  percentual_presenca NUMERIC;
BEGIN
  -- Contar aulas no período
  SELECT COUNT(DISTINCT l.id)
  INTO total_aulas
  FROM lessons l
  WHERE l.date >= (CURRENT_DATE - p_periodo_dias);
  
  -- Contar presenças do aluno
  SELECT 
    COUNT(CASE WHEN a.present THEN 1 END),
    COUNT(CASE WHEN NOT a.present THEN 1 END)
  INTO presencas, ausencias
  FROM attendance a
  JOIN lessons l ON l.id = a.lesson_id
  WHERE a.student_id = p_student_id 
    AND l.date >= (CURRENT_DATE - p_periodo_dias);
  
  -- Calcular percentual
  IF (presencas + ausencias) > 0 THEN
    percentual_presenca := ROUND((presencas::NUMERIC / (presencas + ausencias)) * 100, 2);
  ELSE
    percentual_presenca := NULL;
  END IF;
  
  -- Montar resultado
  SELECT json_build_object(
    'student_id', p_student_id,
    'periodo_dias', p_periodo_dias,
    'total_aulas_periodo', total_aulas,
    'aulas_registradas', (presencas + ausencias),
    'presencas', presencas,
    'ausencias', ausencias,
    'percentual_presenca', percentual_presenca,
    'status_atual', (
      SELECT vs.status 
      FROM v_student_status vs 
      WHERE vs.student_id = p_student_id
    )
  ) INTO resultado;
  
  RETURN resultado;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para limpar registros de presença (utilitário para testes)
CREATE OR REPLACE FUNCTION limpar_presencas_aula(
  p_lesson_id UUID
) RETURNS JSON AS $$
DECLARE
  registros_removidos INT;
  resultado JSON;
BEGIN
  DELETE FROM attendance WHERE lesson_id = p_lesson_id;
  GET DIAGNOSTICS registros_removidos = ROW_COUNT;
  
  SELECT json_build_object(
    'success', true,
    'message', format('%s registros de presença removidos', registros_removidos),
    'lesson_id', p_lesson_id,
    'registros_removidos', registros_removidos
  ) INTO resultado;
  
  RETURN resultado;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para salvar chamada completa com validação automática
CREATE OR REPLACE FUNCTION salvar_chamada_completa(
  p_lesson_id UUID,
  p_presencas_marcadas JSONB DEFAULT '{}'::JSONB
) RETURNS JSON AS $$
DECLARE
  aluno RECORD;
  alunos_nao_marcados TEXT[] := '{}';
  alunos_ausentes TEXT[] := '{}';
  total_alunos INT := 0;
  total_presentes INT := 0;
  total_ausentes INT := 0;
  total_nao_marcados INT := 0;
  resultado JSON;
  student_present BOOLEAN;
BEGIN
  -- Percorrer todos os alunos do sistema
  FOR aluno IN 
    SELECT s.id, s.full_name, g.name as group_name
    FROM students s
    LEFT JOIN groups g ON g.id = s.group_id
    ORDER BY g.name, s.full_name
  LOOP
    total_alunos := total_alunos + 1;
    
    -- Verificar se o aluno foi marcado nos dados enviados
    IF p_presencas_marcadas ? aluno.id::TEXT THEN
      -- Aluno foi marcado, pegar o valor (true/false)
      student_present := (p_presencas_marcadas ->> aluno.id::TEXT)::BOOLEAN;
      
      -- Inserir/atualizar presença
      INSERT INTO attendance (lesson_id, student_id, present, created_at)
      VALUES (p_lesson_id, aluno.id, student_present, now())
      ON CONFLICT (lesson_id, student_id)
      DO UPDATE SET 
        present = student_present,
        created_at = now();
      
      IF student_present THEN
        total_presentes := total_presentes + 1;
      ELSE
        total_ausentes := total_ausentes + 1;
        alunos_ausentes := array_append(alunos_ausentes, format('%s (%s)', aluno.full_name, aluno.group_name));
      END IF;
    ELSE
      -- Aluno NÃO foi marcado - marcar como ausente automaticamente
      total_nao_marcados := total_nao_marcados + 1;
      total_ausentes := total_ausentes + 1;
      
      alunos_nao_marcados := array_append(alunos_nao_marcados, format('%s (%s)', aluno.full_name, aluno.group_name));
      alunos_ausentes := array_append(alunos_ausentes, format('%s (%s)', aluno.full_name, aluno.group_name));
      
      -- Inserir/atualizar como ausente
      INSERT INTO attendance (lesson_id, student_id, present, created_at)
      VALUES (p_lesson_id, aluno.id, false, now())
      ON CONFLICT (lesson_id, student_id)
      DO UPDATE SET 
        present = false,
        created_at = now();
    END IF;
  END LOOP;
  
  -- Montar resultado com informações para o popup de confirmação
  SELECT json_build_object(
    'success', true,
    'message', 'Chamada salva com sucesso',
    'lesson_id', p_lesson_id,
    'resumo', json_build_object(
      'total_alunos', total_alunos,
      'total_presentes', total_presentes,
      'total_ausentes', total_ausentes,
      'total_nao_marcados', total_nao_marcados
    ),
    'alunos_nao_marcados', alunos_nao_marcados,
    'todos_alunos_ausentes', alunos_ausentes,
    'precisa_confirmacao', total_nao_marcados > 0,
    'mensagem_confirmacao', CASE 
      WHEN total_nao_marcados > 0 THEN
        format('⚠️ %s aluno(s) não foram marcados e serão registrados como AUSENTES. Confirma?', total_nao_marcados)
      ELSE
        'Chamada completa! Todos os alunos foram marcados.'
    END,
    'timestamp', now()
  ) INTO resultado;
  
  RETURN resultado;
EXCEPTION
  WHEN OTHERS THEN
    SELECT json_build_object(
      'success', false,
      'message', 'Erro ao salvar chamada: ' || SQLERRM,
      'lesson_id', p_lesson_id
    ) INTO resultado;
    
    RETURN resultado;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar alunos não marcados (antes de salvar)
CREATE OR REPLACE FUNCTION verificar_alunos_nao_marcados(
  p_lesson_id UUID,
  p_presencas_marcadas JSONB DEFAULT '{}'::JSONB
) RETURNS JSON AS $$
DECLARE
  aluno RECORD;
  alunos_nao_marcados TEXT[] := '{}';
  total_alunos INT := 0;
  total_marcados INT := 0;
  resultado JSON;
BEGIN
  -- Percorrer todos os alunos
  FOR aluno IN 
    SELECT s.id, s.full_name, g.name as group_name
    FROM students s
    LEFT JOIN groups g ON g.id = s.group_id
    ORDER BY g.name, s.full_name
  LOOP
    total_alunos := total_alunos + 1;
    
    -- Verificar se foi marcado
    IF p_presencas_marcadas ? aluno.id::TEXT THEN
      total_marcados := total_marcados + 1;
    ELSE
      alunos_nao_marcados := array_append(alunos_nao_marcados, format('%s (%s)', aluno.full_name, aluno.group_name));
    END IF;
  END LOOP;
  
  -- Montar resultado
  SELECT json_build_object(
    'total_alunos', total_alunos,
    'total_marcados', total_marcados,
    'total_nao_marcados', (total_alunos - total_marcados),
    'alunos_nao_marcados', alunos_nao_marcados,
    'precisa_confirmacao', (total_alunos - total_marcados) > 0,
    'mensagem_confirmacao', CASE 
      WHEN (total_alunos - total_marcados) > 0 THEN
        format('⚠️ %s aluno(s) não foram marcados e serão registrados como AUSENTES:', (total_alunos - total_marcados))
      ELSE
        '✅ Todos os alunos foram marcados!'
    END
  ) INTO resultado;
  
  RETURN resultado;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

/*
  # Como usar as funções:
  
  ## Marcar presença individual:
  SELECT marcar_presenca(
    '550e8400-e29b-41d4-a716-446655440301'::UUID, -- lesson_id
    '550e8400-e29b-41d4-a716-446655440101'::UUID  -- student_id
  );
  
  ## Marcar ausência individual:
  SELECT marcar_ausencia(
    '550e8400-e29b-41d4-a716-446655440301'::UUID, -- lesson_id
    '550e8400-e29b-41d4-a716-446655440101'::UUID  -- student_id
  );
  
  ## Marcar vários presentes:
  SELECT marcar_presenca_lote(
    '550e8400-e29b-41d4-a716-446655440301'::UUID, -- lesson_id
    ARRAY[
      '550e8400-e29b-41d4-a716-446655440101'::UUID,
      '550e8400-e29b-41d4-a716-446655440102'::UUID
    ]::UUID[] -- array de student_ids
  );
  
  ## Ver chamada de uma aula:
  SELECT * FROM get_chamada_aula('550e8400-e29b-41d4-a716-446655440301'::UUID);
  
  ## Ver estatísticas de um aluno:
  SELECT get_estatisticas_aluno('550e8400-e29b-41d4-a716-446655440101'::UUID, 30);
  
  ## Ver todos os status dos alunos:
  SELECT * FROM v_student_status ORDER BY group_name, full_name;
  
  ## Salvar chamada completa com validação automática:
  SELECT salvar_chamada_completa(
    '550e8400-e29b-41d4-a716-446655440301'::UUID, -- lesson_id
    '{
      "550e8400-e29b-41d4-a716-446655440101": true,
      "550e8400-e29b-41d4-a716-446655440102": false,
      "550e8400-e29b-41d4-a716-446655440103": true
    }'::JSONB -- apenas os alunos marcados
  );
  
  ## Verificar alunos não marcados (antes de salvar):
  SELECT verificar_alunos_nao_marcados(
    '550e8400-e29b-41d4-a716-446655440301'::UUID, -- lesson_id  
    '{
      "550e8400-e29b-41d4-a716-446655440101": true,
      "550e8400-e29b-41d4-a716-446655440102": false
    }'::JSONB -- apenas os marcados
  );
*/