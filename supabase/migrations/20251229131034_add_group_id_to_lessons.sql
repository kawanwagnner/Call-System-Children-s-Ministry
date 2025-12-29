-- =====================================================
-- Adicionar campo group_id às tabelas de aulas/eventos
-- Migration: 20251229131034
-- =====================================================

-- 1. Adicionar coluna group_id na tabela lessons
ALTER TABLE lessons 
ADD COLUMN IF NOT EXISTS group_id uuid REFERENCES groups(id) ON DELETE SET NULL;

-- 2. Adicionar coluna group_id na tabela reception_events
ALTER TABLE reception_events 
ADD COLUMN IF NOT EXISTS group_id uuid REFERENCES reception_groups(id) ON DELETE SET NULL;

-- 3. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_lessons_group_id ON lessons(group_id);
CREATE INDEX IF NOT EXISTS idx_reception_events_group_id ON reception_events(group_id);

-- 4. Comentários
COMMENT ON COLUMN lessons.group_id IS 'Grupo para qual a aula é destinada';
COMMENT ON COLUMN reception_events.group_id IS 'Grupo para qual o evento é destinado';
