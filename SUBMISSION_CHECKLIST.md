# Tu2tor MVP 提交检查清单

**学生姓名：** _________________  
**学号：** _________________  
**班级：** _________________  

**提交截止日期：** Week 12, 5th Jan 2025 Monday at 9:00 am  
**提交格式：** `YourName_StudentID_YourClass_Part2.zip`  
**例如：** `GengYue_2403880d_P02_Part2.zip`

---

## ✅ 提交前检查清单

### 📁 1. 文件结构检查

#### ✅ 必须包含的文件和文件夹：

```
Tu2tor/
├── README.md                    ✅ 项目说明文档
├── package.json                 ✅ 前端依赖配置
├── package-lock.json            ✅ 依赖锁定文件
├── index.html                   ✅ HTML入口文件
├── vite.config.js               ✅ Vite配置
├── tailwind.config.js           ✅ Tailwind配置
├── postcss.config.js            ✅ PostCSS配置
├── eslint.config.js             ✅ ESLint配置
│
├── public/                      ✅ 静态资源
│   ├── icon.png
│   ├── logo-plain.png
│   ├── logo-text.png
│   └── vite.svg
│
├── src/                         ✅ 前端源代码
│   ├── main.jsx                 ✅ React入口文件
│   ├── App.jsx                  ✅ 主应用组件
│   ├── index.css                ✅ 全局样式
│   ├── components/              ✅ React组件
│   │   ├── ai/                  ✅ AI相关组件 (7个文件)
│   │   ├── background/          ✅ 背景组件 (1个文件)
│   │   ├── booking/             ✅ 预约组件
│   │   ├── common/              ✅ 通用组件 (5个文件)
│   │   ├── dashboard/           ✅ 仪表板组件 (1个文件)
│   │   ├── layout/              ✅ 布局组件 (2个文件)
│   │   ├── notes/               ✅ 笔记组件 (4个文件)
│   │   ├── reactbits/           ✅ ReactBits UI组件 (23个文件)
│   │   ├── session/             ✅ 会话室组件 (6个文件)
│   │   ├── tutor/               ✅ 导师组件
│   │   └── ui/                  ✅ UI组件 (2个文件)
│   ├── pages/                   ✅ 页面组件
│   │   ├── Landing/             ✅ 落地页 (8个文件)
│   │   ├── Auth/                ✅ 登录/注册 (2个文件)
│   │   ├── Dashboard/           ✅ 仪表板 (1个文件)
│   │   ├── Search/              ✅ 搜索页 (1个文件)
│   │   ├── TutorDetail/         ✅ 导师详情 (1个文件)
│   │   ├── Booking/             ✅ 预约页 (1个文件)
│   │   ├── Profile/             ✅ 个人资料 (1个文件)
│   │   ├── Reviews/             ✅ 评价页 (2个文件)
│   │   ├── Sessions/            ✅ 会话页 (2个文件)
│   │   ├── Messages/            ✅ 消息页 (1个文件)
│   │   ├── Notifications/       ✅ 通知页 (1个文件)
│   │   ├── Calendar/            ✅ 日历页 (1个文件)
│   │   ├── AIChat/              ✅ AI聊天 (1个文件)
│   │   ├── StudyNotes/          ✅ 学习笔记 (1个文件)
│   │   ├── KnowledgeBase/       ✅ 知识库 (1个文件)
│   │   └── Todo/                ✅ 待办事项 (1个文件)
│   ├── context/                 ✅ React Context
│   │   ├── AuthContext.jsx      ✅ 认证上下文
│   │   ├── AppContext.jsx       ✅ 应用上下文
│   │   ├── ToastContext.jsx     ✅ Toast通知上下文
│   │   ├── VideoContext.jsx     ✅ 视频上下文
│   │   └── AIContext.jsx        ✅ AI上下文
│   ├── services/                ✅ API服务
│   │   ├── api.js               ✅ 通用API
│   │   └── aiAPI.js             ✅ AI API
│   └── utils/                   ✅ 工具函数
│       ├── constants.js         ✅ 常量
│       ├── mockData.js          ✅ 模拟数据
│       ├── rankingAlgorithm.js  ✅ 排序算法
│       └── studyNoteHelper.js   ✅ 笔记辅助函数
│
└── server/                      ✅ 后端代码
    ├── README.md                ✅ 后端说明文档
    ├── package.json             ✅ 后端依赖配置
    ├── package-lock.json        ✅ 依赖锁定文件
    └── src/                     ✅ 后端源代码
        ├── server.js            ✅ 服务器入口
        ├── config/              ✅ 配置文件 (1个文件)
        ├── models/              ✅ 数据模型 (9个文件)
        ├── controllers/         ✅ 控制器 (11个文件)
        ├── routes/              ✅ 路由 (12个文件)
        ├── middleware/          ✅ 中间件 (1个文件)
        ├── services/            ✅ 业务服务 (4个文件)
        ├── ai/                  ✅ AI服务
        │   ├── providers/       ✅ AI提供商 (3个文件)
        │   ├── services/        ✅ AI服务 (2个文件)
        │   ├── middleware/      ✅ AI中间件 (2个文件)
        │   └── utils/           ✅ AI工具 (1个文件)
        └── scripts/             ✅ 脚本 (2个文件)
```

#### ❌ 必须排除的文件和文件夹：

```
❌ node_modules/          (前端和后端都要删除)
❌ .env                    (敏感信息，不能提交)
❌ .env.local              (敏感信息，不能提交)
❌ server/.env             (敏感信息，不能提交)
❌ server/uploads/         (上传的文件，太大)
❌ dist/                   (构建输出)
❌ build/                  (构建输出)
❌ .git/                   (版本控制历史)
❌ *.log                   (日志文件)
❌ .DS_Store               (Mac系统文件)
❌ Thumbs.db               (Windows系统文件)
```

#### 📋 可选文档文件（如果包含，建议移到单独文件夹）：

```
Tu2tor/docs/ (可选)
├── API_DOCUMENTATION.md
├── RAG_SYSTEM_GUIDE.md
├── FRONTEND_EVALUATION.md
└── REACT_BASICS_EXPLANATION.md
```

---

### 📝 2. 页面组件 & 路由检查 (10%)

#### ✅ 所有页面组件是否正确实现？

- [ ] **Landing Page** - 落地页展示 (`/`)
- [ ] **Login** - 登录页面 (`/login`)
- [ ] **Register** - 注册页面 (`/register`)
- [ ] **Dashboard** - 用户仪表板 (`/dashboard`)
- [ ] **Search** - 导师搜索页 (`/search`)
- [ ] **TutorDetail** - 导师详情页 (`/tutor/:id`)
- [ ] **Booking** - 预约页面 (`/booking`)
- [ ] **Profile** - 个人资料 (`/profile`)
- [ ] **Reviews** - 评价页面 (`/reviews`)
- [ ] **Calendar** - 日历页面 (`/calendar`)
- [ ] **Messages** - 消息页面 (`/messages`)
- [ ] **Notifications** - 通知页面 (`/notifications`)
- [ ] **Sessions** - 会话列表 (`/sessions`)
- [ ] **SessionRoom** - 会话房间 (`/session/:id`)
- [ ] **AIChat** - AI聊天 (`/ai-chat`)
- [ ] **StudyNotes** - 学习笔记 (`/study-notes`)
- [ ] **KnowledgeBase** - 知识库 (`/knowledge-base`)
- [ ] **Todo** - 待办事项 (`/todo`)

#### ✅ 路由和导航是否流畅？

- [ ] React Router 配置正确
- [ ] 所有链接可点击并跳转
- [ ] 受保护路由需要登录
- [ ] 404页面处理
- [ ] 浏览器后退/前进按钮正常工作

---

### 🎨 3. UI实现检查 (5%)

#### ✅ 视觉一致性

- [ ] 使用统一的颜色方案（紫色/蓝色主题）
- [ ] 字体大小和样式一致
- [ ] 间距和对齐统一
- [ ] 图标风格一致

#### ✅ 专业外观

- [ ] 现代化设计（使用 Tailwind CSS）
- [ ] 平滑动画效果（Framer Motion / GSAP）
- [ ] ReactBits 组件集成（23个高级UI组件）
- [ ] 响应式设计（移动端/平板/桌面）
- [ ] 加载状态显示
- [ ] 错误提示美观

#### ✅ CSS框架确认

- [ ] **Tailwind CSS** - ✅ 已使用 (v4.1.16)
- [ ] 其他框架：Bootstrap / Material-UI / 纯CSS - ❌ 未使用

---

### ⚙️ 4. 状态管理检查 (5%)

#### ✅ React State、Props、Events 使用正确

##### Context API 使用
- [ ] **AuthContext** - 用户认证状态管理
- [ ] **AppContext** - 应用全局状态管理
- [ ] **ToastContext** - Toast通知管理
- [ ] **VideoContext** - 视频会话状态管理
- [ ] **AIContext** - AI助手状态管理

##### 组件状态管理
- [ ] `useState` - 本地状态管理
- [ ] `useEffect` - 副作用处理
- [ ] `useContext` - Context消费
- [ ] Props 正确传递
- [ ] 事件处理函数绑定正确

#### ✅ 组件根据用户交互正确更新

- [ ] 表单输入实时更新
- [ ] 按钮点击触发状态改变
- [ ] 列表数据动态渲染
- [ ] 条件渲染正确工作
- [ ] 页面间状态保持（如需要）

---

### ⚡ 5. 基本功能检查 (10%)

#### ✅ 核心功能是否正常工作？

##### 认证功能
- [ ] 用户注册（多步表单 Stepper）
- [ ] 用户登录
- [ ] 登出功能
- [ ] 受保护路由重定向

##### 导师搜索功能
- [ ] 多维度筛选（科目、评分、可用性）
- [ ] 动态权重排序算法
- [ ] 可解释的推荐（原因芯片）
- [ ] 搜索结果展示

##### 导师详情
- [ ] 导师信息完整展示
- [ ] 评分和评价显示
- [ ] 可用时间展示
- [ ] 预约按钮功能

##### 预约系统
- [ ] 日历可视化
- [ ] 一键预约
- [ ] 预约状态显示
- [ ] 预约列表查看

##### 评价系统
- [ ] 五星评分
- [ ] 评论提交
- [ ] 评价展示
- [ ] 标签提取（如有）

##### 积分系统
- [ ] 虚拟积分显示
- [ ] 积分交易记录
- [ ] 积分余额显示

##### 表单提交
- [ ] 注册表单提交
- [ ] 登录表单提交
- [ ] 预约表单提交
- [ ] 评价表单提交
- [ ] 表单验证（客户端）

##### 导航功能
- [ ] 顶部导航栏
- [ ] 侧边栏（如有）
- [ ] 底部导航（移动端，如有）
- [ ] 面包屑导航（如有）
- [ ] 返回按钮

#### ✅ 边界情况处理

- [ ] 空数据状态显示
- [ ] 加载状态显示（LoadingSpinner）
- [ ] 错误处理和提示（Toast）
- [ ] 网络错误处理
- [ ] 无效输入验证
- [ ] 应用不会崩溃

---

### 📦 6. 依赖和配置检查

#### ✅ package.json 完整性

##### 前端 (Tu2tor/package.json)
- [ ] 所有依赖正确列出
- [ ] 版本号固定或范围合理
- [ ] scripts 配置正确（dev, build, preview）
- [ ] 项目信息完整（name, version）

##### 后端 (Tu2tor/server/package.json)
- [ ] 所有依赖正确列出
- [ ] 版本号固定或范围合理
- [ ] scripts 配置正确（start, dev, seed）
- [ ] 项目信息完整

#### ✅ 配置文件检查

- [ ] `vite.config.js` - Vite配置正确
- [ ] `tailwind.config.js` - Tailwind配置正确
- [ ] `postcss.config.js` - PostCSS配置正确
- [ ] `eslint.config.js` - ESLint配置正确
- [ ] `server/src/config/database.js` - 数据库配置（不含敏感信息）

---

### 📖 7. README.md 文档检查

#### ✅ README.md 必须包含的内容

- [ ] **项目名称和描述** - Tu2tor是什么
- [ ] **项目信息** - 课程、学期、学生
- [ ] **核心功能** - 8个主要功能描述
- [ ] **技术栈** - MERN Stack + 其他技术
- [ ] **安装说明** - 如何安装依赖
- [ ] **环境配置** - .env 文件示例（不含真实密钥）
- [ ] **启动说明** - 如何运行前端和后端
- [ ] **项目结构** - 文件夹组织说明
- [ ] **API文档链接** - 如有单独文档
- [ ] **技术亮点** - 独特卖点
- [ ] **作者信息** - 学生姓名、课程

---

### 🔒 8. 安全和隐私检查

#### ❌ 确保没有提交敏感信息

- [ ] **没有 .env 文件**
- [ ] **没有 API密钥**（Gemini API、JWT Secret等）
- [ ] **没有数据库连接字符串**（真实的）
- [ ] **没有密码**（明文或哈希）
- [ ] **没有个人敏感信息**

#### ✅ 示例配置文件

- [ ] README中提供 .env 示例
- [ ] 示例使用占位符（如 `your-api-key-here`）
- [ ] 说明如何获取必要的API密钥

---

### 📤 9. 提交准备

#### ✅ 文件清理

1. **删除 node_modules**
   ```bash
   cd Tu2tor
   rm -rf node_modules
   cd server
   rm -rf node_modules
   ```

2. **删除构建文件**
   ```bash
   rm -rf dist
   rm -rf build
   rm -rf .vite
   ```

3. **删除上传文件**
   ```bash
   rm -rf server/uploads/knowledge-base/*
   ```

4. **删除 .env 文件**
   ```bash
   rm .env
   rm .env.local
   rm server/.env
   ```

5. **删除日志文件**
   ```bash
   rm *.log
   rm server/*.log
   ```

6. **删除系统文件**
   ```bash
   rm .DS_Store
   rm Thumbs.db
   ```

#### ✅ 压缩文件

1. 选择 `Tu2tor` 整个文件夹
2. 右键 → "压缩"或"发送到" → "压缩(zipped)文件夹"
3. 重命名为：`YourName_StudentID_YourClass_Part2.zip`
4. 例如：`GengYue_2403880d_P02_Part2.zip`

#### ✅ 文件大小检查

- [ ] 压缩文件大小 < 50MB（无 node_modules 后应该很小）
- [ ] 如果太大，检查是否有 node_modules 或 uploads

---

### 📝 10. Academic Declaration（学术声明）

#### ✅ 必须包含学术声明

根据要求，你需要在提交时包含学术声明。建议：

**选项1：在 README.md 顶部添加**
```markdown
## Academic Declaration

I declare that this submission is my own work and does not involve plagiarism or collusion.
All sources of information have been properly acknowledged.

**Student Name:** [Your Name]
**Student ID:** [Your ID]
**Class:** [Your Class]
**Date:** [Submission Date]
```

**选项2：创建单独的 ACADEMIC_DECLARATION.md 文件**

- [ ] 学术声明已添加
- [ ] 学生信息完整
- [ ] 日期正确

---

### ✅ 11. 最终测试

#### ✅ 解压测试

1. 解压你的 zip 文件到新文件夹
2. 安装依赖：
   ```bash
   cd Tu2tor
   npm install
   cd server
   npm install
   ```
3. 配置 .env 文件（测试用）
4. 启动应用：
   ```bash
   npm run dev  # 或分别启动前后端
   ```
5. 测试所有功能是否正常

#### ✅ 跨浏览器测试（可选但推荐）

- [ ] Chrome
- [ ] Firefox
- [ ] Edge
- [ ] Safari（Mac用户）

---

### 📋 12. 提交清单总结

| 项目 | 状态 | 备注 |
|------|------|------|
| README.md 完整 | ⬜ | |
| 所有页面组件实现 | ⬜ | 18个页面 |
| 路由导航正常 | ⬜ | |
| UI视觉一致 | ⬜ | Tailwind CSS |
| 状态管理正确 | ⬜ | Context API + useState |
| 核心功能工作 | ⬜ | 认证、搜索、预约、评价 |
| 边界情况处理 | ⬜ | 加载、错误、空数据 |
| package.json 完整 | ⬜ | 前后端 |
| 配置文件正确 | ⬜ | vite, tailwind, eslint |
| 无敏感信息 | ⬜ | 无 .env, API密钥 |
| node_modules 删除 | ⬜ | 前后端 |
| 文件命名正确 | ⬜ | Name_ID_Class_Part2.zip |
| Academic Declaration | ⬜ | 学术声明 |
| 压缩文件大小合理 | ⬜ | < 50MB |
| 解压测试通过 | ⬜ | 可以运行 |

---

### 🚀 13. 提交步骤

1. ✅ 完成所有上述检查项
2. ✅ 压缩 `Tu2tor` 文件夹
3. ✅ 重命名为正确格式
4. ✅ 登录 LMS
5. ✅ 找到 Assessment folder
6. ✅ 上传 zip 文件
7. ✅ 确认上传成功
8. ✅ 保留本地备份

---

### 📅 重要日期

**提交截止日期：** Week 12, 5th Jan 2025 Monday at 9:00 am

⚠️ **建议提前提交，避免最后一刻出现技术问题！**

---

### 💡 常见问题

**Q: node_modules 太大，怎么删除？**
```bash
# Windows PowerShell
Remove-Item -Recurse -Force .\Tu2tor\node_modules
Remove-Item -Recurse -Force .\Tu2tor\server\node_modules

# Mac/Linux
rm -rf Tu2tor/node_modules
rm -rf Tu2tor/server/node_modules
```

**Q: 如何确认文件大小？**
- 右键 zip 文件 → "属性" → 查看大小

**Q: 评分老师能运行我的项目吗？**
- 可以，但需要他们：
  1. npm install 安装依赖
  2. 配置 .env 文件（使用自己的API密钥）
  3. 启动 MongoDB
  4. npm run dev 启动应用

**Q: README中需要说明数据库设置吗？**
- 是的，需要说明：
  - MongoDB 连接字符串格式
  - 如何seed数据库（如有）
  - 默认用户账号（如有）

**Q: 可以包含额外的文档吗？**
- 可以，但不是必须的
- 建议放在 `docs/` 文件夹
- 不要放太多不相关的文档

---

### ✅ 检查完成确认

**我已完成所有检查项：** ___________（签名）

**检查日期：** ___________

**压缩文件名：** ___________

**文件大小：** ___________ MB

**准备提交：** [ ] 是  [ ] 否

---

## 🎉 祝你提交顺利！Good Luck! 🚀

---

**提示：** 保存此检查清单，可以多次检查确保没有遗漏！

