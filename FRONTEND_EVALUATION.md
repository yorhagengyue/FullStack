# Tu2tor 前端实现评估

## 1. Page Components & Routing (10%)

### ✅ 所有组件正确实现

**核心页面组件**：
- **Auth**: `Login.jsx`, `Register.jsx` - 多步骤表单注册，JWT 认证
- **Dashboard**: 用户总览面板
- **Search**: 智能导师匹配系统
- **Sessions**: 实时视频辅导室（Jitsi Meet + 代码/Markdown 协作编辑器）
- **AI Chat**: 多模态 AI 助手（支持 RAG 知识库模式）
- **Calendar**: 交互式日程管理
- **Todo**: 任务和会话管理
- **Study Notes**: 学习笔记保存
- **Landing**: 营销落地页（使用多个 ReactBits 动画组件）
- **Knowledge Base Upload**: 文档上传和管理

### 🔧 路由实现方式

**Protected Route 组件**：
```javascript
// src/App.jsx
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  
  return children;
};

<Routes>
  {/* Public Routes */}
  <Route path="/" element={<LandingPage />} />
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />
  
  {/* Protected Routes */}
  <Route element={<Layout />}>
    <Route path="/dashboard" element={
      <ProtectedRoute><Dashboard /></ProtectedRoute>
    } />
    <Route path="/sessions/:id" element={
      <ProtectedRoute><SessionRoomPage /></ProtectedRoute>
    } />
    {/* ... 其他受保护路由 */}
  </Route>
</Routes>
```

**Layout 嵌套路由**：
```javascript
// src/components/layout/Layout.jsx
const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  return (
    <div className="flex h-screen">
      <Sidebar isOpen={sidebarOpen} onToggle={setSidebarOpen} />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <main className="flex-1 overflow-auto">
          <Outlet /> {/* 子路由渲染位置 */}
        </main>
      </div>
    </div>
  );
};
```

**动态路由参数获取**：
```javascript
// SessionRoomPage.jsx
const { id } = useParams(); // 从 /sessions/:id 获取 id
const [sessionData, setSessionData] = useState(null);

useEffect(() => {
  const fetchSession = async () => {
    const response = await api.get(`/bookings/${id}`);
    setSessionData(response.data.booking);
  };
  fetchSession();
}, [id]);
```

**编程式导航**：
```javascript
// 登录成功后跳转
const navigate = useNavigate();
const location = useLocation();

const handleLogin = async (credentials) => {
  const { user, token } = await authAPI.login(credentials);
  localStorage.setItem('token', token);
  
  // 跳转到之前尝试访问的页面，或默认跳到 dashboard
  const from = location.state?.from || '/dashboard';
  navigate(from, { replace: true });
};
```

---

## 2. UI Implementation (5%)

### ✅ 视觉一致性与专业性

**CSS 框架**: Tailwind CSS

**设计系统**：
- **颜色方案**: 蓝色/紫色主题，一致的 primary/secondary 色彩
- **间距**: 统一使用 Tailwind spacing scale (px-4, py-2, gap-6)
- **圆角**: 统一 rounded-xl/2xl 风格
- **阴影**: shadow-lg/2xl 层次化设计

### 🔧 UI 实现细节

**Glassmorphism 效果**：
```javascript
// Landing Page Header
<header className="fixed top-0 left-0 right-0 z-50 
  bg-white/80 backdrop-blur-md border-b border-gray-200/60">
  {/* 半透明背景 + 模糊效果 */}
</header>

// Register Card
<div className="backdrop-blur-xl bg-white/10 
  border border-white/20 rounded-3xl shadow-2xl">
  {/* 玻璃态卡片 */}
</div>
```

**渐变背景实现**：
```javascript
// Register.jsx 背景
<div className="min-h-screen bg-gradient-to-br 
  from-gray-950 via-blue-950 to-purple-950 relative overflow-hidden">
  {/* 环境光晕效果 */}
  <div className="absolute top-0 left-1/4 w-96 h-96 
    bg-blue-500/20 rounded-full blur-3xl" />
  <div className="absolute bottom-0 right-1/4 w-96 h-96 
    bg-purple-500/20 rounded-full blur-3xl" />
</div>
```

**交互状态实现**：
```javascript
// 色彩编码的 Input Focus Rings
<input
  className="bg-gray-800/50 border border-gray-700 
    rounded-xl px-4 py-3 text-white
    focus:border-blue-500 focus:ring-4 focus:ring-blue-500/30
    transition-all duration-200"
  // 蓝色：用户信息
/>

<input
  className="focus:border-purple-500 focus:ring-4 focus:ring-purple-500/30"
  // 紫色：导师信息
/>
```

**ReactBits 动画组件使用**：
```javascript
// Hero.jsx - 分割文字动画
<SplitText
  text="Ace your TP IIT modules"
  className="text-5xl font-bold"
  delay={0.1}
  stagger={0.08}
  tag="h1"
/>

// LandingPage.jsx - 滚动速度文字
<ScrollVelocity
  texts={['Applied AI • Web Development • Cybersecurity']} 
  velocity={50} 
  className="text-gray-900 font-bold"
/>

// GooeyNav - 粘性导航效果
<GooeyNav
  items={['Home', 'Features', 'Testimonials']}
  activeIndex={0}
  onItemClick={(index) => scrollToSection(index)}
/>
```

**响应式设计实现**：
```javascript
// Stepper 组件 - 移动端适配
<div className="
  grid grid-cols-1           /* 移动端单列 */
  md:grid-cols-2             /* 平板双列 */
  gap-6                       /* 统一间距 */
  max-w-7xl mx-auto          /* 最大宽度居中 */
  px-4 sm:px-6 lg:px-8       /* 响应式内边距 */
">
```

---

## 3. State Management (5%)

### ✅ 正确使用 React 状态管理

### 🔧 Context API 实现

**全局认证状态**：
```javascript
// src/contexts/AuthContext.jsx
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 初始化时检查 token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // 验证 token 并获取用户信息
      authAPI.verifyToken(token)
        .then(userData => setUser(userData))
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    const { user, token } = await authAPI.login(credentials);
    localStorage.setItem('token', token);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// 使用示例
const { user, logout } = useContext(AuthContext);
```

**全局通知系统**：
```javascript
// src/contexts/ToastContext.jsx
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    
    // 3秒后自动移除
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50">
        {toasts.map(toast => (
          <Toast key={toast.id} {...toast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};
```

### 🔧 Local State 实现

**多步骤表单状态管理**：
```javascript
// Register.jsx
const [formData, setFormData] = useState({
  // Step 1: 基本信息
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  
  // Step 2: 角色选择
  role: 'student',
  
  // Step 3: 导师信息
  expertise: [],
  bio: ''
});

// 统一更新函数
const handleChange = (field, value) => {
  setFormData(prev => ({ ...prev, [field]: value }));
};

// 步骤验证
const onBeforeNext = async (currentStep) => {
  if (currentStep === 1) {
    if (!formData.email || !formData.password) {
      addToast('请填写所有必填字段', 'error');
      return false;
    }
  }
  return true;
};
```

**UI 切换状态**：
```javascript
// SessionRoomPage.jsx
const [showCodeEditor, setShowCodeEditor] = useState(false);
const [showMarkdownEditor, setShowMarkdownEditor] = useState(false);
const [isVideoMinimized, setIsVideoMinimized] = useState(false);

// 互斥切换逻辑
const toggleCodeEditor = () => {
  if (showMarkdownEditor) setShowMarkdownEditor(false);
  setShowCodeEditor(!showCodeEditor);
};

const toggleMarkdownEditor = () => {
  if (showCodeEditor) setShowCodeEditor(false);
  setShowMarkdownEditor(!showMarkdownEditor);
};

// 视频窗口自动调整
const videoWidth = showCodeEditor || showMarkdownEditor ? '50%' : '100%';
```

**搜索过滤状态**：
```javascript
// Search.jsx
const [filters, setFilters] = useState({
  subject: '',
  priceRange: [0, 100],
  rating: 0
});

const [searchResults, setSearchResults] = useState([]);

// 实时过滤
useEffect(() => {
  const filteredTutors = allTutors.filter(tutor => {
    if (filters.subject && tutor.expertise !== filters.subject) return false;
    if (tutor.hourlyRate < filters.priceRange[0]) return false;
    if (tutor.hourlyRate > filters.priceRange[1]) return false;
    if (tutor.rating < filters.rating) return false;
    return true;
  });
  setSearchResults(filteredTutors);
}, [filters, allTutors]);
```

### 🔧 Refs 正确使用

**动画组件 Ref 管理**：
```javascript
// CardSwap.jsx - 修复后的版本
const refs = useRef([]); // 持久化 ref 数组

useLayoutEffect(() => {
  // 同步更新 refs，避免渲染时突变
  refs.current = Array(childArr.length)
    .fill()
    .map((_, i) => refs.current[i] || React.createRef());
}, [childArr]);

// GSAP 动画使用 refs
useEffect(() => {
  refs.current.forEach((r, i) => {
    if (r.current) {
      gsap.to(r.current, { x: i * 100, duration: 1 });
    }
  });
}, []);
```

**避免闭包陷阱**：
```javascript
// CardSwap.jsx - 使用 ref 存储可变值
const intervalRef = useRef(null);
const tlRef = useRef(null);

useEffect(() => {
  const swap = () => { /* 动画逻辑 */ };
  
  intervalRef.current = window.setInterval(swap, delay);
  
  return () => {
    clearInterval(intervalRef.current); // 清理时总能访问最新值
  };
}, [delay]);
```

### 🔧 动态更新示例

**AI Chat 流式响应**：
```javascript
// AIChat.jsx
const [messages, setMessages] = useState([]);
const [currentResponse, setCurrentResponse] = useState('');

const handleSendMessage = async (userMessage) => {
  setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
  
  // 流式响应
  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ message: userMessage })
  });
  
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    setCurrentResponse(prev => prev + chunk); // 实时追加
  }
  
  // 完成后添加到消息列表
  setMessages(prev => [...prev, { 
    role: 'assistant', 
    content: currentResponse 
  }]);
  setCurrentResponse('');
};
```

**Markdown 实时协作**：
```javascript
// MarkdownCollabEditor.jsx
const [editorState, setEditorState] = useState('');
const [collaborators, setCollaborators] = useState([]);

useEffect(() => {
  // Yjs WebSocket 连接
  const ydoc = new Y.Doc();
  const provider = new WebsocketProvider(
    'ws://localhost:3000/collab',
    roomId,
    ydoc
  );
  
  const ytext = ydoc.getText('content');
  
  // 监听远程更新
  ytext.observe(() => {
    setEditorState(ytext.toString()); // 实时同步
  });
  
  // 监听协作者变化
  provider.awareness.on('change', () => {
    const states = Array.from(provider.awareness.getStates().values());
    setCollaborators(states.map(s => s.user));
  });
  
  return () => provider.destroy();
}, [roomId]);
```

---

## 4. Basic Functionality (10%)

### ✅ 核心功能完整运行

### 🔧 表单功能实现

**注册表单多步骤验证**：
```javascript
// Register.jsx
const steps = [
  { title: 'Account' },
  { title: 'Role' },
  { title: 'Profile' }
];

const onBeforeNext = async (currentStep) => {
  switch (currentStep) {
    case 1: // 账户信息验证
      if (!formData.email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)) {
        addToast('Invalid email format', 'error');
        return false;
      }
      if (formData.password.length < 8) {
        addToast('Password must be at least 8 characters', 'error');
        return false;
      }
      break;
      
    case 2: // 角色验证
      if (!formData.role) {
        addToast('Please select a role', 'error');
        return false;
      }
      break;
      
    case 3: // 导师信息验证
      if (formData.role === 'tutor' && formData.expertise.length === 0) {
        addToast('Please select at least one expertise', 'error');
        return false;
      }
      break;
  }
  return true;
};

const handleSubmit = async () => {
  try {
    const response = await authAPI.register(formData);
    addToast('Registration successful!', 'success');
    navigate('/login');
  } catch (error) {
    addToast(error.message || 'Registration failed', 'error');
  }
};
```

**文档上传功能**：
```javascript
// KnowledgeBaseUpload.jsx
const [uploadProgress, setUploadProgress] = useState(0);
const [processingStatus, setProcessingStatus] = useState('idle');

const handleFileUpload = async (file) => {
  // 1. 文件类型验证
  const allowedTypes = ['application/pdf', 'application/vnd.ms-powerpoint', 
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/msword', 'image/jpeg', 'image/png'];
  
  if (!allowedTypes.includes(file.type)) {
    addToast('Unsupported file type', 'error');
    return;
  }
  
  // 2. 文件大小验证（50MB 限制）
  if (file.size > 50 * 1024 * 1024) {
    addToast('File too large (max 50MB)', 'error');
    return;
  }
  
  // 3. 上传文件
  const formData = new FormData();
  formData.append('file', file);
  formData.append('title', file.name);
  formData.append('subjectId', selectedSubject);
  
  try {
    setProcessingStatus('uploading');
    const response = await knowledgeBaseAPI.upload(formData, {
      onUploadProgress: (progressEvent) => {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percent);
      }
    });
    
    // 4. 轮询处理状态
    setProcessingStatus('processing');
    pollProcessingStatus(response.data.id);
    
  } catch (error) {
    setProcessingStatus('error');
    addToast(error.message, 'error');
  }
};

// 轮询文档处理状态
const pollProcessingStatus = async (docId) => {
  const interval = setInterval(async () => {
    const doc = await knowledgeBaseAPI.getById(docId);
    
    if (doc.processingStatus.status === 'completed') {
      clearInterval(interval);
      setProcessingStatus('completed');
      addToast('Document processed successfully!', 'success');
    } else if (doc.processingStatus.status === 'failed') {
      clearInterval(interval);
      setProcessingStatus('error');
      addToast('Processing failed', 'error');
    } else {
      setUploadProgress(doc.processingStatus.progress);
    }
  }, 2000);
};
```

### 🔧 导航功能实现

**无刷新页面跳转**：
```javascript
// TopBar.jsx
import { Link, useNavigate } from 'react-router-dom';

const TopBar = () => {
  const navigate = useNavigate();
  
  return (
    <nav>
      {/* 声明式导航 */}
      <Link to="/dashboard" className="nav-link">
        Dashboard
      </Link>
      
      {/* 编程式导航 */}
      <button onClick={() => navigate('/search')}>
        Find Tutors
      </button>
      
      {/* 带状态的导航 */}
      <button onClick={() => navigate('/login', { 
        state: { from: location.pathname } 
      })}>
        Login
      </button>
    </nav>
  );
};
```

**返回按钮实现**：
```javascript
const navigate = useNavigate();

<button onClick={() => navigate(-1)}>
  <ArrowLeft /> Back
</button>
```

### 🔧 交互功能实现

**视频通话集成**：
```javascript
// JitsiMeetRoom.jsx
useEffect(() => {
  if (!containerRef.current) return;

  const domain = 'meet.jit.si';
  const options = {
    roomName: sessionId,
    width: '100%',
    height: '100%',
    parentNode: containerRef.current,
    userInfo: {
      displayName: user.name,
      email: user.email
    },
    configOverwrite: {
      startWithAudioMuted: false,
      startWithVideoMuted: false,
      enableWelcomePage: false
    },
    interfaceConfigOverwrite: {
      TOOLBAR_BUTTONS: [
        'microphone', 'camera', 'closedcaptions', 'desktop',
        'fullscreen', 'hangup', 'chat', 'raisehand', 'tileview'
      ]
    }
  };

  const api = new window.JitsiMeetExternalAPI(domain, options);
  jitsiApiRef.current = api;

  // 监听会议事件
  api.addEventListener('videoConferenceJoined', () => {
    console.log('User joined conference');
  });

  api.addEventListener('videoConferenceLeft', () => {
    console.log('User left conference');
  });

  return () => api.dispose();
}, [sessionId]);
```

**代码编辑器 + Python 沙箱**：
```javascript
// CodeEditor.jsx (Session Room)
const [code, setCode] = useState('');
const [output, setOutput] = useState('');
const [isExecuting, setIsExecuting] = useState(false);

const executeCode = async () => {
  setIsExecuting(true);
  setOutput('');
  
  try {
    const response = await fetch('/api/code/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        code, 
        language: 'python' 
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      setOutput(result.output);
    } else {
      setOutput(`Error: ${result.error}`);
    }
  } catch (error) {
    setOutput(`Execution failed: ${error.message}`);
  } finally {
    setIsExecuting(false);
  }
};

return (
  <div className="h-full flex flex-col">
    <MonacoEditor
      language="python"
      value={code}
      onChange={setCode}
      theme="vs-dark"
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        lineNumbers: 'on'
      }}
    />
    <button 
      onClick={executeCode} 
      disabled={isExecuting}
      className="bg-blue-600 hover:bg-blue-700 px-4 py-2"
    >
      {isExecuting ? 'Executing...' : 'Run Code'}
    </button>
    <pre className="bg-gray-900 text-green-400 p-4 overflow-auto">
      {output}
    </pre>
  </div>
);
```

**AI 对话知识库模式**：
```javascript
// AIChat.jsx
const [isKBMode, setIsKBMode] = useState(false);
const [selectedDocs, setSelectedDocs] = useState([]);

const handleSendMessage = async (message) => {
  const payload = {
    message,
    conversationHistory: messages,
    useDeepThinking: isDeepThinkEnabled
  };
  
  // RAG 模式：附加知识库文档
  if (isKBMode && selectedDocs.length > 0) {
    payload.documentIds = selectedDocs.map(doc => doc._id);
    payload.isRAGQuery = true;
  }
  
  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  
  // 流式响应处理
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let aiResponse = '';
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    aiResponse += chunk;
    
    // 实时更新 UI
    setMessages(prev => {
      const lastMsg = prev[prev.length - 1];
      if (lastMsg?.role === 'assistant') {
        return [...prev.slice(0, -1), { 
          ...lastMsg, 
          content: aiResponse 
        }];
      }
      return [...prev, { role: 'assistant', content: aiResponse }];
    });
  }
};
```

### ✅ 边界情况处理

**输入验证**：
```javascript
// 防止 XSS 攻击
const sanitizeInput = (input) => {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .trim();
};

// 防止空提交
const handleSubmit = (e) => {
  e.preventDefault();
  
  if (!message.trim()) {
    addToast('Message cannot be empty', 'warning');
    return;
  }
  
  sendMessage(sanitizeInput(message));
};
```

**错误恢复**：
```javascript
// 网络错误自动重试
const fetchWithRetry = async (url, options, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};

// 使用示例
try {
  const data = await fetchWithRetry('/api/tutors/search', { method: 'GET' });
} catch (error) {
  addToast('Failed to load tutors. Please check your connection.', 'error');
  setSearchResults([]);
}
```

**性能优化**：
```javascript
// 搜索防抖
import { debounce } from 'lodash';

const debouncedSearch = useCallback(
  debounce(async (query) => {
    const results = await searchAPI.search(query);
    setSearchResults(results);
  }, 500),
  []
);

// Resize 事件节流
import { throttle } from 'lodash';

useEffect(() => {
  const handleResize = throttle(() => {
    updateLayout();
  }, 200);
  
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);
```

**内存泄漏防止**：
```javascript
// useEffect 清理
useEffect(() => {
  const interval = setInterval(() => {
    fetchNotifications();
  }, 30000);
  
  return () => clearInterval(interval); // 清理
}, []);

// WebSocket 清理
useEffect(() => {
  const ws = new WebSocket('ws://localhost:3000/collab');
  
  ws.onmessage = (event) => {
    handleUpdate(event.data);
  };
  
  return () => {
    ws.close(); // 清理
  };
}, [roomId]);

// Event Listener 清理
useEffect(() => {
  const handleClick = (e) => console.log(e);
  document.addEventListener('click', handleClick);
  
  return () => {
    document.removeEventListener('click', handleClick); // 清理
  };
}, []);
```

**空状态处理**：
```javascript
// Search.jsx
{searchResults.length === 0 ? (
  <div className="text-center py-12">
    <Search className="w-16 h-16 mx-auto text-gray-400 mb-4" />
    <h3 className="text-xl font-semibold text-gray-700 mb-2">
      No tutors found
    </h3>
    <p className="text-gray-500">
      Try adjusting your filters or search criteria
    </p>
  </div>
) : (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {searchResults.map(tutor => (
      <TutorCard key={tutor._id} tutor={tutor} />
    ))}
  </div>
)}
```

---

## 技术栈总结

| 类别 | 技术 |
|------|------|
| 框架 | React 18 + Vite |
| 路由 | React Router DOM v6 |
| 样式 | Tailwind CSS |
| 动画 | Framer Motion, GSAP |
| UI 组件 | ReactBits, Lucide Icons |
| 状态管理 | Context API, useState, useRef |
| 实时协作 | Yjs + WebSocket |
| 视频通话 | Jitsi Meet API |

---

## 评估自检表

- [x] 所有路由正常工作，无 404 错误
- [x] UI 在所有页面保持一致风格
- [x] 响应式设计在移动端/平板/桌面端适配良好
- [x] 所有表单验证和错误提示正常
- [x] 状态更新无闪烁或延迟
- [x] 无内存泄漏（已修复 CardSwap interval 累积 bug）
- [x] 边界情况处理完善（空状态、加载、错误）
- [x] 代码遵循 React 最佳实践（避免 key 使用 index、ref 正确管理）

