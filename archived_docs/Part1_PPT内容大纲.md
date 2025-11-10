# Part 1: Tu2tor项目PPT演示文稿

## 📊 PPT结构概览

**项目名称:** Tu2tor - Campus Peer Tutoring Platform
**总页数:** 18-22页
**演示时长:** 10-15分钟
**命名格式:** `你的姓名_学号_班级_Part1.pptx`

---

## 📑 幻灯片详细内容

### 幻灯片 1: 封面页

```
┌─────────────────────────────────────┐
│                                     │
│   Full Stack Web Development        │
│        Project Proposal             │
│                                     │
│        Tu2tor Platform              │
│   Campus Peer Tutoring System       │
│                                     │
│   🎓 Connecting Students for        │
│      Better Learning                │
│                                     │
│   你的姓名                           │
│   学号: 你的学号                     │
│   班级: 你的班级                     │
│                                     │
│   Temasek Polytechnic               │
│   November 2024                     │
└─────────────────────────────────────┘
```

**设计建议:**
- 使用Tu2tor的配色：Primary Blue (#6366f1) + Purple gradient
- 添加TP logo
- 使用教育相关图标（书本、学生、连接）

---

### 幻灯片 2: 学术诚信声明

```
学术诚信声明
Declaration of Academic Integrity

本项目声明:
☑ 这是我的原创作品
☑ 所有参考资料已适当引用
☑ 我理解学术诚信的重要性
☑ 我使用了AI工具辅助开发（已记录）

AI工具使用:
• OpenAI o1-preview - 智能推荐系统
• Claude Sonnet - 代码生成与调试辅助
• GitHub Copilot - 代码补全

签名: _______________
日期: 2024年11月
```

---

### 幻灯片 3: 目录

```
目录
Table of Contents

1. 场景分析与问题识别 .................... 4
2. 项目目标 ............................... 8
3. 解决方案与功能 ........................ 10
4. 系统架构 ............................... 14
5. 数据模型设计 .......................... 16
6. 项目规划 ............................... 20
```

---

## 第一部分：场景分析与问题识别

### 幻灯片 4: 场景概述

```
场景概述
Scenario Overview

📚 What is Tu2tor?
校园同伴导师匹配平台，专为TP学生设计

👥 Who are the users?
• Primary: Students (寻求帮助) & Student Tutors (提供辅导)
• Secondary: School Administration

🎯 What is the goal?
• Students: 快速找到合适的导师，提高学习效率
• Tutors: 展示专业技能，建立声誉，获得认可
• School: 促进学生互助文化，提高整体学习质量

📊 Current Situation:
传统方式依赖朋友推荐、WhatsApp群组、布告栏
→ 效率低、信息不对称、质量无保障
```

**设计建议:**
- 使用图标代表不同用户群体
- 添加TP校园场景图片
- 使用对比图展示现状vs理想状态

---

### 幻灯片 5: 关键问题 #1 - 发现困难

```
关键问题 #1: Difficulty Finding Qualified Tutors
发现困难 - 找不到合适的导师

❌ Problem:
学生很难找到擅长特定科目、时间匹配、且评价良好的导师

📉 Why it matters:
• 信息不对称 - 不知道谁可以提供帮助
• 时间浪费 - 需要大量时间询问和联系
• 质量不确定 - 无法事先了解导师能力

👤 Who is affected:
• Students - 找不到帮助，错过学习机会
• Tutors - 优秀学生无法有效推广服务
• School - 学习资源未被充分利用

💡 Customer Need:
"As a student struggling with WEB201,
I want to quickly find experienced tutors available this week,
So that I can get help before my exam."
```

**设计建议:**
- 使用🔍图标
- 添加场景插图（学生困惑地寻找导师）
- 用户故事使用引号框突出显示

---

### 幻灯片 6: 关键问题 #2 - 预订混乱

```
关键问题 #2: Lack of Booking System
预订混乱 - 缺乏统一的预订系统

❌ Problem:
通过WhatsApp/Email预订容易遗漏、时间冲突、沟通误解

📉 Why it matters:
• 预订混乱 - 没有中央化管理
• 时间冲突 - 导师可能双重预订
• 缺乏记录 - 无历史记录可查
• 支付不明 - 学分交易不透明

👤 Who is affected:
• Students - 不确定预订是否成功
• Tutors - 难以管理多个预订
• Both - 沟通成本高，效率低

💡 Customer Need:
"As a tutor,
I want a centralized booking system showing all appointments,
So that I can avoid double-booking and manage efficiently."
```

---

### 幻灯片 7: 关键问题 #3 - 质量保障缺失

```
关键问题 #3: No Quality Assurance
质量保障缺失 - 无法判断导师水平

❌ Problem:
选择导师前无法了解教学质量，缺乏评价系统

📉 Why it matters:
• 信任问题 - 不知道导师是否靠谱
• 质量参差 - 没有激励优质服务
• 无法改进 - 导师得不到反馈

👤 Who is affected:
• Students - 可能浪费时间和学分
• Good Tutors - 无法展示优势
• Poor Tutors - 得不到改进建议

💡 Customer Need:
"As a student,
I want to see reviews and ratings from previous students,
So that I can make informed decisions."
```

---

### 幻灯片 8: 关键问题 #4 & #5

```
其他关键问题
Additional Key Problems

🎥 Problem #4: Inefficient Session Management
会议管理低效

• 线上/线下混合模式缺乏集成工具
• 需要在多个平台切换（Zoom, Teams, WhatsApp）
• 视频链接容易丢失

💡 Need: "一键加入视频会议，无需切换平台"

🤖 Problem #5: No Personalization
缺乏个性化推荐

• 需要手动浏览大量导师信息
• 没有智能推荐系统
• 选择疲劳，效率低下

💡 Need: "基于历史和需求的AI智能推荐"
```

---

## 第二部分：项目目标

### 幻灯片 9: 项目目标与价值主张

```
项目目标与独特价值
Project Objectives & Value Proposition

🎯 Primary Objective:
连接需要帮助的学生与愿意分享知识的同龄导师，
创建便捷、可信、高效的点对点学习平台

✨ Unique Value Propositions:

1. 🔍 Smart Discovery
   • AI驱动的导师推荐
   • 多维度筛选（科目、评分、价格、时间）
   • 实时可用性显示

2. 📅 Seamless Booking
   • 统一预订管理系统
   • 自动时间冲突检测
   • 学分自动结算

3. ⭐ Trust & Quality
   • 完整评价系统
   • 身份验证（TP学生专属）
   • 徽章与认证体系

4. 🎥 Integrated Video
   • 内置Jitsi视频会议
   • 小窗化多任务支持
   • 会议历史记录
```

---

### 幻灯片 10: 目标用户画像

```
目标用户画像
Target User Personas

👨‍🎓 Student (Tutee)
Name: Alice, Year 1 IT Student
Needs:
• 找WEB201的导师准备考试
• 查看导师评价和专业度
• 方便预订和在线学习
Goals:
• 提高成绩 (C → B)
• 理解难懂的概念
• 高效利用时间
Pain Points:
• 不知道找谁
• 担心浪费学分
• 时间协调困难

👨‍🏫 Student Tutor
Name: Henry, Year 3 IT Student
Needs:
• 展示编程技能
• 灵活管理辅导时间
• 获得收入和认可
Goals:
• 帮助学弟学妹
• 巩固自己的知识
• 建立个人品牌
Pain Points:
• 难以找到学生
• 预订管理混乱
• 缺乏成就感
```

**设计建议:**
- 使用persona卡片
- 添加用户照片或图标
- 颜色区分两类用户

---

## 第三部分：解决方案与功能

### 幻灯片 11: 功能概览

```
Tu2tor功能概览
Feature Overview

🏗️ Architecture:
Frontend: React.js + Tailwind CSS
Backend: Node.js + Express.js + MongoDB
Video: Jitsi Meet Integration
AI: OpenAI o1-preview

📦 8 Core Modules:

1. 🔐 Authentication & Authorization
2. 👤 User Profile Management
3. 🔍 Search & Filter System
4. 📅 Booking Management
5. 🎥 Video Session System
6. ⭐ Review & Rating System
7. 🤖 AI Recommendation Engine
8. 💬 Messaging System
```

---

### 幻灯片 12: 核心功能详解 (1/2)

```
核心功能详解 Part 1
Core Features - Part 1

1️⃣ Smart Search & Filter
   ✓ 按科目、价格、评分、时间筛选
   ✓ AI优先级滑块（评分优先 vs 时间优先）
   ✓ 实时搜索结果
   ✓ 高级筛选：经验值、响应时间

2️⃣ Tutor Profile System
   ✓ 完整个人资料（头像、简介、技能）
   ✓ 评分与徽章展示
   ✓ 可用时间日历
   ✓ 学生评价列表
   ✓ 完成课程统计

3️⃣ Booking Management
   ✓ 选择日期、时间、时长、地点
   ✓ 在线/离线模式选择
   ✓ 状态流转：Pending → Confirmed → Completed
   ✓ 学分自动计算与扣除
   ✓ 预订历史记录

4️⃣ Video Session Integration
   ✓ Jitsi Meet内嵌视频
   ✓ 一键加入会议
   ✓ 小窗化浮动窗口（可拖动）
   ✓ 会议内notes记录
   ✓ Active/Upcoming/Completed分类
```

---

### 幻灯片 13: 核心功能详解 (2/2)

```
核心功能详解 Part 2
Core Features - Part 2

5️⃣ Review & Rating System
   ✓ 5星评分系统
   ✓ 文字评论（10-1000字）
   ✓ 标签选择（Clear, Patient, Knowledgeable）
   ✓ 匿名评价选项
   ✓ 导师回复功能
   ✓ 有用投票（helpful count）

6️⃣ AI Recommendation Engine
   ✓ OpenAI o1-preview驱动
   ✓ 多轮对话支持
   ✓ 基于学习历史的个性化推荐
   ✓ 代码语法高亮显示
   ✓ 保存聊天历史

7️⃣ Credits & Badges System
   ✓ 积分系统（完成辅导获得积分）
   ✓ 徽章体系（Newbie, Expert, Top Tutor等）
   ✓ 排行榜功能
   ✓ 游戏化激励

8️⃣ Dashboard & Analytics
   ✓ 个人统计数据可视化
   ✓ 活动日历
   ✓ 快速操作入口
   ✓ 通知中心
```

---

### 幻灯片 14: 系统架构

```
系统架构
System Architecture

┌─────────────────────────────────────┐
│         Frontend (React)            │
│  ┌──────────┬──────────┬─────────┐ │
│  │ Pages    │Components│ Context │ │
│  │• Search  │• Modal   │• Auth   │ │
│  │• Session │• Video   │• App    │ │
│  │• Review  │• Calendar│• AI     │ │
│  └──────────┴──────────┴─────────┘ │
└─────────────────────────────────────┘
              ↓ Axios API
┌─────────────────────────────────────┐
│      Backend (Node.js + Express)    │
│  ┌──────────────────────────────┐  │
│  │  REST API Routes             │  │
│  │  • /auth  • /bookings        │  │
│  │  • /tutors • /reviews        │  │
│  │  • /ai                       │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
              ↓ Mongoose ODM
┌─────────────────────────────────────┐
│       Database (MongoDB)            │
│  • Users    • Bookings             │
│  • Tutors   • Reviews              │
│  • Subjects                        │
└─────────────────────────────────────┘

External Services:
• Jitsi Meet (meet.jit.si) - Video
• OpenAI API - AI Recommendations
```

---

## 第四部分：数据模型设计

### 幻灯片 15: 数据模型概览

```
数据模型概览
Data Models Overview

🗄️ 6 Core Models:

1. User - 用户基础信息
2. Tutor - 导师详细档案
3. Booking - 预订记录
4. Review - 评价数据
5. Subject - 科目信息
6. Message - 消息记录（Future）

🔗 Relationships:
User 1:1 Tutor
User 1:M Booking (as student/tutor)
Booking 1:1 Review
Subject 1:M Booking
```

---

### 幻灯片 16: User & Tutor Models

```
User & Tutor 数据模型
User & Tutor Models

📊 User Model:
{
  _id: ObjectId,
  username: String (required),
  email: String (unique, required),
  password: String (hashed),
  role: [String], // ['student', 'tutor']
  school: String,
  major: String,
  yearOfStudy: Number,
  credits: Number (default: 500),
  badges: [String],
  profileCompletion: Number,
  createdAt: Date
}

用途: 身份验证、权限管理、基础信息存储

📊 Tutor Model:
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  bio: String (maxlength: 500),
  subjects: [String],
  hourlyRate: Number,
  availableSlots: [{
    day: String,
    startTime: String,
    endTime: String
  }],
  preferredLocations: [String],
  totalSessions: Number,
  completedSessions: Number,
  averageRating: Number,
  totalReviews: Number,
  isAvailable: Boolean
}

用途: 导师档案管理、搜索匹配、评分统计
```

---

### 幻灯片 17: Booking & Review Models

```
Booking & Review 数据模型
Booking & Review Models

📊 Booking Model:
{
  _id: ObjectId,
  studentId: ObjectId (ref: User),
  tutorId: ObjectId (ref: Tutor),
  subject: String,
  date: Date,
  timeSlot: String, // "14:00-15:00"
  duration: Number, // hours
  location: String,
  sessionType: String, // 'online' | 'offline'
  meetingRoomId: String, // for Jitsi
  status: String, // 'pending' | 'confirmed' | 'completed'
  cost: Number,
  notes: String,
  hasReview: Boolean,
  createdAt: Date
}

状态流转: pending → confirmed → completed

📊 Review Model:
{
  _id: ObjectId,
  bookingId: ObjectId (ref: Booking),
  tutorId: ObjectId (ref: User),
  studentId: ObjectId (ref: User),
  rating: Number (1-5, required),
  comment: String (10-1000 chars),
  tags: [String], // ['Clear', 'Patient', ...]
  isAnonymous: Boolean,
  isVerified: Boolean,
  helpfulCount: Number,
  tutorResponse: String,
  createdAt: Date
}

业务规则:
• 每个booking只能评价一次
• 只有completed状态的booking可以评价
• 评价后自动更新tutor的averageRating
```

---

### 幻灯片 18: 数据示例

```
完整数据示例
Sample Data Example

👤 Complete Tutor Profile:

User:
{
  "username": "henry_tutor",
  "email": "henry@tp.edu.sg",
  "role": ["student", "tutor"],
  "credits": 450,
  "badges": ["expert", "top-tutor"],
  "profileCompletion": 95
}

Tutor:
{
  "bio": "Year 3 IT student, passionate about web dev",
  "subjects": ["WEB201", "JavaScript", "React"],
  "hourlyRate": 35,
  "completedSessions": 48,
  "averageRating": 4.8,
  "totalReviews": 32,
  "availableSlots": [
    {"day": "Monday", "startTime": "14:00", "endTime": "18:00"},
    {"day": "Wednesday", "startTime": "10:00", "endTime": "16:00"}
  ]
}

Booking:
{
  "subject": "WEB201",
  "date": "2024-11-20T14:00:00Z",
  "duration": 1.5,
  "sessionType": "online",
  "status": "confirmed",
  "cost": 52.5 // 35 * 1.5
}
```

---

## 第五部分：实现亮点与规划

### 幻灯片 19: 技术亮点

```
技术实现亮点
Technical Highlights

🎨 Frontend Excellence:
✓ React + React Router - SPA体验
✓ Tailwind CSS - 响应式设计
✓ Context API - 全局状态管理
✓ Axios Interceptors - 统一请求处理

🔧 Backend Robustness:
✓ JWT Authentication - 安全的用户认证
✓ Mongoose Middleware - 自动更新评分
✓ Input Validation - 数据完整性保障
✓ Error Handling - 统一错误处理

🎥 Video Innovation:
✓ Jitsi Meet集成 - 免服务器配置
✓ 浮动小窗口 - 可拖动，多任务支持
✓ 自动会议室ID - 唯一标识生成
✓ 时间窗口验证 - ±15分钟弹性加入

🤖 AI Integration:
✓ OpenAI o1-preview - 智能推荐
✓ 多轮对话 - 上下文理解
✓ 代码高亮 - 技术问答支持
✓ 历史记录 - 可追溯对话
```

---

### 幻灯片 20: 项目规划与里程碑

```
项目规划与里程碑
Project Timeline & Milestones

📅 Phase 1: Foundation (Week 1-3) ✅
✓ 项目规划与需求分析
✓ 数据模型设计
✓ 技术栈选型
✓ 开发环境搭建

📅 Phase 2: Core Development (Week 4-8) ✅
✓ 用户认证系统
✓ 导师搜索与筛选
✓ 预订管理系统
✓ 个人资料页面

📅 Phase 3: Advanced Features (Week 9-12) ✅
✓ 视频会议集成
✓ 评价系统
✓ AI推荐引擎
✓ 浮动视频窗口

📅 Phase 4: Polish & Deploy (Week 13-16)
○ 性能优化
○ 用户测试
○ Bug修复
○ 部署上线

🚀 Current Status: 90% Complete
```

---

### 幻灯片 21: 功能完成度

```
功能完成度
Feature Completion Status

✅ Completed Features:
1. ✅ Authentication & User Management - 100%
2. ✅ Tutor Search & Advanced Filters - 100%
3. ✅ Booking System - 100%
4. ✅ Video Session (Jitsi Integration) - 100%
5. ✅ Floating Video Window - 100%
6. ✅ Review & Rating System - 100%
7. ✅ AI Recommendations - 100%
8. ✅ Dashboard with Charts - 100%

🔄 In Progress:
9. ⚙️ Messaging System - 30%
10. ⚙️ Notification System - 50%

📋 Future Enhancements:
• Mobile App (React Native)
• Real-time Chat (Socket.io)
• Payment Integration
• Advanced Analytics Dashboard
• Multi-language Support
```

---

### 幻灯片 22: 总结与展望

```
总结与展望
Summary & Future Vision

✅ What We Achieved:
• 完整的端到端解决方案
• 解决5个关键用户痛点
• 8个核心功能模块
• 现代化技术栈
• 优秀的用户体验

📊 Impact:
• 提高学习效率 - 快速找到合适导师
• 促进互助文化 - 鼓励知识分享
• 增强社区归属 - 建立学习社交网络
• 提供数据洞察 - 帮助学校了解学习需求

🚀 Future Vision:
• 扩展到更多学校
• 支持小组辅导
• 集成课程资源库
• 职业指导功能
• 校友导师网络

🎯 Key Takeaway:
Tu2tor不仅是一个预订平台，
更是一个促进peer learning的社区生态系统。
```

---

### 幻灯片 23: Q&A

```
Thank You!
感谢聆听

Questions & Answers
问题与解答

📧 Contact:
Email: your.email@tp.edu.sg
GitHub: github.com/yourusername/tu2tor

🔗 Demo:
Live Demo: tu2tor.vercel.app (if deployed)
Code: github.com/yourusername/tu2tor

💬 Open for Questions
```

---

## 🎨 PPT设计指南

### 配色方案 (基于Tu2tor实际UI):
```css
Primary: #6366f1 (Indigo)
Secondary: #8b5cf6 (Purple)
Success: #10b981 (Green)
Warning: #f59e0b (Amber)
Error: #ef4444 (Red)
Background: #f9fafb (Gray-50)
Text: #111827 (Gray-900)
```

### 字体建议:
- 标题: **Inter Bold** 或 **Microsoft YaHei Bold** (28-36pt)
- 正文: Inter Regular / Microsoft YaHei (16-20pt)
- 代码: Consolas / Fira Code (14-16pt)

### 布局原则:
- 每页1个主题
- 6-7个bullet points最多
- 充足留白
- 一致的页眉页脚

### 视觉元素:
- 图标: Lucide React icons (项目中使用的)
- 图表: Recharts (与实际项目一致)
- 截图: 实际项目界面截图
- 流程图: 使用mermaid或draw.io

---

## ✅ 提交检查清单

- [ ] 封面页包含所有信息
- [ ] 学术诚信声明完整
- [ ] AI工具使用有记录
- [ ] 至少3个关键问题 (实际5个)
- [ ] 项目目标清晰
- [ ] 8个功能详细说明
- [ ] 6个数据模型完整
- [ ] 包含系统架构图
- [ ] 添加实际项目截图
- [ ] 文件命名正确
- [ ] 无拼写错误
- [ ] 整体风格专业一致

---

## 📦 提交信息

**文件名格式:** `姓名_学号_班级_Part1.pptx`
**提交平台:** LMS
**截止日期:** Week 5, 2024年11月17日 9:00 AM

---

**PPT内容准备完毕！** 🎉
根据这个大纲制作PPT，突出Tu2tor的完整功能和技术实现！
