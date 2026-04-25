#!/usr/bin/env node
/**
 * Security Audit Script for RAT Servientrega
 * Run with: node scripts/security-audit.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const RESULTS = {
  passed: [],
  failed: [],
  warnings: [],
};

function pass(message) {
  RESULTS.passed.push(message);
  console.log(`✅ ${message}`);
}

function fail(message) {
  RESULTS.failed.push(message);
  console.log(`❌ ${message}`);
}

function warn(message) {
  RESULTS.warnings.push(message);
  console.log(`⚠️ ${message}`);
}

function checkFileExists(filePath, description, required = true) {
  const fullPath = path.join(ROOT, filePath);
  if (fs.existsSync(fullPath)) {
    if (required) {
      pass(`${description}: ${filePath} exists`);
    } else {
      fail(`${description}: ${filePath} should NOT exist`);
    }
  } else {
    if (required) {
      fail(`${description}: ${filePath} missing`);
    } else {
      pass(`${description}: ${filePath} correctly absent`);
    }
  }
}

function checkFileContent(filePath, patterns, description) {
  const fullPath = path.join(ROOT, filePath);
  if (!fs.existsSync(fullPath)) {
    fail(`${description}: ${filePath} not found`);
    return;
  }
  const content = fs.readFileSync(fullPath, 'utf-8');
  for (const [pattern, shouldExist] of patterns) {
    const exists = content.includes(pattern);
    if (shouldExist && exists) {
      pass(`${description}: '${pattern}' found in ${filePath}`);
    } else if (shouldExist && !exists) {
      fail(`${description}: '${pattern}' NOT found in ${filePath}`);
    } else if (!shouldExist && exists) {
      fail(`${description}: '${pattern}' should NOT be in ${filePath}`);
    } else {
      pass(`${description}: '${pattern}' correctly absent from ${filePath}`);
    }
  }
}

function scanForSecrets(dir, extensions) {
  const secretPatterns = [
    /password\s*[=:]\s*['"][^'"]{4,}['"]/i,
    /pass\s*[=:]\s*['"][^'"]{4,}['"]/i,
    /secret\s*[=:]\s*['"][^'"]{8,}['"]/i,
    /api[_-]?key\s*[=:]\s*['"][^'"]{10,}['"]/i,
    /token\s*[=:]\s*['"][^'"]{10,}['"]/i,
    /sk-[a-zA-Z0-9]{20,}/,
    /AKIA[0-9A-Z]{16}/,
  ];

  // Patterns that are OK (test data, examples, env vars)
  const allowedPatterns = [
    /process\.env\./,
    /\$\{/,
    /env\./,
    /config\.get/,
    /\.example/,
    /template/,
    /test/i,
    /e2e/i,
    /mock/i,
    /dummy/i,
    /placeholder/i,
    /your_/i,
    /tu_/i,
    /GENERATE_/,
    /passwordHash/,
    /dto\.password/,
    /dto\.newPassword/,
    /dto\.currentPassword/,
    /user\.password/,
  ];

  const findings = [];
  
  function scanDir(currentDir) {
    const items = fs.readdirSync(currentDir);
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const relPath = path.relative(ROOT, fullPath);
      
      // Skip node_modules, .git, dist
      if (item === 'node_modules' || item === '.git' || item === 'dist' || item === 'postgres_data') {
        continue;
      }
      
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        scanDir(fullPath);
      } else if (stat.isFile()) {
        const ext = path.extname(item);
        if (extensions.includes(ext)) {
          try {
            const content = fs.readFileSync(fullPath, 'utf-8');
            const lines = content.split('\n');
            for (let i = 0; i < lines.length; i++) {
              for (const pattern of secretPatterns) {
                if (pattern.test(lines[i])) {
                  // Check if line contains allowed patterns
                  const isAllowed = allowedPatterns.some(ap => ap.test(lines[i]));
                  if (isAllowed) continue;
                  
                  findings.push(`${relPath}:${i + 1}: ${lines[i].trim().substring(0, 80)}`);
                }
              }
            }
          } catch (e) {
            // Binary file, skip
          }
        }
      }
    }
  }
  
  scanDir(dir);
  return findings;
}

console.log('\n🔒 ============================================');
console.log('🔒 SECURITY AUDIT - RAT Servientrega');
console.log('🔒 ============================================\n');

// 1. Check .env files are not tracked
console.log('\n📁 1. ENVIRONMENT FILES\n');
checkFileExists('.gitignore', '.gitignore exists');

const gitignoreContent = fs.readFileSync(path.join(ROOT, '.gitignore'), 'utf-8');
const envPatterns = [
  ['backend/.env', false],
  ['frontend/.env', false],
  ['backend/.env.local', false],
];
for (const [pattern, shouldExist] of envPatterns) {
  const exists = gitignoreContent.includes(pattern);
  // In .gitignore, we WANT these patterns to exist (to ignore the files)
  // The checkFileContent logic is inverted for .gitignore
  if (exists) {
    pass(`.gitignore correctly ignores ${pattern}`);
  } else {
    fail(`.gitignore should ignore ${pattern}`);
  }
}

checkFileExists('backend/.env', '.env in backend', false);
checkFileExists('frontend/.env', '.env in frontend', false);
checkFileExists('backend/.env.local', '.env.local in backend', false);

// 2. Check security files exist
console.log('\n🛡️  2. SECURITY IMPLEMENTATIONS\n');
checkFileExists('backend/src/common/filters/all-exceptions.filter.ts', 'Exception filter');
checkFileExists('backend/src/common/pipes/sanitize.pipe.ts', 'Sanitize pipe');
checkFileExists('backend/src/common/guards/throttler.guard.ts', 'Throttler guard');
checkFileExists('SECURITY.md', 'Security documentation');

// 3. Check main.ts has Helmet
console.log('\n🔐 3. HELMET & HEADERS\n');
checkFileContent('backend/src/main.ts', [
  ['helmet', true],
  ['contentSecurityPolicy', true],
  ['hsts', true],
], 'Helmet configuration');

// 4. Check app.module.ts has Throttler
console.log('\n⏱️  4. RATE LIMITING\n');
checkFileContent('backend/src/app.module.ts', [
  ['ThrottlerModule', true],
  ['ThrottlerGuard', true],
], 'Throttler configuration');

// 5. Check TLS configuration
console.log('\n🔑 5. TLS/SSL CONFIGURATION\n');
checkFileContent('backend/src/modules/mail/mail.service.ts', [
  ['rejectUnauthorized: false', false],
  ['SSLv3', false],
  ['rejectUnauthorized: true', true],
  ['minVersion', true],
], 'TLS security');

// 6. Check Docker security
console.log('\n🐳 6. DOCKER SECURITY\n');
checkFileContent('backend/Dockerfile', [
  ['USER', true],
  ['nodeuser', true],
], 'Backend Dockerfile non-root user');
checkFileContent('frontend/Dockerfile', [
  ['USER', true],
], 'Frontend Dockerfile non-root user');

// Check docker-compose doesn't expose 5432 uncommented
const dockerComposeLocal = fs.readFileSync(path.join(ROOT, 'docker-compose.local.yml'), 'utf-8');
const hasExposedPostgres = /ports:\s*\n\s+-\s*"5432:5432"/.test(dockerComposeLocal);
if (hasExposedPostgres) {
  fail('PostgreSQL port 5432 is exposed in docker-compose.local.yml');
} else {
  pass('PostgreSQL port 5432 is NOT exposed in docker-compose.local.yml');
}

// 7. Check nginx security
console.log('\n🌐 7. NGINX SECURITY\n');
checkFileContent('frontend/nginx.conf', [
  ['X-Frame-Options', true],
  ['X-Content-Type-Options', true],
  ['X-XSS-Protection', true],
  ['Referrer-Policy', true],
  ['Strict-Transport-Security', true],
], 'Nginx security headers');

// 8. Scan for hardcoded secrets
console.log('\n🔍 8. SECRET SCAN\n');
const secretFindings = scanForSecrets(ROOT, ['.ts', '.js', '.tsx', '.jsx', '.json', '.yaml', '.yml']);
if (secretFindings.length === 0) {
  pass('No hardcoded secrets detected in source files');
} else {
  warn(`Found ${secretFindings.length} potential secrets (review manually):`);
  for (const finding of secretFindings.slice(0, 10)) {
    console.log(`   - ${finding}`);
  }
  if (secretFindings.length > 10) {
    console.log(`   ... and ${secretFindings.length - 10} more`);
  }
}

// 9. Check auth DTOs
console.log('\n🔏 9. AUTHENTICATION SECURITY\n');
const loginDto = fs.readFileSync(path.join(ROOT, 'backend/src/modules/auth/dto/login.dto.ts'), 'utf-8');
if (loginDto.includes('MinLength') && loginDto.includes('8')) {
  pass('Login DTO has MinLength(8) for password');
} else {
  fail('Login DTO missing MinLength(8) for password');
}
if (loginDto.includes('MaxLength') && loginDto.includes('128')) {
  pass('Login DTO has MaxLength(128) for password');
} else {
  fail('Login DTO missing MaxLength(128) for password');
}
if (loginDto.includes('Matches') && loginDto.includes('[A-Z]')) {
  pass('Login DTO has uppercase requirement');
} else {
  fail('Login DTO missing uppercase requirement');
}

// 10. Check frontend security
console.log('\n💻 10. FRONTEND SECURITY\n');
checkFileContent('frontend/src/services/api.ts', [
  ['timeout', true],
  ['X-Requested-With', true],
], 'API security headers');
checkFileExists('frontend/src/utils/security.ts', 'Frontend security utilities');

// Summary
console.log('\n📊 ============================================');
console.log('📊 AUDIT SUMMARY');
console.log('📊 ============================================');
console.log(`✅ Passed: ${RESULTS.passed.length}`);
console.log(`❌ Failed: ${RESULTS.failed.length}`);
console.log(`⚠️  Warnings: ${RESULTS.warnings.length}`);
console.log('============================================\n');

if (RESULTS.failed.length > 0) {
  console.log('❌ CRITICAL ISSUES TO FIX:');
  for (const issue of RESULTS.failed) {
    console.log(`   - ${issue}`);
  }
  console.log('');
}

if (RESULTS.warnings.length > 0) {
  console.log('⚠️  WARNINGS TO REVIEW:');
  for (const warning of RESULTS.warnings) {
    console.log(`   - ${warning}`);
  }
  console.log('');
}

const exitCode = RESULTS.failed.length > 0 ? 1 : 0;
process.exit(exitCode);
