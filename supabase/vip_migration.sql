-- ============================================================
-- VIP Space Migration — Monastery Barber Studio
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- 1. Campos de reagendamiento en citas
ALTER TABLE citas ADD COLUMN IF NOT EXISTS reagendar_solicitado BOOLEAN DEFAULT false;
ALTER TABLE citas ADD COLUMN IF NOT EXISTS reagendar_motivo TEXT;

-- 2. Tabla de notificaciones para el CRM
CREATE TABLE IF NOT EXISTS notificaciones_crm (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo          TEXT NOT NULL,
  cliente_id    UUID REFERENCES clientes(id) ON DELETE CASCADE,
  cita_id       UUID REFERENCES citas(id) ON DELETE SET NULL,
  mensaje       TEXT,
  leida         BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- 3. RLS para notificaciones (solo staff las ve)
ALTER TABLE notificaciones_crm ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff puede gestionar notificaciones" ON notificaciones_crm
  FOR ALL
  USING (auth.jwt()->'app_metadata'->>'role' = 'staff')
  WITH CHECK (auth.jwt()->'app_metadata'->>'role' = 'staff');

-- 4. Service role puede insertar notificaciones (desde Server Actions)
CREATE POLICY "Service role inserta notificaciones" ON notificaciones_crm
  FOR INSERT
  WITH CHECK (true);

-- 5. Índices para rendimiento
CREATE INDEX IF NOT EXISTS idx_notificaciones_leida ON notificaciones_crm(leida, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notificaciones_tipo  ON notificaciones_crm(tipo);
CREATE INDEX IF NOT EXISTS idx_citas_reagendar      ON citas(reagendar_solicitado) WHERE reagendar_solicitado = true;
