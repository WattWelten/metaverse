#!/usr/bin/env tsx

import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const envExamplePath = join(rootDir, '.env.example');
const envLocalPath = join(rootDir, '.env.local');

function setupEnv(): void {
  console.log('Setting up environment variables...');

  // Check if .env.example exists
  if (!existsSync(envExamplePath)) {
    console.error('❌ .env.example not found!');
    process.exit(1);
  }

  // Check if .env.local already exists
  if (existsSync(envLocalPath)) {
    console.log('ℹ️  .env.local already exists, skipping creation');
    return;
  }

  // Copy .env.example to .env.local
  try {
    copyFileSync(envExamplePath, envLocalPath);
    console.log('✅ Created .env.local from .env.example');
  } catch (error) {
    console.error('❌ Failed to create .env.local:', error);
    process.exit(1);
  }

  // Check for required secrets/API keys
  const envContent = readFileSync(envLocalPath, 'utf-8');
  const requiredSecrets = ['VITE_READY_PLAYER_ME_API_KEY', 'VITE_WATTOS_API_KEY', 'VITE_CMS_TOKEN'];

  const missingSecrets: string[] = [];
  for (const secret of requiredSecrets) {
    const regex = new RegExp(`${secret}=(.+)`);
    const match = envContent.match(regex);
    if (!match || !match[1] || match[1].trim() === '') {
      missingSecrets.push(secret);
    }
  }

  if (missingSecrets.length > 0) {
    console.log('\n⚠️  Warning: Some optional secrets are not set:');
    missingSecrets.forEach((secret) => {
      console.log(`   - ${secret}`);
    });
    console.log('\n💡 These are optional for local development. Set them in .env.local if needed.');
  } else {
    console.log('✅ All optional secrets are set');
  }

  console.log('\n✅ Environment setup complete!');
  console.log('📝 Edit .env.local to customize feature flags and API keys.');
}

setupEnv();
