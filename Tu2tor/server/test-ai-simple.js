/**
 * Simple AI Service Test (No Authentication Required)
 * Tests the AI service directly
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file
dotenv.config({ path: path.resolve(__dirname, '.env') });

console.log('Environment check:');
console.log('  GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY);
console.log('  OPENAI_API_KEY exists:', !!process.env.OPENAI_API_KEY);

import aiService from './src/ai/services/AIService.js';

console.log('\n' + '='.repeat(60));
console.log('🧪 Backend AI Service Direct Test');
console.log('='.repeat(60));

async function testAIService() {
  try {
    // Test 1: Initialize AI Service
    console.log('\n=== Test 1: Initialize AI Service ===');
    await aiService.initialize();
    console.log('✅ AI Service initialized successfully');
    console.log(`   Active Provider: ${aiService.getActiveProviderName()}`);
    console.log(`   Registered Providers: ${Array.from(aiService.providers.keys()).join(', ')}`);

    // Test 2: Generate simple content
    console.log('\n=== Test 2: Generate Content ===');
    const result = await aiService.generateContent('Say "Hello World" in one sentence', {
      maxTokens: 50,
      temperature: 0.7,
    });
    
    console.log('✅ Content generation successful');
    console.log(`   Response: ${result.content}`);
    console.log(`   Tokens: ${result.tokens}`);
    console.log(`   Cost: $${result.cost}`);
    console.log(`   Provider: ${result.provider}`);
    console.log(`   Model: ${result.model}`);

    // Test 3: Stream chat
    console.log('\n=== Test 3: Stream Chat ===');
    const messages = [
      { role: 'user', content: 'Count from 1 to 5' }
    ];
    
    let streamedContent = '';
    let chunkCount = 0;
    
    console.log('   Streaming...');
    for await (const chunk of aiService.streamChat(messages, { maxTokens: 100 })) {
      streamedContent += chunk;
      chunkCount++;
      process.stdout.write('.');
    }
    
    console.log('\n✅ Stream chat successful');
    console.log(`   Chunks received: ${chunkCount}`);
    console.log(`   Full response: ${streamedContent}`);

    // Test 4: Thinking mode
    console.log('\n=== Test 4: Thinking Mode ===');
    const thinkingMessages = [
      { role: 'user', content: 'What is 2+2? Show your thinking process.' }
    ];
    
    let thinkingContent = '';
    console.log('   Streaming with thinking mode...');
    for await (const chunk of aiService.streamChat(thinkingMessages, { 
      thinkingMode: true,
      maxTokens: 200 
    })) {
      thinkingContent += chunk;
      process.stdout.write('.');
    }
    
    console.log('\n✅ Thinking mode successful');
    console.log(`   Response length: ${thinkingContent.length} chars`);
    console.log(`   Has "Thinking": ${thinkingContent.includes('Thinking') || thinkingContent.includes('thinking')}`);
    console.log(`   Preview: ${thinkingContent.substring(0, 150)}...`);

    // Test 5: Usage stats
    console.log('\n=== Test 5: Usage Statistics ===');
    const stats = aiService.getUsageStats();
    console.log('✅ Usage stats retrieved');
    console.log(`   Total Requests: ${stats.totalRequests}`);
    console.log(`   Total Tokens: ${stats.totalTokens}`);
    console.log(`   Total Cost: $${stats.totalCost.toFixed(4)}`);

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('🎉 All Tests Passed!');
    console.log('='.repeat(60));
    console.log('\n✅ Backend AI service is fully functional');
    console.log('✅ Ready for frontend integration');
    console.log('\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('   Stack:', error.stack);
    process.exit(1);
  }
}

testAIService();

