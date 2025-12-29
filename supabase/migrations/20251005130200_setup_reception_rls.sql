/*
  # Row Level Security para Sistema de Recepção
  
  1. Enable RLS em todas as tabelas da recepção
  2. Criar policies básicas (podem ser ajustadas depois conforme necessário)
*/

-- Habilitar RLS em todas as tabelas da recepção
ALTER TABLE reception_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE reception_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE reception_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE reception_attendance ENABLE ROW LEVEL SECURITY;

-- Policies para reception_groups
CREATE POLICY "Permitir leitura de grupos para todos" ON reception_groups
    FOR SELECT USING (true);

CREATE POLICY "Permitir inserção de grupos para usuários autenticados" ON reception_groups
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir atualização de grupos para usuários autenticados" ON reception_groups
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Policies para reception_members
CREATE POLICY "Permitir leitura de membros para todos" ON reception_members
    FOR SELECT USING (true);

CREATE POLICY "Permitir inserção de membros para usuários autenticados" ON reception_members
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir atualização de membros para usuários autenticados" ON reception_members
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir exclusão de membros para usuários autenticados" ON reception_members
    FOR DELETE USING (auth.role() = 'authenticated');

-- Policies para reception_events
CREATE POLICY "Permitir leitura de eventos para todos" ON reception_events
    FOR SELECT USING (true);

CREATE POLICY "Permitir inserção de eventos para usuários autenticados" ON reception_events
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir atualização de eventos para usuários autenticados" ON reception_events
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir exclusão de eventos para usuários autenticados" ON reception_events
    FOR DELETE USING (auth.role() = 'authenticated');

-- Policies para reception_attendance
CREATE POLICY "Permitir leitura de presenças para todos" ON reception_attendance
    FOR SELECT USING (true);

CREATE POLICY "Permitir inserção de presenças para usuários autenticados" ON reception_attendance
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir atualização de presenças para usuários autenticados" ON reception_attendance
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir exclusão de presenças para usuários autenticados" ON reception_attendance
    FOR DELETE USING (auth.role() = 'authenticated');