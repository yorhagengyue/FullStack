# 后端 AI 服务配置指南

## 📋 必要步骤

### 1. 创建或编辑环境变量文件

在 `Tu2tor/server/` 目录下，使用以下文件之一（优先级从高到低）：

- `.env.local` ✅ **推荐**（本地开发专用，不会被 git 提交）
- `.env` （通用配置）

如果还没有环境变量文件：

```bash
cd server
touch .env.local  # 或手动创建
```

如果已有 `.env.local` 或 `.env` 文件，直接编辑即可。

### 2. 添加 AI 配置

在 `server/.env.local`（或 `.env`）中添加以下内容：

```env
# =====================================
# AI Provider API Keys (REQUIRED)
# =====================================

# === Google Gemini (推荐) ===
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
GEMINI_THINKING_MODEL=gemini-exp-1206

# === OpenAI (备用) ===
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o

# === 默认 Provider ===
DEFAULT_AI_PROVIDER=gemini

# =====================================
# Rate Limiting
# =====================================
AI_RATE_LIMIT_PER_MINUTE=20
AI_RATE_LIMIT_PER_HOUR=100
AI_RATE_LIMIT_PER_DAY=1000

# =====================================
# Cost Controls
# =====================================
AI_MAX_DAILY_COST_PER_USER=1.00
AI_MAX_DAILY_COST_TOTAL=50.00
AI_WARN_COST_THRESHOLD=0.70
```

### 3. 获取 API Keys

#### Google Gemini API Key
1. 访问：https://makersuite.google.com/app/apikey
2. 点击 "Create API Key"
3. 复制 API Key
4. 粘贴到 `.env` 的 `GEMINI_API_KEY`

#### OpenAI API Key (可选)
1. 访问：https://platform.openai.com/api-keys
2. 点击 "Create new secret key"
3. 复制 API Key
4. 粘贴到 `.env` 的 `OPENAI_API_KEY`

**⚠️ 重要：至少需要配置一个 API Key（Gemini 或 OpenAI）**

### 4. 验证配置

启动服务器后，检查日志：

```bash
npm start
```

应该看到：
```
✅ AI service initialized
   Active provider: gemini
```

如果看到警告：
```
⚠️  AI service initialization failed
   AI features will be unavailable
```

说明 API Key 配置有问题。

---

## 🧪 测试 AI 服务

### 方法 1: 使用健康检查端点

```bash
# 需要先登录获取 token
curl -X GET http://localhost:5000/api/health
```

响应应包含：
```json
{
  "status": "healthy",
  "mongodb": "connected",
  "ai": "initialized",
  "aiProvider": "gemini"
}
```

### 方法 2: 测试 AI 端点（需要认证）

#### 2.1 登录获取 Token
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your_email", "password":"your_password"}'
```

复制返回的 `token`。

#### 2.2 测试内容生成
```bash
curl -X POST http://localhost:5000/api/ai/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"prompt":"Hello, how are you?","options":{"maxTokens":100}}'
```

#### 2.3 测试主题检测
```bash
curl -X POST http://localhost:5000/api/ai/detect-subject \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"content":"I am learning about database normalization and SQL queries"}'
```

#### 2.4 测试 Provider 列表
```bash
curl -X GET http://localhost:5000/api/ai/providers \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## ✅ 预期结果

### 成功指标
- ✅ 服务器启动时显示 "AI service initialized"
- ✅ `/api/health` 显示 `"ai": "initialized"`
- ✅ AI 端点返回正常响应（不是 500 错误）
- ✅ 控制台无红色错误信息

### 常见问题

#### 问题 1: "No AI providers configured"
**原因**：`.env` 中没有设置任何 API Key
**解决**：设置 `GEMINI_API_KEY` 或 `OPENAI_API_KEY`

#### 问题 2: "Gemini API key not configured"
**原因**：Gemini API Key 格式错误或为空
**解决**：检查 API Key 是否正确复制，确保没有多余空格

#### 问题 3: "Rate limit exceeded"
**原因**：发送请求太频繁
**解决**：等待 1 分钟后重试，或调整速率限制配置

#### 问题 4: "401 Unauthorized"
**原因**：没有提供 token 或 token 过期
**解决**：重新登录获取新 token

---

## 🔐 安全检查清单

在继续之前，确认：
- [ ] `.env` 文件已添加到 `.gitignore`
- [ ] API Keys 不在代码中硬编码
- [ ] 前端 `.env.local` 中没有 AI API Keys（将在 Phase 5 删除）
- [ ] 测试账号不是生产账号

---

## 📊 下一步

测试通过后，继续执行：
- **Phase 4**: 重构前端组件调用后端 API
- **Phase 5**: 清理前端 AI 代码
- **Phase 6-8**: 最终测试和文档

