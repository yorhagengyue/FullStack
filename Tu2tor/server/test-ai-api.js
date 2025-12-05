/**
 * AI API Test Script
 * Tests all backend AI endpoints
 */

import fetch from 'node-fetch';

const API_URL = 'http://localhost:5000';
let authToken = null;

// Test credentials (update these)
const TEST_USER = {
  email: 'test@example.com',
  password: 'password123'
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testHealthCheck() {
  log('\n=== Test 1: Health Check ===', 'blue');
  try {
    const response = await fetch(`${API_URL}/api/health`);
    const data = await response.json();
    
    if (data.ai === 'initialized') {
      log('✅ Health check passed', 'green');
      log(`   AI Provider: ${data.aiProvider}`);
      return true;
    } else {
      log('❌ AI not initialized', 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Health check failed: ${error.message}`, 'red');
    return false;
  }
}

async function login() {
  log('\n=== Test 2: Login (Get Auth Token) ===', 'blue');
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(TEST_USER),
    });
    
    const data = await response.json();
    
    if (data.token) {
      authToken = data.token;
      log('✅ Login successful', 'green');
      log(`   Token: ${authToken.substring(0, 20)}...`);
      return true;
    } else {
      log('❌ Login failed: No token received', 'red');
      log('⚠️  Please update TEST_USER credentials in test script', 'yellow');
      return false;
    }
  } catch (error) {
    log(`❌ Login failed: ${error.message}`, 'red');
    return false;
  }
}

async function testGenerateContent() {
  log('\n=== Test 3: Generate Content ===', 'blue');
  try {
    const response = await fetch(`${API_URL}/api/ai/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        prompt: 'Say hello in one sentence',
        options: { maxTokens: 50 },
      }),
    });
    
    const data = await response.json();
    
    if (data.success && data.content) {
      log('✅ Content generation passed', 'green');
      log(`   Response: ${data.content.substring(0, 100)}...`);
      log(`   Tokens: ${data.tokens}, Cost: $${data.cost}`);
      return true;
    } else {
      log('❌ Content generation failed', 'red');
      log(`   Error: ${data.error || data.message}`);
      return false;
    }
  } catch (error) {
    log(`❌ Content generation failed: ${error.message}`, 'red');
    return false;
  }
}

async function testDetectSubject() {
  log('\n=== Test 4: Detect Subject ===', 'blue');
  try {
    const response = await fetch(`${API_URL}/api/ai/detect-subject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        content: 'I am learning about React hooks and state management',
      }),
    });
    
    const data = await response.json();
    
    if (data.success) {
      log('✅ Subject detection passed', 'green');
      log(`   Is Study Related: ${data.isStudyRelated}`);
      log(`   Subject: ${data.subject || 'N/A'}`);
      log(`   Confidence: ${data.confidence}%`);
      return true;
    } else {
      log('❌ Subject detection failed', 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Subject detection failed: ${error.message}`, 'red');
    return false;
  }
}

async function testGetProviders() {
  log('\n=== Test 5: Get Providers ===', 'blue');
  try {
    const response = await fetch(`${API_URL}/api/ai/providers`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });
    
    const data = await response.json();
    
    if (data.success && data.providers) {
      log('✅ Get providers passed', 'green');
      log(`   Available: ${data.providers.map(p => p.name).join(', ')}`);
      log(`   Active: ${data.activeProvider}`);
      return true;
    } else {
      log('❌ Get providers failed', 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Get providers failed: ${error.message}`, 'red');
    return false;
  }
}

async function testGetUsage() {
  log('\n=== Test 6: Get Usage Stats ===', 'blue');
  try {
    const response = await fetch(`${API_URL}/api/ai/usage`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });
    
    const data = await response.json();
    
    if (data.success) {
      log('✅ Get usage passed', 'green');
      log(`   Total Requests: ${data.totalRequests}`);
      log(`   Total Tokens: ${data.totalTokens}`);
      log(`   Total Cost: $${data.totalCost.toFixed(4)}`);
      return true;
    } else {
      log('❌ Get usage failed', 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Get usage failed: ${error.message}`, 'red');
    return false;
  }
}

async function testStreamChat() {
  log('\n=== Test 7: Stream Chat (SSE) ===', 'blue');
  try {
    const response = await fetch(`${API_URL}/api/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        messages: [
          { role: 'user', content: 'Say hi in 5 words' }
        ],
        options: { maxTokens: 50 },
      }),
    });
    
    if (!response.ok) {
      log('❌ Stream chat failed: Response not OK', 'red');
      return false;
    }

    log('✅ Stream chat started', 'green');
    log('   Receiving chunks...');
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullContent = '';
    let chunkCount = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const text = decoder.decode(value);
      const lines = text.split('\n');

      for (const line of lines) {
        if (line.trim().startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.chunk) {
              fullContent += data.chunk;
              chunkCount++;
            }
            if (data.done) {
              log(`✅ Stream completed`, 'green');
              log(`   Chunks received: ${chunkCount}`);
              log(`   Full response: ${fullContent}`);
              return true;
            }
          } catch (e) {
            // Skip parse errors
          }
        }
      }
    }

    return true;
  } catch (error) {
    log(`❌ Stream chat failed: ${error.message}`, 'red');
    return false;
  }
}

// Run all tests
async function runAllTests() {
  log('\n' + '='.repeat(50), 'blue');
  log('🧪 AI API Test Suite', 'blue');
  log('='.repeat(50), 'blue');

  const results = [];

  // Test 1: Health Check
  results.push(await testHealthCheck());

  // Test 2: Login
  const loginSuccess = await login();
  results.push(loginSuccess);

  if (!loginSuccess) {
    log('\n⚠️  Cannot continue without authentication', 'yellow');
    log('   Please update TEST_USER in test script', 'yellow');
    return;
  }

  // Test 3-7: AI Endpoints
  results.push(await testGenerateContent());
  results.push(await testDetectSubject());
  results.push(await testGetProviders());
  results.push(await testGetUsage());
  results.push(await testStreamChat());

  // Summary
  log('\n' + '='.repeat(50), 'blue');
  log('📊 Test Summary', 'blue');
  log('='.repeat(50), 'blue');
  
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  log(`\nTests Passed: ${passed}/${total}`, passed === total ? 'green' : 'yellow');
  
  if (passed === total) {
    log('\n🎉 All tests passed! Backend AI service is working correctly.', 'green');
  } else {
    log('\n⚠️  Some tests failed. Please check the errors above.', 'yellow');
  }
  
  log('\n');
}

// Run tests
runAllTests().catch(error => {
  log(`\n❌ Test suite failed: ${error.message}`, 'red');
  process.exit(1);
});

