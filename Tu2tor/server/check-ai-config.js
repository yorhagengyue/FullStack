/**
 * AI Configuration Checker
 * Run this to verify your AI service configuration
 */

import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env or .env.local
const envPaths = [
  path.resolve(__dirname, '.env.local'),
  path.resolve(__dirname, '.env'),
];

let envLoaded = false;
for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    console.log(`✅ Environment file found: ${path.basename(envPath)}`);
    envLoaded = true;
    break;
  }
}

if (!envLoaded) {
  console.log('❌ No .env or .env.local file found');
  console.log('   Please create server/.env or server/.env.local file');
  process.exit(1);
}

console.log('\n📋 AI Configuration Check\n');

// Check Gemini
console.log('=== Google Gemini ===');
if (process.env.GEMINI_API_KEY) {
  const keyPreview = process.env.GEMINI_API_KEY.substring(0, 10) + '...';
  console.log(`✅ GEMINI_API_KEY: ${keyPreview} (length: ${process.env.GEMINI_API_KEY.length})`);
  console.log(`   GEMINI_MODEL: ${process.env.GEMINI_MODEL || 'gemini-2.5-flash (default)'}`);
  console.log(`   GEMINI_THINKING_MODEL: ${process.env.GEMINI_THINKING_MODEL || 'gemini-exp-1206 (default)'}`);
} else {
  console.log('❌ GEMINI_API_KEY not set');
  console.log('   Get your key at: https://makersuite.google.com/app/apikey');
}

console.log('\n=== OpenAI ===');
if (process.env.OPENAI_API_KEY) {
  const keyPreview = process.env.OPENAI_API_KEY.substring(0, 10) + '...';
  console.log(`✅ OPENAI_API_KEY: ${keyPreview} (length: ${process.env.OPENAI_API_KEY.length})`);
  console.log(`   OPENAI_MODEL: ${process.env.OPENAI_MODEL || 'gpt-4o (default)'}`);
} else {
  console.log('⚠️  OPENAI_API_KEY not set (optional)');
  console.log('   Get your key at: https://platform.openai.com/api-keys');
}

console.log('\n=== Default Provider ===');
const defaultProvider = process.env.DEFAULT_AI_PROVIDER || 'gemini';
console.log(`   DEFAULT_AI_PROVIDER: ${defaultProvider}`);

console.log('\n=== Rate Limiting ===');
console.log(`   Per Minute: ${process.env.AI_RATE_LIMIT_PER_MINUTE || '20 (default)'}`);
console.log(`   Per Hour: ${process.env.AI_RATE_LIMIT_PER_HOUR || '100 (default)'}`);
console.log(`   Per Day: ${process.env.AI_RATE_LIMIT_PER_DAY || '1000 (default)'}`);

console.log('\n=== Cost Controls ===');
console.log(`   Max Daily Cost Per User: $${process.env.AI_MAX_DAILY_COST_PER_USER || '1.00 (default)'}`);
console.log(`   Max Daily Cost Total: $${process.env.AI_MAX_DAILY_COST_TOTAL || '50.00 (default)'}`);

// Final check
console.log('\n=== Status ===');
const hasGemini = !!process.env.GEMINI_API_KEY;
const hasOpenAI = !!process.env.OPENAI_API_KEY;

if (hasGemini || hasOpenAI) {
  console.log('✅ At least one AI provider is configured');
  console.log('✅ Ready to start server!');
  console.log('\n📝 Next steps:');
  console.log('   1. Run: npm start');
  console.log('   2. Check for "✅ AI service initialized" message');
  console.log('   3. Test with: curl http://localhost:5000/api/health');
} else {
  console.log('❌ No AI providers configured');
  console.log('\n📝 Required actions:');
  console.log('   1. Add GEMINI_API_KEY or OPENAI_API_KEY to server/.env');
  console.log('   2. See server/SETUP_AI.md for detailed instructions');
}

console.log('\n' + '='.repeat(50) + '\n');

