-- ============================================================
-- SEED: datos iniciales de Monastery Barber Studio
-- Ejecuta esto en el SQL Editor de Supabase
-- ============================================================

-- Sedes
INSERT INTO sedes (id, nombre, direccion, ciudad, codigo_postal, telefono, activa) VALUES
  ('11111111-0000-0000-0000-000000000001', 'San Quirce', 'Calle de San Quirce, 7', 'Valladolid', '47003', '+34 983 000 001', true),
  ('11111111-0000-0000-0000-000000000002', 'Recoletos',  'Paseo de Recoletos, 12', 'Valladolid', '47006', '+34 983 000 002', true)
ON CONFLICT (id) DO NOTHING;

-- Barberos
INSERT INTO barberos (id, nombre, apellidos, sede_id, activo) VALUES
  ('22222222-0000-0000-0000-000000000001', 'Barbero 1', null, '11111111-0000-0000-0000-000000000001', true),
  ('22222222-0000-0000-0000-000000000002', 'Barbero 2', null, '11111111-0000-0000-0000-000000000001', true),
  ('22222222-0000-0000-0000-000000000003', 'Barbero 3', null, '11111111-0000-0000-0000-000000000002', true)
ON CONFLICT (id) DO NOTHING;

-- Servicios
INSERT INTO servicios (id, nombre, categoria, descripcion, duracion_minutos, precio, activo) VALUES
  ('33333333-0000-0000-0000-000000000001', 'Corte con degradado',          'corte',       null, 45, 20, true),
  ('33333333-0000-0000-0000-000000000002', 'Corte difuminado',              'corte',       null, 45, 20, true),
  ('33333333-0000-0000-0000-000000000003', 'Corte con tijeras',             'corte',       null, 45, 22, true),
  ('33333333-0000-0000-0000-000000000004', 'Corte personalizado',           'corte',       null, 60, 25, true),
  ('33333333-0000-0000-0000-000000000005', 'Corte casi rapado',             'corte',       null, 30, 15, true),
  ('33333333-0000-0000-0000-000000000006', 'Corte estilo militar',          'corte',       null, 30, 15, true),
  ('33333333-0000-0000-0000-000000000007', 'Corte de pelo largo',           'corte',       null, 60, 28, true),
  ('33333333-0000-0000-0000-000000000008', 'Corte infantil',                'corte',       null, 30, 15, true),
  ('33333333-0000-0000-0000-000000000009', 'Pelo rizado',                   'corte',       null, 60, 28, true),
  ('33333333-0000-0000-0000-000000000010', 'Recorte de barba',              'barba',       null, 30, 15, true),
  ('33333333-0000-0000-0000-000000000011', 'Mantenimiento de barba',        'barba',       null, 30, 18, true),
  ('33333333-0000-0000-0000-000000000012', 'Acondicionamiento de barba',    'barba',       null, 45, 22, true),
  ('33333333-0000-0000-0000-000000000013', 'Afeitado clásico',              'barba',       null, 45, 22, true),
  ('33333333-0000-0000-0000-000000000014', 'Afeitado con cuchilla',         'barba',       null, 45, 25, true),
  ('33333333-0000-0000-0000-000000000015', 'Afeitado con toallas calientes','barba',       null, 50, 28, true),
  ('33333333-0000-0000-0000-000000000016', 'Afeitado de cabeza',            'barba',       null, 45, 25, true),
  ('33333333-0000-0000-0000-000000000017', 'Tinte de barba',                'barba',       null, 45, 20, true),
  ('33333333-0000-0000-0000-000000000018', 'Tratamiento capilar',           'tratamiento', null, 60, 30, true),
  ('33333333-0000-0000-0000-000000000019', 'Tratamiento cuero cabelludo',   'tratamiento', null, 60, 30, true),
  ('33333333-0000-0000-0000-000000000020', 'Champú y acondicionador',       'tratamiento', null, 30, 15, true),
  ('33333333-0000-0000-0000-000000000021', 'Alisado',                       'tratamiento', null, 90, 45, true),
  ('33333333-0000-0000-0000-000000000022', 'Permanente',                    'tratamiento', null, 120,60, true),
  ('33333333-0000-0000-0000-000000000023', 'Coloración capilar',            'tratamiento', null, 90, 50, true),
  ('33333333-0000-0000-0000-000000000024', 'Recorte de cejas',              'estetica',    null, 15, 10, true),
  ('33333333-0000-0000-0000-000000000025', 'Teñido de cejas',               'estetica',    null, 30, 15, true),
  ('33333333-0000-0000-0000-000000000026', 'Depilación masculina',          'estetica',    null, 30, 18, true),
  ('33333333-0000-0000-0000-000000000027', 'Manicura masculina',            'estetica',    null, 45, 22, true),
  ('33333333-0000-0000-0000-000000000028', 'Corte + Barba',                 'pack',        null, 75, 32, true),
  ('33333333-0000-0000-0000-000000000029', 'Pack novios',                   'pack',        null, 90, 50, true)
ON CONFLICT (id) DO NOTHING;

-- Horarios barberos: Lun-Sáb 9:00-14:00 y 16:00-20:00
-- dia_semana: 1=Lunes, 2=Martes, 3=Miércoles, 4=Jueves, 5=Viernes, 6=Sábado
DO $$
DECLARE
  bids uuid[] := ARRAY[
    '22222222-0000-0000-0000-000000000001'::uuid,
    '22222222-0000-0000-0000-000000000002'::uuid,
    '22222222-0000-0000-0000-000000000003'::uuid
  ];
  bid uuid;
  d int;
BEGIN
  FOREACH bid IN ARRAY bids LOOP
    FOR d IN 1..6 LOOP
      INSERT INTO horarios_barbero (barbero_id, dia_semana, hora_inicio, hora_fin, activo)
      VALUES (bid, d, '09:00', '14:00', true)
      ON CONFLICT DO NOTHING;

      INSERT INTO horarios_barbero (barbero_id, dia_semana, hora_inicio, hora_fin, activo)
      VALUES (bid, d, '16:00', '20:00', true)
      ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;
END $$;
