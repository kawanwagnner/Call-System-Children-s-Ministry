/*
  # Views e Funções para Sistema de Recepção
  
  1. Views
    - `v_reception_member_status` - Status de presença dos membros
    - `v_reception_attendance_summary` - Resumo de presenças por evento
  
  2. Functions
    - Funções para facilitar consultas de presença
*/

-- View para status dos membros (similar ao sistema do ministério)
CREATE OR REPLACE VIEW v_reception_member_status AS
SELECT 
    m.id as member_id,
    m.full_name,
    m.member_type,
    m.contact_phone,
    m.contact_email,
    g.name as group_name,
    COALESCE(
        CASE 
            WHEN COUNT(a.id) = 0 THEN 'Sem Registro'
            WHEN COUNT(CASE WHEN a.present THEN 1 END)::float / COUNT(a.id) >= 0.8 THEN 'Ativo'
            WHEN COUNT(CASE WHEN a.present THEN 1 END)::float / COUNT(a.id) >= 0.5 THEN 'Moderado'
            ELSE 'Inativo'
        END, 'Sem Registro'
    ) as status,
    COUNT(a.id) as total_events,
    COUNT(CASE WHEN a.present THEN 1 END) as total_presences,
    ROUND(
        CASE 
            WHEN COUNT(a.id) > 0 
            THEN (COUNT(CASE WHEN a.present THEN 1 END)::float / COUNT(a.id)) * 100 
            ELSE 0 
        END::numeric, 1
    ) as attendance_percentage
FROM reception_members m
LEFT JOIN reception_groups g ON m.group_id = g.id
LEFT JOIN reception_attendance a ON m.id = a.member_id
LEFT JOIN reception_events e ON a.event_id = e.id
WHERE e.date IS NULL OR e.date >= CURRENT_DATE - INTERVAL '3 months'
GROUP BY m.id, m.full_name, m.member_type, m.contact_phone, m.contact_email, g.name
ORDER BY m.full_name;

-- View para resumo de presenças por evento
CREATE OR REPLACE VIEW v_reception_attendance_summary AS
SELECT 
    e.id as event_id,
    e.title,
    e.date,
    e.event_type,
    e.leader,
    COUNT(a.id) as total_registered,
    COUNT(CASE WHEN a.present THEN 1 END) as total_present,
    COUNT(CASE WHEN NOT a.present THEN 1 END) as total_absent,
    ROUND(
        CASE 
            WHEN COUNT(a.id) > 0 
            THEN (COUNT(CASE WHEN a.present THEN 1 END)::float / COUNT(a.id)) * 100 
            ELSE 0 
        END::numeric, 1
    ) as attendance_percentage
FROM reception_events e
LEFT JOIN reception_attendance a ON e.id = a.event_id
GROUP BY e.id, e.title, e.date, e.event_type, e.leader
ORDER BY e.date DESC;

-- Função para buscar membros ausentes em um evento específico
CREATE OR REPLACE FUNCTION get_reception_absent_members(event_uuid uuid)
RETURNS TABLE (
    member_id uuid,
    full_name text,
    member_type text,
    contact_phone text,
    group_name text
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id,
        m.full_name,
        m.member_type,
        m.contact_phone,
        g.name as group_name
    FROM reception_members m
    LEFT JOIN reception_groups g ON m.group_id = g.id
    LEFT JOIN reception_attendance a ON m.id = a.member_id AND a.event_id = event_uuid
    WHERE a.id IS NULL OR a.present = false
    ORDER BY m.full_name;
END;
$$ LANGUAGE plpgsql;

-- Função para estatísticas rápidas da recepção
CREATE OR REPLACE FUNCTION get_reception_quick_stats()
RETURNS TABLE (
    total_members bigint,
    total_visitors bigint,
    events_this_month bigint,
    present_today bigint,
    absent_today bigint
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM reception_members WHERE member_type = 'Membro'),
        (SELECT COUNT(*) FROM reception_members WHERE member_type = 'Visitante'),
        (SELECT COUNT(*) FROM reception_events WHERE date >= date_trunc('month', CURRENT_DATE)),
        COALESCE((
            SELECT COUNT(CASE WHEN a.present THEN 1 END)
            FROM reception_attendance a
            JOIN reception_events e ON a.event_id = e.id
            WHERE e.date = CURRENT_DATE
        ), 0),
        COALESCE((
            SELECT COUNT(CASE WHEN NOT a.present THEN 1 END)
            FROM reception_attendance a
            JOIN reception_events e ON a.event_id = e.id
            WHERE e.date = CURRENT_DATE
        ), 0);
END;
$$ LANGUAGE plpgsql;