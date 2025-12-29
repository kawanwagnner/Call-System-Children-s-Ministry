-- Corrigir função verificar_alunos_nao_marcados para filtrar por group_id da aula
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
  v_lesson_group_id UUID;
BEGIN
  -- Obter o group_id da aula
  SELECT group_id INTO v_lesson_group_id
  FROM lessons
  WHERE id = p_lesson_id;

  -- Percorrer apenas os alunos do grupo da aula (ou todos se a aula não tiver grupo definido)
  FOR aluno IN 
    SELECT s.id, s.full_name, g.name as group_name
    FROM students s
    LEFT JOIN groups g ON g.id = s.group_id
    WHERE v_lesson_group_id IS NULL OR s.group_id = v_lesson_group_id
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

-- Corrigir função para recepção também
CREATE OR REPLACE FUNCTION verificar_membros_nao_marcados_recepcao(
  p_event_id UUID,
  p_presencas_marcadas JSONB DEFAULT '{}'::JSONB
) RETURNS JSON AS $$
DECLARE
  membro RECORD;
  membros_nao_marcados TEXT[] := '{}';
  total_membros INT := 0;
  total_marcados INT := 0;
  resultado JSON;
  v_event_group_id UUID;
BEGIN
  -- Obter o group_id do evento
  SELECT group_id INTO v_event_group_id
  FROM reception_events
  WHERE id = p_event_id;

  -- Percorrer apenas os membros do grupo do evento (ou todos se o evento não tiver grupo definido)
  FOR membro IN 
    SELECT m.id, m.full_name, g.name as group_name
    FROM reception_members m
    LEFT JOIN reception_groups g ON g.id = m.group_id
    WHERE v_event_group_id IS NULL OR m.group_id = v_event_group_id
    ORDER BY g.name, m.full_name
  LOOP
    total_membros := total_membros + 1;
    
    -- Verificar se foi marcado
    IF p_presencas_marcadas ? membro.id::TEXT THEN
      total_marcados := total_marcados + 1;
    ELSE
      membros_nao_marcados := array_append(membros_nao_marcados, format('%s (%s)', membro.full_name, membro.group_name));
    END IF;
  END LOOP;
  
  -- Montar resultado
  SELECT json_build_object(
    'total_alunos', total_membros,
    'total_marcados', total_marcados,
    'total_nao_marcados', (total_membros - total_marcados),
    'alunos_nao_marcados', membros_nao_marcados,
    'precisa_confirmacao', (total_membros - total_marcados) > 0,
    'mensagem_confirmacao', CASE 
      WHEN (total_membros - total_marcados) > 0 THEN
        format('⚠️ %s membro(s) não foram marcados e serão registrados como AUSENTES:', (total_membros - total_marcados))
      ELSE
        '✅ Todos os membros foram marcados!'
    END
  ) INTO resultado;
  
  RETURN resultado;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Corrigir função salvar_chamada_completa para filtrar por group_id
CREATE OR REPLACE FUNCTION salvar_chamada_completa(
  p_lesson_id UUID,
  p_presencas_marcadas JSONB
) RETURNS JSON AS $$
DECLARE
  aluno RECORD;
  total_presentes INT := 0;
  total_ausentes INT := 0;
  total_alunos INT := 0;
  resultado JSON;
  ausentes_list TEXT[] := '{}';
  v_lesson_group_id UUID;
BEGIN
  -- Obter o group_id da aula
  SELECT group_id INTO v_lesson_group_id
  FROM lessons
  WHERE id = p_lesson_id;

  -- Deletar registros existentes de chamada desta aula
  DELETE FROM attendance WHERE lesson_id = p_lesson_id;
  
  -- Percorrer apenas os alunos do grupo da aula
  FOR aluno IN 
    SELECT s.id, s.full_name, g.name as group_name
    FROM students s
    LEFT JOIN groups g ON g.id = s.group_id
    WHERE v_lesson_group_id IS NULL OR s.group_id = v_lesson_group_id
    ORDER BY s.full_name
  LOOP
    total_alunos := total_alunos + 1;
    
    -- Verificar se aluno foi marcado
    IF p_presencas_marcadas ? aluno.id::TEXT THEN
      -- Inserir com o valor marcado (presente ou ausente)
      INSERT INTO attendance (lesson_id, student_id, present)
      VALUES (p_lesson_id, aluno.id, (p_presencas_marcadas->>(aluno.id::TEXT))::BOOLEAN);
      
      IF (p_presencas_marcadas->>(aluno.id::TEXT))::BOOLEAN THEN
        total_presentes := total_presentes + 1;
      ELSE
        total_ausentes := total_ausentes + 1;
        ausentes_list := array_append(ausentes_list, format('%s (%s)', aluno.full_name, aluno.group_name));
      END IF;
    ELSE
      -- Não foi marcado: registrar como ausente
      INSERT INTO attendance (lesson_id, student_id, present)
      VALUES (p_lesson_id, aluno.id, FALSE);
      
      total_ausentes := total_ausentes + 1;
      ausentes_list := array_append(ausentes_list, format('%s (%s)', aluno.full_name, aluno.group_name));
    END IF;
  END LOOP;
  
  -- Montar resultado
  SELECT json_build_object(
    'success', TRUE,
    'message', 'Chamada salva com sucesso',
    'lesson_id', p_lesson_id,
    'resumo', json_build_object(
      'total_alunos', total_alunos,
      'total_presentes', total_presentes,
      'total_ausentes', total_ausentes,
      'total_nao_marcados', 0
    ),
    'todos_alunos_ausentes', ausentes_list,
    'precisa_confirmacao', FALSE,
    'mensagem_confirmacao', 'Chamada completa! Todos os alunos foram marcados.',
    'timestamp', NOW()
  ) INTO resultado;
  
  RETURN resultado;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
