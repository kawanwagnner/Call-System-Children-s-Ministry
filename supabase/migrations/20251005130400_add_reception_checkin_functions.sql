-- Remover funções existentes se houver conflito de tipo
DROP FUNCTION IF EXISTS verificar_membros_nao_marcados_recepcao(uuid, jsonb);
DROP FUNCTION IF EXISTS salvar_checkin_completo_recepcao(uuid, jsonb);

-- Função para verificar membros não marcados na recepção (similar à do ministério)
CREATE OR REPLACE FUNCTION verificar_membros_nao_marcados_recepcao(
    p_event_id uuid,
    p_presencas_marcadas jsonb DEFAULT '{}'::jsonb
)
RETURNS JSON AS $$
DECLARE
    membro RECORD;
    membros_nao_marcados TEXT[] := '{}';
    total_membros INT := 0;
    total_marcados INT := 0;
    resultado JSON;
BEGIN
    -- Percorrer todos os membros
    FOR membro IN 
        SELECT m.id, m.full_name, g.name as group_name
        FROM reception_members m
        LEFT JOIN reception_groups g ON g.id = m.group_id
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
        'total_membros', total_membros,
        'total_marcados', total_marcados,
        'total_nao_marcados', (total_membros - total_marcados),
        'membros_nao_marcados', membros_nao_marcados,
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

-- Função para salvar check-in completo da recepção
CREATE OR REPLACE FUNCTION salvar_checkin_completo_recepcao(
    p_event_id uuid,
    p_presencas_marcadas jsonb DEFAULT '{}'::jsonb
)
RETURNS JSON AS $$
DECLARE
    membro RECORD;
    membros_nao_marcados TEXT[] := '{}';
    membros_ausentes TEXT[] := '{}';
    total_membros INT := 0;
    total_presentes INT := 0;
    total_ausentes INT := 0;
    total_nao_marcados INT := 0;
    resultado JSON;
    member_present BOOLEAN;
BEGIN
    -- Percorrer todos os membros do sistema
    FOR membro IN 
        SELECT m.id, m.full_name, g.name as group_name
        FROM reception_members m
        LEFT JOIN reception_groups g ON g.id = m.group_id
        ORDER BY g.name, m.full_name
    LOOP
        total_membros := total_membros + 1;
        
        -- Verificar se o membro foi marcado nos dados enviados
        IF p_presencas_marcadas ? membro.id::TEXT THEN
            -- Membro foi marcado, pegar o valor (true/false)
            member_present := (p_presencas_marcadas ->> membro.id::TEXT)::BOOLEAN;
            
            -- Inserir/atualizar presença
            INSERT INTO reception_attendance (event_id, member_id, present, check_in_time)
            VALUES (p_event_id, membro.id, member_present, CASE WHEN member_present THEN now() ELSE NULL END)
            ON CONFLICT (event_id, member_id)
            DO UPDATE SET 
                present = member_present,
                check_in_time = CASE WHEN member_present THEN now() ELSE NULL END;
            
            IF member_present THEN
                total_presentes := total_presentes + 1;
            ELSE
                total_ausentes := total_ausentes + 1;
                membros_ausentes := array_append(membros_ausentes, format('%s (%s)', membro.full_name, membro.group_name));
            END IF;
        ELSE
            -- Membro NÃO foi marcado - marcar como ausente automaticamente
            total_nao_marcados := total_nao_marcados + 1;
            total_ausentes := total_ausentes + 1;
            
            membros_nao_marcados := array_append(membros_nao_marcados, format('%s (%s)', membro.full_name, membro.group_name));
            membros_ausentes := array_append(membros_ausentes, format('%s (%s)', membro.full_name, membro.group_name));
            
            -- Inserir/atualizar como ausente
            INSERT INTO reception_attendance (event_id, member_id, present, check_in_time)
            VALUES (p_event_id, membro.id, false, NULL)
            ON CONFLICT (event_id, member_id)
            DO UPDATE SET 
                present = false,
                check_in_time = NULL;
        END IF;
    END LOOP;
    
    -- Montar resultado com informações para o popup de confirmação
    SELECT json_build_object(
        'success', true,
        'message', 'Check-in salvo com sucesso',
        'event_id', p_event_id,
        'resumo', json_build_object(
            'total_membros', total_membros,
            'total_presentes', total_presentes,
            'total_ausentes', total_ausentes,
            'total_nao_marcados', total_nao_marcados
        ),
        'membros_nao_marcados', membros_nao_marcados,
        'todos_membros_ausentes', membros_ausentes,
        'precisa_confirmacao', total_nao_marcados > 0,
        'mensagem_confirmacao', CASE 
            WHEN total_nao_marcados > 0 THEN
                format('⚠️ %s membro(s) não foram marcados e serão registrados como AUSENTES. Confirma?', total_nao_marcados)
            ELSE
                '✅ Todos os membros foram processados com sucesso!'
        END
    ) INTO resultado;
    
    RETURN resultado;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;