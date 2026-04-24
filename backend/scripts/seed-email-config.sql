-- ============================================
-- Seed: Configuración de correo para Servientrega
-- Ejecutar en PostgreSQL después del deploy
-- ============================================

-- Insertar configuración de correo para la empresa Servientrega
INSERT INTO email_configs (
  id,
  company_id,
  smtp_host,
  smtp_port,
  smtp_user,
  smtp_pass,
  smtp_from,
  is_active,
  created_at,
  updated_at
)
SELECT
  gen_random_uuid(),
  c.id,
  'smtp-mail.outlook.com',
  587,
  'dpo@servientrega.com.ec',
  'Ecuador2025+*',
  'dpo@servientrega.com.ec',
  true,
  NOW(),
  NOW()
FROM companies c
WHERE c.ruc = '0990010931001'
ON CONFLICT (company_id) DO UPDATE SET
  smtp_host = EXCLUDED.smtp_host,
  smtp_port = EXCLUDED.smtp_port,
  smtp_user = EXCLUDED.smtp_user,
  smtp_pass = EXCLUDED.smtp_pass,
  smtp_from = EXCLUDED.smtp_from,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Verificar que se insertó correctamente
SELECT * FROM email_configs ec
JOIN companies c ON c.id = ec.company_id
WHERE c.ruc = '0990010931001';
