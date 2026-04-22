#!/usr/bin/env node

/**
 * Script de deploy automático para App-LOPDP
 * Se ejecuta después del build. Copia archivos estáticos al servidor Nginx.
 * 
 * Uso: node scripts/deploy-static.js
 * O vía npm: npm run deploy:static
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const FRONTEND_DIST = path.join(__dirname, '..', 'frontend', 'dist');
const NGINX_ROOT = '/var/www/html';

function run(command, options = {}) {
  console.log(`\n▶ ${command}`);
  try {
    const output = execSync(command, {
      encoding: 'utf-8',
      stdio: 'inherit',
      ...options,
    });
    return output;
  } catch (error) {
    console.error(`\n✗ Error ejecutando: ${command}`);
    throw error;
  }
}

function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║           DEPLOY ESTÁTICO - App LOPDP                      ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  // Verificar que el build del frontend existe
  if (!fs.existsSync(FRONTEND_DIST)) {
    console.error(`\n✗ No se encontró ${FRONTEND_DIST}`);
    console.error('   Ejecuta primero: npm run build:frontend');
    process.exit(1);
  }

  // Detectar si estamos en Linux (VM de producción) o Windows (desarrollo)
  const isLinux = process.platform === 'linux';

  if (!isLinux) {
    console.log('\n⚠️  Detectado entorno Windows (desarrollo)');
    console.log('   Este script solo copia archivos en Linux (servidor de producción)');
    console.log('   En Windows, el deploy se hace manualmente o vía SSH');
    console.log('\n✓ Build completado exitosamente');
    process.exit(0);
  }

  // En Linux: copiar archivos a Nginx
  console.log('\n📁 Copiando archivos del frontend a Nginx...');

  try {
    // Limpiar directorio anterior
    run(`sudo rm -rf ${NGINX_ROOT}/*`);

    // Copiar nuevos archivos
    run(`sudo cp -r ${FRONTEND_DIST}/* ${NGINX_ROOT}/`);

    // Verificar que index.html existe
    const indexPath = path.join(NGINX_ROOT, 'index.html');
    if (fs.existsSync(indexPath)) {
      console.log('\n✅ Archivos copiados correctamente');
    } else {
      console.error('\n✗ Error: index.html no encontrado en destino');
      process.exit(1);
    }

    // Recargar Nginx
    console.log('\n🔄 Recargando Nginx...');
    run('sudo systemctl reload nginx');

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║  ✓ DEPLOY COMPLETADO                                       ║');
    console.log('║                                                            ║');
    console.log('║  Ahora ejecuta: pm2 restart all                            ║');
    console.log('╚════════════════════════════════════════════════════════════╝');

  } catch (error) {
    console.error('\n✗ Falló el deploy');
    process.exit(1);
  }
}

main();
