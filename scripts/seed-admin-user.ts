/**
 * Upsert a single superadmin login user for local development.
 * Reads credentials from .env.seed.local (gitignored — never commit).
 *
 * Run: npm run db:seed:admin
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { connectDB, disconnectDB } from '../lib/mongodb';
import { User } from '../lib/models/User';

function loadEnvFile(filename: string): void {
  const envPath = path.join(process.cwd(), filename);
  if (!fs.existsSync(envPath)) {
    return;
  }

  const content = fs.readFileSync(envPath, 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;

    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function loadLocalSeedEnv(): void {
  loadEnvFile('.env.local');
  loadEnvFile('.env.seed.local');
}

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function seedAdminUser() {
  loadLocalSeedEnv();

  const email = process.env.SEED_ADMIN_EMAIL?.toLowerCase().trim();
  const password = process.env.SEED_ADMIN_PASSWORD;
  const fullName = process.env.SEED_ADMIN_NAME || 'System Admin';

  if (!email || !password) {
    console.error('❌ Missing SEED_ADMIN_EMAIL or SEED_ADMIN_PASSWORD in .env.seed.local');
    console.error('   Copy .env.seed.local.example to .env.seed.local and fill in your values.');
    process.exit(1);
  }

  try {
    await connectDB();

    const user = await User.findOneAndUpdate(
      { email },
      {
        $set: {
          email,
          fullName,
          password: hashPassword(password),
          role: 'Admin',
          status: 'active',
          tenantId: 'system',
          lastLoginDate: new Date(),
        },
        $setOnInsert: {
          registrationDate: new Date(),
        },
      },
      { upsert: true, returnDocument: 'after' }
    );

    console.log(`✅ Local admin user ready: ${user.email}`);
    console.log('   Role: Admin (superadmin dashboard)');
  } catch (error) {
    console.error('❌ Failed to seed admin user:', error);
    process.exit(1);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
}

seedAdminUser();
