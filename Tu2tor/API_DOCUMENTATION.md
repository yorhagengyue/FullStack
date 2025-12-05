# Tu2tor API 完整文档

**版本**: 2.0  
**基础 URL**: `http://localhost:5000/api`  
**更新时间**: 2025-12-05

---

## 📋 目录

1. [认证](#认证)
2. [AI 服务 API](#ai-服务-api)
3. [用户管理 API](#用户管理-api)
4. [课程预订 API](#课程预订-api)
5. [评价系统 API](#评价系统-api)
6. [学习笔记 API](#学习笔记-api)
7. [待办事项 API](#待办事项-api)
8. [消息系统 API](#消息系统-api)
9. [错误代码](#错误代码)

---

## 🔐 认证

### 认证方式

所有需要认证的 API 使用 JWT Token。

**Header 格式**:
```
Authorization: Bearer <your_jwt_token>
```

### 获取 Token

**端点**: `POST /api/auth/login`

**请求体**:
```json
{
  "email": "user@example.com",
  "password": "your_password"
}
```

**响应**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "user@example.com",
    "role": "student"
  }
}
```

---

## 🤖 AI 服务 API

### 基础路径: `/api/ai`

### 1. 健康检查

**端点**: `GET /api/ai/health`  
**认证**: 不需要

**响应**:
```json
{
  "success": true,
  "status": "healthy",
  "providers": ["gemini", "openai"],
  "activeProvider": "gemini"
}
```

---

### 2. 获取可用 AI 提供商

**端点**: `GET /api/ai/providers`  
**认证**: 不需要

**响应**:
```json
{
  "success": true,
  "providers": [
    {
      "name": "gemini",
      "isActive": true,
      "capabilities": {
        "chat": true,
        "contentGeneration": true,
        "embeddings": true,
        "streaming": true,
        "vision": true,
        "maxTokens": 2500,
        "contextWindow": 30720,
        "supportedModels": ["gemini-2.5-flash", "gemini-2.5-pro"],
        "pricing": {
          "input": 0.0003,
          "output": 0.0006
        }
      }
    }
  ],
  "activeProvider": "gemini"
}
```

---

### 3. 流式聊天 (SSE)

**端点**: `POST /api/ai/chat`  
**认证**: 需要  
**Content-Type**: `text/event-stream`

**请求体**:
```json
{
  "messages": [
    {
      "role": "user",
      "content": "What is photosynthesis?",
      "files": [
        {
          "data": "data:image/png;base64,iVBORw0KG..."
        }
      ]
    }
  ],
  "options": {
    "thinkingMode": false,
    "temperature": 0.7,
    "maxTokens": 2000
  }
}
```

**SSE 响应流**:
```
data: {"chunk":"Hello"}

data: {"chunk":" there!"}

data: {"done":true,"fullContent":"Hello there!","provider":"gemini","model":"gemini-2.5-flash","isThinking":false}
```

**深度思考模式**:
```json
{
  "options": {
    "thinkingMode": true
  }
}
```

**响应格式 (Deep Think)**:
```
**Thinking:**
[AI 的推理过程]

**Answer:**
[最终答案]
```

---

### 4. 生成内容 (非流式)

**端点**: `POST /api/ai/generate`  
**认证**: 需要

**请求体**:
```json
{
  "prompt": "Explain quantum physics",
  "options": {
    "temperature": 0.7,
    "maxTokens": 1000
  }
}
```

**响应**:
```json
{
  "success": true,
  "content": "Quantum physics is...",
  "tokens": 245,
  "cost": 0.00015,
  "provider": "gemini",
  "model": "gemini-2.5-flash"
}
```

---

### 5. 切换 AI 提供商

**端点**: `POST /api/ai/providers/switch`  
**认证**: 需要

**请求体**:
```json
{
  "provider": "openai"
}
```

**响应**:
```json
{
  "success": true,
  "provider": "openai",
  "model": "gpt-4o"
}
```

---

### 6. 获取使用统计

**端点**: `GET /api/ai/usage`  
**认证**: 需要

**响应**:
```json
{
  "success": true,
  "usage": {
    "totalRequests": 156,
    "totalTokens": 45000,
    "totalCost": 0.27,
    "byProvider": {
      "gemini": {
        "requests": 120,
        "tokens": 35000,
        "cost": 0.21
      },
      "openai": {
        "requests": 36,
        "tokens": 10000,
        "cost": 0.06
      }
    }
  }
}
```

---

## 👤 用户管理 API

### 基础路径: `/api/auth`

### 1. 注册

**端点**: `POST /api/auth/register`

**请求体**:
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "role": "student"
}
```

**响应**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com",
    "role": "student"
  }
}
```

---

### 2. 登录

见 [认证](#认证) 部分

---

### 3. 获取当前用户信息

**端点**: `GET /api/auth/me`  
**认证**: 需要

**响应**:
```json
{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com",
    "role": "student",
    "profile": {
      "avatar": "https://...",
      "bio": "Computer Science student"
    }
  }
}
```

---

## 📚 课程预订 API

### 基础路径: `/api/bookings`

### 1. 创建预订

**端点**: `POST /api/bookings`  
**认证**: 需要

**请求体**:
```json
{
  "tutorId": "507f1f77bcf86cd799439011",
  "subject": "Mathematics",
  "date": "2025-12-10",
  "startTime": "14:00",
  "duration": 60,
  "notes": "Need help with calculus"
}
```

**响应**:
```json
{
  "success": true,
  "booking": {
    "_id": "507f1f77bcf86cd799439012",
    "student": "507f1f77bcf86cd799439013",
    "tutor": "507f1f77bcf86cd799439011",
    "subject": "Mathematics",
    "status": "pending",
    "scheduledTime": "2025-12-10T14:00:00Z",
    "duration": 60,
    "sessionUrl": null
  }
}
```

---

### 2. 获取我的预订

**端点**: `GET /api/bookings/my-bookings`  
**认证**: 需要

**Query 参数**:
- `role`: `student` | `tutor`
- `status`: `pending` | `confirmed` | `in-progress` | `completed` | `cancelled`

**响应**:
```json
{
  "success": true,
  "bookings": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "tutor": {
        "_id": "507f1f77bcf86cd799439011",
        "username": "jane_tutor",
        "profile": {
          "avatar": "https://..."
        }
      },
      "subject": "Mathematics",
      "status": "confirmed",
      "scheduledTime": "2025-12-10T14:00:00Z",
      "duration": 60
    }
  ]
}
```

---

### 3. 开始会话

**端点**: `POST /api/bookings/:id/start`  
**认证**: 需要

**响应**:
```json
{
  "success": true,
  "booking": {
    "_id": "507f1f77bcf86cd799439012",
    "status": "in-progress",
    "actualStartTime": "2025-12-10T14:02:00Z",
    "sessionUrl": "http://localhost:5174/session/507f1f77bcf86cd799439012"
  }
}
```

---

### 4. 完成会话

**端点**: `POST /api/bookings/:id/complete`  
**认证**: 需要

**响应**:
```json
{
  "success": true,
  "booking": {
    "_id": "507f1f77bcf86cd799439012",
    "status": "completed",
    "actualEndTime": "2025-12-10T15:05:00Z",
    "duration": 63
  }
}
```

---

## ⭐ 评价系统 API

### 基础路径: `/api/reviews`

### 1. 提交评价

**端点**: `POST /api/reviews`  
**认证**: 需要

**请求体**:
```json
{
  "bookingId": "507f1f77bcf86cd799439012",
  "tutorId": "507f1f77bcf86cd799439011",
  "rating": 5,
  "comment": "Excellent tutor! Very helpful and patient."
}
```

**响应**:
```json
{
  "success": true,
  "review": {
    "_id": "507f1f77bcf86cd799439014",
    "student": "507f1f77bcf86cd799439013",
    "tutor": "507f1f77bcf86cd799439011",
    "booking": "507f1f77bcf86cd799439012",
    "rating": 5,
    "comment": "Excellent tutor! Very helpful and patient.",
    "createdAt": "2025-12-10T15:10:00Z"
  }
}
```

---

### 2. 获取导师评价

**端点**: `GET /api/reviews/tutor/:tutorId`  
**认证**: 不需要

**响应**:
```json
{
  "success": true,
  "reviews": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "student": {
        "username": "john_doe",
        "profile": {
          "avatar": "https://..."
        }
      },
      "rating": 5,
      "comment": "Excellent tutor!",
      "createdAt": "2025-12-10T15:10:00Z"
    }
  ],
  "averageRating": 4.8,
  "totalReviews": 45
}
```

---

## 📝 学习笔记 API

### 基础路径: `/api/study-notes`

### 1. 创建笔记

**端点**: `POST /api/study-notes`  
**认证**: 需要

**请求体**:
```json
{
  "title": "Quantum Physics Basics",
  "content": "# Quantum Physics\n\nKey concepts:\n- Wave-particle duality\n- ...",
  "subject": "Physics",
  "tags": ["quantum", "physics", "science"]
}
```

**响应**:
```json
{
  "success": true,
  "note": {
    "_id": "507f1f77bcf86cd799439015",
    "user": "507f1f77bcf86cd799439013",
    "title": "Quantum Physics Basics",
    "subject": "Physics",
    "tags": ["quantum", "physics", "science"],
    "createdAt": "2025-12-10T16:00:00Z"
  }
}
```

---

### 2. 获取我的笔记

**端点**: `GET /api/study-notes`  
**认证**: 需要

**Query 参数**:
- `subject`: 筛选学科
- `search`: 搜索关键词
- `limit`: 返回数量 (默认 20)
- `skip`: 跳过数量 (分页)

**响应**:
```json
{
  "success": true,
  "notes": [
    {
      "_id": "507f1f77bcf86cd799439015",
      "title": "Quantum Physics Basics",
      "subject": "Physics",
      "tags": ["quantum"],
      "createdAt": "2025-12-10T16:00:00Z",
      "updatedAt": "2025-12-10T16:00:00Z"
    }
  ],
  "total": 15
}
```

---

### 3. 更新笔记

**端点**: `PUT /api/study-notes/:id`  
**认证**: 需要

**请求体**:
```json
{
  "title": "Quantum Physics - Updated",
  "content": "# Updated content..."
}
```

---

### 4. 删除笔记

**端点**: `DELETE /api/study-notes/:id`  
**认证**: 需要

**响应**:
```json
{
  "success": true,
  "message": "Study note deleted successfully"
}
```

---

## ✅ 待办事项 API

### 基础路径: `/api/todos`

### 1. 创建待办

**端点**: `POST /api/todos`  
**认证**: 需要

**请求体**:
```json
{
  "title": "Complete math homework",
  "description": "Chapter 5 exercises",
  "dueDate": "2025-12-12",
  "priority": "high",
  "category": "homework"
}
```

**响应**:
```json
{
  "success": true,
  "todo": {
    "_id": "507f1f77bcf86cd799439016",
    "user": "507f1f77bcf86cd799439013",
    "title": "Complete math homework",
    "completed": false,
    "priority": "high",
    "dueDate": "2025-12-12T00:00:00Z",
    "createdAt": "2025-12-10T17:00:00Z"
  }
}
```

---

### 2. 获取我的待办

**端点**: `GET /api/todos`  
**认证**: 需要

**Query 参数**:
- `completed`: `true` | `false`
- `priority`: `low` | `medium` | `high`

**响应**:
```json
{
  "success": true,
  "todos": [
    {
      "_id": "507f1f77bcf86cd799439016",
      "title": "Complete math homework",
      "completed": false,
      "priority": "high",
      "dueDate": "2025-12-12T00:00:00Z"
    }
  ]
}
```

---

### 3. 更新待办状态

**端点**: `PUT /api/todos/:id`  
**认证**: 需要

**请求体**:
```json
{
  "completed": true
}
```

---

## 💬 消息系统 API

### 基础路径: `/api/messages`

### 1. 发送消息

**端点**: `POST /api/messages`  
**认证**: 需要

**请求体**:
```json
{
  "recipientId": "507f1f77bcf86cd799439011",
  "content": "Hello, I have a question about our next session",
  "attachments": []
}
```

**响应**:
```json
{
  "success": true,
  "message": {
    "_id": "507f1f77bcf86cd799439017",
    "sender": "507f1f77bcf86cd799439013",
    "recipient": "507f1f77bcf86cd799439011",
    "content": "Hello, I have a question...",
    "read": false,
    "createdAt": "2025-12-10T18:00:00Z"
  }
}
```

---

### 2. 获取对话

**端点**: `GET /api/messages/:userId`  
**认证**: 需要

**响应**:
```json
{
  "success": true,
  "messages": [
    {
      "_id": "507f1f77bcf86cd799439017",
      "sender": {
        "_id": "507f1f77bcf86cd799439013",
        "username": "john_doe"
      },
      "content": "Hello!",
      "read": true,
      "createdAt": "2025-12-10T18:00:00Z"
    }
  ]
}
```

---

### 3. 标记已读

**端点**: `PUT /api/messages/:id/read`  
**认证**: 需要

**响应**:
```json
{
  "success": true,
  "message": "Message marked as read"
}
```

---

## ❌ 错误代码

### HTTP 状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未认证 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 413 | 请求体过大 |
| 429 | 请求过于频繁 |
| 500 | 服务器错误 |

### 错误响应格式

```json
{
  "success": false,
  "error": "Error type",
  "message": "Detailed error message"
}
```

### 常见错误

#### 1. 认证错误
```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "No token provided"
}
```

#### 2. 参数错误
```json
{
  "success": false,
  "error": "ValidationError",
  "message": "Email is required"
}
```

#### 3. AI 服务错误
```json
{
  "success": false,
  "error": "AIServiceError",
  "message": "Failed to generate content: Rate limit exceeded"
}
```

#### 4. 请求体过大
```json
{
  "success": false,
  "error": "PayloadTooLarge",
  "message": "Request entity too large. Max size: 10MB"
}
```

---

## 📚 使用示例

### JavaScript (Axios)

```javascript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';
const token = localStorage.getItem('token');

// 创建 axios 实例
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

// AI 聊天 (流式)
async function streamChat(messages, options) {
  const response = await fetch(`${API_BASE_URL}/ai/chat`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ messages, options })
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = JSON.parse(line.slice(6));
        if (data.chunk) {
          console.log(data.chunk);
        }
        if (data.done) {
          console.log('Stream complete!');
        }
      }
    }
  }
}

// 获取学习笔记
async function getStudyNotes() {
  const response = await api.get('/study-notes', {
    params: {
      subject: 'Physics',
      limit: 10
    }
  });
  return response.data;
}

// 创建预订
async function createBooking(bookingData) {
  const response = await api.post('/bookings', bookingData);
  return response.data;
}
```

### Python (Requests)

```python
import requests
import json

API_BASE_URL = 'http://localhost:5000/api'
TOKEN = 'your_jwt_token'

headers = {
    'Authorization': f'Bearer {TOKEN}',
    'Content-Type': 'application/json'
}

# AI 生成内容
def generate_content(prompt):
    response = requests.post(
        f'{API_BASE_URL}/ai/generate',
        headers=headers,
        json={
            'prompt': prompt,
            'options': {
                'temperature': 0.7,
                'maxTokens': 1000
            }
        }
    )
    return response.json()

# 获取我的预订
def get_my_bookings(role='student'):
    response = requests.get(
        f'{API_BASE_URL}/bookings/my-bookings',
        headers=headers,
        params={'role': role}
    )
    return response.json()

# 使用示例
result = generate_content('Explain machine learning')
print(result['content'])
```

---

## 🔒 安全最佳实践

### 1. Token 管理
- ✅ 将 token 存储在 `localStorage` 或 `httpOnly` cookie
- ✅ 定期刷新 token
- ✅ 登出时清除 token

### 2. 请求限制
- ✅ AI API 有速率限制
- ✅ 建议实现请求队列
- ✅ 处理 429 错误并重试

### 3. 数据验证
- ✅ 前端验证所有输入
- ✅ 后端也会再次验证
- ✅ 使用类型检查

### 4. 错误处理
- ✅ 捕获所有 API 错误
- ✅ 向用户展示友好的错误信息
- ✅ 记录错误日志

---

## 📊 速率限制

### AI API
- **每分钟**: 20 请求
- **每小时**: 200 请求
- **每天**: 2000 请求

### 其他 API
- **每分钟**: 60 请求
- **每小时**: 1000 请求

**超过限制时响应**:
```json
{
  "success": false,
  "error": "RateLimitExceeded",
  "message": "Too many requests. Please try again in 30 seconds.",
  "retryAfter": 30
}
```

---

## 🎯 完整功能示例：AI 聊天应用

```javascript
class AIChat {
  constructor(apiUrl, token) {
    this.apiUrl = apiUrl;
    this.token = token;
    this.messages = [];
  }

  async sendMessage(content, thinkingMode = false) {
    this.messages.push({
      role: 'user',
      content: content
    });

    const response = await fetch(`${this.apiUrl}/ai/chat`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: this.messages,
        options: {
          thinkingMode: thinkingMode,
          temperature: 0.7,
          maxTokens: 2000
        }
      })
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullContent = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = JSON.parse(line.slice(6));
          
          if (data.chunk) {
            fullContent += data.chunk;
            this.onChunk(data.chunk);
          }
          
          if (data.done) {
            this.messages.push({
              role: 'assistant',
              content: data.fullContent,
              model: data.model,
              isThinking: data.isThinking
            });
            this.onComplete(data);
          }
        }
      }
    }
  }

  onChunk(chunk) {
    console.log(chunk);
  }

  onComplete(data) {
    console.log('Complete:', data);
  }
}

// 使用
const chat = new AIChat('http://localhost:5000/api', 'your_token');
chat.sendMessage('What is quantum physics?', true);
```

---

## 📞 支持

如有问题或需要帮助，请：
- 📧 Email: support@tu2tor.com
- 📱 GitHub Issues: https://github.com/tu2tor/issues
- 📖 详细文档: https://docs.tu2tor.com

---

**最后更新**: 2025-12-05  
**API 版本**: 2.0  
**文档版本**: 1.0

