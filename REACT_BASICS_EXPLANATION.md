# React 基础概念解释（Tu2tor 项目）

## 1. 组件 (Components)

**概念**：组件是 React 的核心，就像乐高积木一样，可以组合成完整的应用。

### 💡 为什么需要组件？

1. **复用性**：一次编写，到处使用（如 TutorCard 可以在多个页面使用）
2. **可维护性**：每个组件负责自己的逻辑，易于调试
3. **组合性**：小组件组合成大组件，构建复杂 UI

**函数组件示例**：
```javascript
// 简单组件：显示用户信息
function UserProfile({ name, email }) {
  return (
    <div className="user-card">
      <h2>{name}</h2>
      <p>{email}</p>
    </div>
  );
}

// 使用组件
<UserProfile name="John" email="john@tp.edu.sg" />
```

**Tu2tor 实际例子**：
```javascript
// TutorCard.jsx - 导师卡片组件
function TutorCard({ tutor }) {
  return (
    <div className="card">
      <img src={tutor.avatar} alt={tutor.name} />
      <h3>{tutor.name}</h3>
      <p>Expertise: {tutor.expertise.join(', ')}</p>
      <p>Rate: ${tutor.hourlyRate}/hour</p>
      <button>Book Session</button>
    </div>
  );
}

// Search.jsx 中使用
<div className="tutor-grid">
  {tutors.map(tutor => (
    <TutorCard key={tutor._id} tutor={tutor} />
  ))}
</div>
```

### ⚠️ 常见错误

```javascript
// ❌ 错误：组件名必须大写开头
function tutorCard() {  // 小写开头
  return <div>...</div>;
}

// ✅ 正确：大写开头
function TutorCard() {
  return <div>...</div>;
}

// ❌ 错误：忘记 return
function UserProfile({ name }) {
  <div>{name}</div>  // 没有 return
}

// ✅ 正确：必须 return JSX
function UserProfile({ name }) {
  return <div>{name}</div>;
}

// 或者使用箭头函数的隐式返回
const UserProfile = ({ name }) => <div>{name}</div>;
```

### 📌 注意事项

1. **组件名必须大写开头**（React 用此区分组件和 HTML 标签）
2. **组件必须返回 JSX**（或 null）
3. **一个文件通常只导出一个主组件**（Tu2tor 约定）
4. **组件要保持纯粹**：相同输入应该返回相同输出

---

## 2. JSX (JavaScript XML)

**概念**：JSX 是 JavaScript 的扩展语法，让你可以在 JS 中写 HTML 样式的代码。

**基本语法**：
```javascript
// 普通 HTML
<div class="container">Hello</div>

// JSX（注意是 className）
<div className="container">Hello</div>

// JSX 中嵌入 JavaScript 表达式（用 {}）
const name = "Alice";
<h1>Welcome, {name}!</h1>

// 动态属性
const imageUrl = "/avatar.png";
<img src={imageUrl} alt="User" />

// 条件渲染
<div>
  {isLoggedIn ? <Dashboard /> : <Login />}
</div>
```

**Tu2tor 实际例子**：
```javascript
// Hero.jsx
function Hero() {
  const searchPlaceholders = [
    "Programming Fundamentals",
    "Web Application Development"
  ];
  
  return (
    <section className="hero">
      <h1>Ace your TP IIT modules</h1>
      <input 
        type="text" 
        placeholder={searchPlaceholders[0]}
        className="search-input"
      />
      
      {/* JSX 中的注释要用这种方式 */}
      <button className="cta-button">
        Find a Tutor
      </button>
    </section>
  );
}
```

### ⚠️ JSX 常见错误

```javascript
// ❌ 错误：使用 class 而不是 className
<div class="container">Hello</div>

// ✅ 正确：必须用 className
<div className="container">Hello</div>

// ❌ 错误：忘记闭合标签
<input type="text">
<img src="/logo.png">

// ✅ 正确：自闭合标签必须加 /
<input type="text" />
<img src="/logo.png" />

// ❌ 错误：多个根元素
return (
  <h1>Title</h1>
  <p>Content</p>
);

// ✅ 正确：用一个父元素包裹
return (
  <div>
    <h1>Title</h1>
    <p>Content</p>
  </div>
);

// 或者使用 Fragment（不会产生额外 DOM 节点）
return (
  <>
    <h1>Title</h1>
    <p>Content</p>
  </>
);

// ❌ 错误：直接写 JavaScript 对象
<div>{user}</div>  // 如果 user 是对象会报错

// ✅ 正确：提取对象属性
<div>{user.name}</div>
```

### 📌 JSX 注意事项

1. **className 不是 class**（class 是 JavaScript 保留字）
2. **style 接收对象**：`style={{ color: 'red', fontSize: '16px' }}`（注意双大括号和驼峰命名）
3. **必须有一个根元素**（或使用 Fragment `<>...</>`）
4. **所有标签必须闭合**（包括 `<input />`, `<img />` 等）
5. **在 JSX 中嵌入 JS 表达式用 `{}`**（注意是表达式，不是语句）
6. **布尔值、null、undefined 不会被渲染**（但 0 会被渲染）

```javascript
// 布尔值和 null/undefined 不显示
<div>{true}</div>         // 空白
<div>{false}</div>        // 空白
<div>{null}</div>         // 空白
<div>{undefined}</div>    // 空白

// 但 0 会显示
<div>{0}</div>            // 显示 "0"

// 所以要小心这种写法
{items.length && <List />}  // 如果 length=0，会显示 "0"

// ✅ 更好的写法
{items.length > 0 && <List />}
```

---

## 3. Props (属性)

**概念**：Props 是父组件传递给子组件的数据，就像函数的参数。

**单向数据流**：
```
父组件 ──(props)──> 子组件
只能从上往下传递，子组件不能直接修改 props
```

**基本用法**：
```javascript
// 父组件传递 props
function ParentComponent() {
  return <ChildComponent message="Hello" count={5} isActive={true} />;
}

// 子组件接收 props
function ChildComponent(props) {
  return (
    <div>
      <p>{props.message}</p>
      <p>Count: {props.count}</p>
      <p>Active: {props.isActive ? 'Yes' : 'No'}</p>
    </div>
  );
}

// 解构写法（更常用）
function ChildComponent({ message, count, isActive }) {
  return (
    <div>
      <p>{message}</p>
      <p>Count: {count}</p>
    </div>
  );
}
```

**Tu2tor 实际例子**：
```javascript
// Stats.jsx - 父组件
function Stats() {
  return (
    <div className="stats-grid">
      <StatCard value={300} label="Active Peer Tutors" />
      <StatCard value={800} label="Study Sessions" />
      <StatCard value={95} label="Success Rate" suffix="%" />
    </div>
  );
}

// StatCard - 子组件
function StatCard({ value, label, suffix = '' }) {
  return (
    <div className="stat-card">
      <div className="stat-value">
        {value}{suffix}
      </div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
```

### ⚠️ Props 常见错误

```javascript
// ❌ 错误：尝试修改 props
function Counter({ count }) {
  count = count + 1;  // ❌ Props 是只读的！
  return <div>{count}</div>;
}

// ✅ 正确：如果需要修改，使用 state
function Counter({ initialCount }) {
  const [count, setCount] = useState(initialCount);
  return (
    <div>
      <p>{count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
    </div>
  );
}

// ❌ 错误：解构了不存在的 prop
function User({ name, age, email }) {
  return <div>{email}</div>;  // 如果父组件没传 email，这里是 undefined
}

// ✅ 正确：使用默认值
function User({ name, age, email = 'No email' }) {
  return <div>{email}</div>;
}

// ❌ 错误：传递字符串以外的值忘记用 {}
<Counter count="5" />  // count 是字符串 "5"，不是数字 5

// ✅ 正确：数字、布尔、对象、数组都要用 {}
<Counter count={5} />
<Button disabled={true} />
<List items={[1, 2, 3]} />
<User data={{ name: 'John', age: 20 }} />
```

### 💡 Props 的单向数据流

```javascript
// 数据只能从父组件流向子组件
┌─────────────────┐
│  父组件         │
│  data = {...}   │
└────────┬────────┘
         │ props
         ▼
┌─────────────────┐
│  子组件         │
│  接收 props     │
└─────────────────┘

// 子组件不能直接修改父组件的数据
// 但可以通过回调函数通知父组件
```

**Tu2tor 实际例子：子组件如何通知父组件**：
```javascript
// 父组件：Search.jsx
function Search() {
  const [selectedTutor, setSelectedTutor] = useState(null);
  
  return (
    <div>
      {tutors.map(tutor => (
        <TutorCard 
          key={tutor._id}
          tutor={tutor}
          onSelect={setSelectedTutor}  // 传递回调函数
        />
      ))}
      
      {selectedTutor && (
        <BookingModal tutor={selectedTutor} />
      )}
    </div>
  );
}

// 子组件：TutorCard.jsx
function TutorCard({ tutor, onSelect }) {
  return (
    <div className="card">
      <h3>{tutor.name}</h3>
      <button onClick={() => onSelect(tutor)}>
        Select  {/* 点击时调用父组件的函数 */}
      </button>
    </div>
  );
}
```

### 📌 Props 注意事项

1. **Props 是只读的**，不能直接修改
2. **可以是任何数据类型**：字符串、数字、布尔、对象、数组、函数
3. **字符串可以不用 {}**：`<Component title="Hello" />` 等同于 `<Component title={'Hello'} />`
4. **使用解构提高可读性**：`({ name, age })` 比 `(props)` 更清晰
5. **可以设置默认值**：`function User({ name = 'Guest' }) { ... }`
6. **通过回调函数实现子→父通信**

---

## 4. State (状态)

**概念**：State 是组件内部的数据，可以改变。当 state 改变时，组件会自动重新渲染。

**useState Hook**：
```javascript
import { useState } from 'react';

function Counter() {
  // [当前值, 更新函数] = useState(初始值)
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        +1
      </button>
      <button onClick={() => setCount(count - 1)}>
        -1
      </button>
    </div>
  );
}
```

**多个 State**：
```javascript
function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async () => {
    setIsLoading(true);
    // 登录逻辑...
    setIsLoading(false);
  };
  
  return (
    <form>
      <input 
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input 
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        type="password"
        placeholder="Password"
      />
      <button onClick={handleSubmit} disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Login'}
      </button>
    </form>
  );
}
```

**Tu2tor 实际例子**：
```javascript
// Search.jsx
function Search() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    subject: '',
    minRate: 0,
    maxRate: 100
  });
  const [tutors, setTutors] = useState([]);
  
  const handleSearch = async () => {
    const results = await searchAPI.search(searchQuery, filters);
    setTutors(results); // 更新搜索结果
  };
  
  return (
    <div>
      <input 
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search tutors..."
      />
      
      <select 
        value={filters.subject}
        onChange={(e) => setFilters({ 
          ...filters, 
          subject: e.target.value 
        })}
      >
        <option value="">All Subjects</option>
        <option value="Python">Python</option>
        <option value="Web Dev">Web Dev</option>
      </select>
      
      <button onClick={handleSearch}>Search</button>
      
      <div className="results">
        {tutors.map(tutor => (
          <TutorCard key={tutor._id} tutor={tutor} />
        ))}
      </div>
    </div>
  );
}
```

### ⚠️ State 常见错误

```javascript
// ❌ 错误：直接修改 state
const [user, setUser] = useState({ name: 'John', age: 20 });
user.age = 21;  // ❌ 直接修改不会触发重新渲染！

// ✅ 正确：使用 setState 创建新对象
setUser({ ...user, age: 21 });

// ❌ 错误：依赖旧 state 更新
const [count, setCount] = useState(0);
setCount(count + 1);
setCount(count + 1);  // 期望 count+2，实际只会 +1

// ✅ 正确：使用函数形式更新
setCount(prev => prev + 1);
setCount(prev => prev + 1);  // 现在会正确 +2

// ❌ 错误：在渲染中直接修改 state
function Component() {
  const [count, setCount] = useState(0);
  setCount(count + 1);  // ❌ 无限循环！
  return <div>{count}</div>;
}

// ✅ 正确：在事件处理或 useEffect 中更新
function Component() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    setCount(1);  // ✅ 在 effect 中更新
  }, []);
  
  return (
    <button onClick={() => setCount(count + 1)}>
      {count}
    </button>
  );
}

// ❌ 错误：在循环中多次调用 setState
items.forEach(item => {
  setItems([...items, item]);  // ❌ 每次都基于旧的 items
});

// ✅ 正确：一次性更新
setItems([...items, ...newItems]);
```

### 💡 State 更新是异步的

```javascript
function Counter() {
  const [count, setCount] = useState(0);
  
  const handleClick = () => {
    setCount(count + 1);
    console.log(count);  // ❌ 仍然是旧值（0），不是 1
    
    // State 更新是异步的，不会立即生效
  };
  
  // 如果需要获取最新值，使用 useEffect
  useEffect(() => {
    console.log('Count updated:', count);  // ✅ 这里是最新值
  }, [count]);
}
```

### 💡 State 更新的批处理

```javascript
function Component() {
  const [count, setCount] = useState(0);
  const [flag, setFlag] = useState(false);
  
  const handleClick = () => {
    setCount(count + 1);
    setFlag(!flag);
    setCount(count + 2);
    // React 会批量处理这些更新，只重新渲染一次
    // 但最终 count = count + 2（最后一次的值）
  };
  
  // 如果需要基于之前的更新，使用函数形式
  const handleClick2 = () => {
    setCount(prev => prev + 1);  // count + 1
    setFlag(prev => !prev);
    setCount(prev => prev + 2);  // (count + 1) + 2
    // 现在 count = count + 3
  };
}
```

### 📌 State 注意事项

1. **不要直接修改 state**，必须使用 setState 函数
2. **State 更新是异步的**，不会立即生效
3. **基于旧 state 更新时使用函数形式**：`setCount(prev => prev + 1)`
4. **对象和数组要创建新的引用**：`setUser({ ...user, name: 'New' })`
5. **只在组件顶层调用 useState**，不能在条件、循环中
6. **State 改变会触发重新渲染**
7. **多个 setState 会被 React 批量处理**

---

## 5. 事件处理 (Event Handling)

**概念**：响应用户操作（点击、输入、提交等）。

**基本语法**：
```javascript
function EventExamples() {
  // 点击事件
  const handleClick = () => {
    console.log('Button clicked!');
  };
  
  // 输入事件
  const handleChange = (event) => {
    console.log('Input value:', event.target.value);
  };
  
  // 表单提交
  const handleSubmit = (event) => {
    event.preventDefault(); // 阻止页面刷新
    console.log('Form submitted');
  };
  
  return (
    <div>
      {/* onClick */}
      <button onClick={handleClick}>Click Me</button>
      
      {/* 直接写箭头函数 */}
      <button onClick={() => console.log('Clicked!')}>
        Quick Click
      </button>
      
      {/* onChange */}
      <input onChange={handleChange} />
      
      {/* onSubmit */}
      <form onSubmit={handleSubmit}>
        <button type="submit">Submit</button>
      </form>
      
      {/* 传递参数 */}
      <button onClick={() => handleClick('param')}>
        With Param
      </button>
    </div>
  );
}
```

**Tu2tor 实际例子**：
```javascript
// Register.jsx
function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'student'
  });
  
  // 处理输入变化
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // 处理表单提交
  const handleSubmit = async (e) => {
    e.preventDefault(); // 防止页面刷新
    
    try {
      const response = await authAPI.register(formData);
      console.log('Success:', response);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error:', error);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={formData.email}
        onChange={(e) => handleChange('email', e.target.value)}
        placeholder="Email"
      />
      
      <input
        type="password"
        value={formData.password}
        onChange={(e) => handleChange('password', e.target.value)}
        placeholder="Password"
      />
      
      <select 
        value={formData.role}
        onChange={(e) => handleChange('role', e.target.value)}
      >
        <option value="student">Student</option>
        <option value="tutor">Tutor</option>
      </select>
      
      <button type="submit">Register</button>
    </form>
  );
}
```

### ⚠️ 事件处理常见错误

```javascript
// ❌ 错误：直接调用函数
<button onClick={handleClick()}>
  Click  {/* 会在渲染时立即执行，而不是点击时 */}
</button>

// ✅ 正确：传递函数引用
<button onClick={handleClick}>Click</button>

// 或者使用箭头函数
<button onClick={() => handleClick()}>Click</button>

// ❌ 错误：忘记阻止默认行为
<form onSubmit={handleSubmit}>
  <button type="submit">Submit</button>
</form>
// 表单会刷新页面

// ✅ 正确：使用 preventDefault
const handleSubmit = (e) => {
  e.preventDefault();  // 阻止页面刷新
  // 处理表单...
};

// ❌ 错误：在 map 中传递参数
{items.map(item => (
  <button onClick={handleDelete(item.id)}>
    Delete  {/* 会立即执行 */}
  </button>
))}

// ✅ 正确：使用箭头函数包裹
{items.map(item => (
  <button onClick={() => handleDelete(item.id)}>
    Delete
  </button>
))}

// 或者使用柯里化
const handleDelete = (id) => () => {
  deleteItem(id);
};

{items.map(item => (
  <button onClick={handleDelete(item.id)}>
    Delete
  </button>
))}
```

### 💡 事件对象 (Event Object)

```javascript
function InputExample() {
  const handleChange = (event) => {
    // event 是 React 的合成事件对象
    console.log(event.target.value);  // 输入框的值
    console.log(event.target.name);   // 输入框的 name 属性
    console.log(event.type);          // 事件类型 "change"
  };
  
  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      console.log('Enter pressed');
      event.preventDefault();
    }
  };
  
  return (
    <input 
      name="username"
      onChange={handleChange}
      onKeyDown={handleKeyDown}
    />
  );
}
```

### 📌 事件处理注意事项

1. **传递函数引用，不要调用函数**：`onClick={fn}` 不是 `onClick={fn()}`
2. **需要参数时用箭头函数包裹**：`onClick={() => fn(param)}`
3. **表单提交要 `preventDefault()`** 防止页面刷新
4. **React 事件是合成事件**（SyntheticEvent），跨浏览器兼容
5. **事件名用驼峰命名**：`onClick` 不是 `onclick`
6. **this 绑定**：函数组件不需要担心 this，类组件需要 bind

---

## 6. 条件渲染 (Conditional Rendering)

**概念**：根据条件显示不同的内容。

**几种方法**：
```javascript
function ConditionalExample({ isLoggedIn, user }) {
  // 方法 1: if/else
  if (isLoggedIn) {
    return <Dashboard user={user} />;
  } else {
    return <Login />;
  }
  
  // 方法 2: 三元运算符（更常用）
  return (
    <div>
      {isLoggedIn ? (
        <Dashboard user={user} />
      ) : (
        <Login />
      )}
    </div>
  );
  
  // 方法 3: && 运算符（只显示或不显示）
  return (
    <div>
      {isLoggedIn && <Welcome name={user.name} />}
      {!isLoggedIn && <LoginPrompt />}
    </div>
  );
  
  // 方法 4: 空状态处理
  return (
    <div>
      {items.length > 0 ? (
        items.map(item => <Item key={item.id} {...item} />)
      ) : (
        <p>No items found</p>
      )}
    </div>
  );
}
```

**Tu2tor 实际例子**：
```javascript
// AIChat.jsx
function AIChat() {
  const [isKBMode, setIsKBMode] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  return (
    <div className="chat-container">
      {/* 根据模式显示不同 UI */}
      {isKBMode ? (
        <div className="kb-panel">
          <h3>Knowledge Base Mode</h3>
          <DocumentSelector />
        </div>
      ) : (
        <div className="normal-panel">
          <h3>AI Chat</h3>
        </div>
      )}
      
      {/* 消息列表 */}
      <div className="messages">
        {messages.length === 0 ? (
          // 空状态
          <div className="empty-state">
            <p>Start a conversation!</p>
          </div>
        ) : (
          // 有消息时
          messages.map((msg, index) => (
            <Message key={index} {...msg} />
          ))
        )}
        
        {/* 加载状态 */}
        {isLoading && (
          <div className="loading">
            <span>AI is thinking...</span>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## 7. 列表渲染 (List Rendering)

**概念**：显示数组中的多个元素。

**基本用法**：
```javascript
function TodoList() {
  const todos = [
    { id: 1, text: 'Learn React', done: true },
    { id: 2, text: 'Build Tu2tor', done: false },
    { id: 3, text: 'Pass exam', done: false }
  ];
  
  return (
    <ul>
      {todos.map(todo => (
        <li key={todo.id}>
          {todo.text}
          {todo.done && ' ✓'}
        </li>
      ))}
    </ul>
  );
}
```

### ⚠️ Key 的重要性

```javascript
// ❌ 错误：用 index 作为 key（如果列表会重排序）
{items.map((item, index) => (
  <div key={index}>{item}</div>
))}

// ✅ 正确：用唯一 ID 作为 key
{items.map(item => (
  <div key={item.id}>{item.name}</div>
))}
```

### 💡 为什么需要 Key？

**没有 Key 的问题**：
```javascript
// 假设有这个列表
['A', 'B', 'C']

// 渲染成
<div>A</div>
<div>B</div>
<div>C</div>

// 如果在开头插入 'D'，变成 ['D', 'A', 'B', 'C']
// 没有 key 时，React 会认为：
// - 第一个 div 从 'A' 变成 'D'（更新）
// - 第二个 div 从 'B' 变成 'A'（更新）
// - 第三个 div 从 'C' 变成 'B'（更新）
// - 第四个 div 是新的 'C'（创建）
// 😱 更新了 3 个，创建了 1 个（效率低）

// 有 key 时，React 会认为：
// - key='D' 是新的（创建）
// - key='A' 没变（不更新）
// - key='B' 没变（不更新）
// - key='C' 没变（不更新）
// ✅ 只创建了 1 个（效率高）
```

### ⚠️ Key 的常见错误

```javascript
// ❌ 错误：不提供 key
{items.map(item => (
  <div>{item.name}</div>  // Warning: Each child should have a unique "key" prop
))}

// ❌ 错误：key 不唯一
{items.map(item => (
  <div key="same">{item.name}</div>  // 所有元素 key 都一样
))}

// ❌ 错误：用 index 作为 key（列表会重排序时）
{items.map((item, index) => (
  <div key={index}>{item.name}</div>
  // 如果删除第一项，所有 index 都会变，React 会误判
))}

// ✅ 正确：用数据的唯一 ID
{items.map(item => (
  <div key={item._id}>{item.name}</div>
))}

// ✅ 也可以：如果没有 ID，用唯一的字段组合
{items.map(item => (
  <div key={`${item.name}-${item.date}`}>{item.name}</div>
))}
```

### 📌 什么时候可以用 index 作为 key？

**满足以下所有条件时可以用 index**：
1. 列表是静态的（不会改变）
2. 列表项没有 ID
3. 列表不会重新排序或过滤

```javascript
// ✅ 可以用 index：静态列表
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
{days.map((day, index) => (
  <li key={index}>{day}</li>
))}

// ❌ 不要用 index：动态列表
const [todos, setTodos] = useState([...]);
{todos.map((todo, index) => (
  <li key={index}>{todo.text}</li>  // 如果会删除/重排序，会出问题
))}
```

**Tu2tor 实际例子**：
```javascript
// Dashboard.jsx - 显示即将到来的会话
function UpcomingSessions() {
  const [sessions, setSessions] = useState([]);
  
  useEffect(() => {
    const fetchSessions = async () => {
      const data = await bookingAPI.getUpcoming();
      setSessions(data);
    };
    fetchSessions();
  }, []);
  
  return (
    <div className="sessions-list">
      <h2>Upcoming Sessions</h2>
      
      {sessions.length === 0 ? (
        <p>No upcoming sessions</p>
      ) : (
        <div className="session-cards">
          {sessions.map(session => (
            <div key={session._id} className="session-card">
              <h3>{session.subject}</h3>
              <p>Tutor: {session.tutor.name}</p>
              <p>Time: {new Date(session.scheduledTime).toLocaleString()}</p>
              <button onClick={() => joinSession(session._id)}>
                Join
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## 8. useEffect Hook

**概念**：处理副作用（side effects），如数据获取、订阅、DOM 操作等。

**基本语法**：
```javascript
import { useEffect } from 'react';

function EffectExample() {
  const [data, setData] = useState(null);
  
  // 1. 每次渲染后执行（没有依赖数组）
  useEffect(() => {
    console.log('Component rendered');
  });
  
  // 2. 只在挂载时执行一次（空依赖数组）
  useEffect(() => {
    console.log('Component mounted');
    fetchData();
  }, []);
  
  // 3. 当依赖改变时执行
  useEffect(() => {
    console.log('Data changed:', data);
  }, [data]);
  
  // 4. 清理函数（在组件卸载或下次 effect 执行前）
  useEffect(() => {
    const timer = setInterval(() => {
      console.log('Tick');
    }, 1000);
    
    // 清理
    return () => {
      clearInterval(timer);
      console.log('Cleanup');
    };
  }, []);
}
```

**常见用途**：
```javascript
function DataFetchingExample() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 获取数据
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/users');
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []); // 只在组件挂载时执行
  
  if (loading) return <p>Loading...</p>;
  
  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

**Tu2tor 实际例子**：
```javascript
// SessionRoomPage.jsx
function SessionRoomPage() {
  const { id } = useParams();
  const [sessionData, setSessionData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  
  // 1. 获取会话信息（只在 id 改变时）
  useEffect(() => {
    const fetchSession = async () => {
      const data = await bookingAPI.getById(id);
      setSessionData(data);
    };
    fetchSession();
  }, [id]);
  
  // 2. 轮询通知（每 30 秒）
  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);
    
    // 清理定时器
    return () => clearInterval(interval);
  }, []);
  
  // 3. WebSocket 连接
  useEffect(() => {
    if (!sessionData) return;
    
    const ws = new WebSocket(`ws://localhost:3000/session/${id}`);
    
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      handleMessage(message);
    };
    
    // 清理 WebSocket
    return () => {
      ws.close();
    };
  }, [sessionData, id]);
  
  // 4. 监听窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      updateLayout();
    };
    
    window.addEventListener('resize', handleResize);
    
    // 清理事件监听器
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
}
```

### ⚠️ useEffect 常见错误

```javascript
// ❌ 错误：忘记依赖数组
useEffect(() => {
  console.log(count);
});
// 每次渲染都执行，可能导致无限循环

// ❌ 错误：缺少依赖项
const [count, setCount] = useState(0);
const [name, setName] = useState('');

useEffect(() => {
  console.log(count, name);
}, [count]);  // ❌ 缺少 name
// name 改变时不会执行

// ✅ 正确：包含所有依赖
useEffect(() => {
  console.log(count, name);
}, [count, name]);

// ❌ 错误：在 effect 中修改依赖的 state
useEffect(() => {
  setCount(count + 1);
}, [count]);  // 无限循环！
// count 改变 → effect 执行 → count 改变 → effect 执行...

// ✅ 正确：移除依赖或改变逻辑
useEffect(() => {
  setCount(prev => prev + 1);
}, []);  // 只执行一次

// ❌ 错误：忘记清理
useEffect(() => {
  const interval = setInterval(() => {
    fetchData();
  }, 1000);
  // ❌ 没有返回清理函数
});

// ✅ 正确：返回清理函数
useEffect(() => {
  const interval = setInterval(() => {
    fetchData();
  }, 1000);
  
  return () => clearInterval(interval);  // 清理
}, []);

// ❌ 错误：在 effect 中使用 async
useEffect(async () => {  // ❌ useEffect 不能直接返回 Promise
  const data = await fetchData();
}, []);

// ✅ 正确：在 effect 内部定义 async 函数
useEffect(() => {
  const fetchData = async () => {
    const data = await api.get('/users');
    setUsers(data);
  };
  
  fetchData();
}, []);
```

### 💡 依赖数组的三种情况

```javascript
// 1. 没有依赖数组：每次渲染都执行
useEffect(() => {
  console.log('Every render');
});

// 2. 空依赖数组：只在挂载时执行一次
useEffect(() => {
  console.log('Only on mount');
  
  return () => {
    console.log('Only on unmount');
  };
}, []);

// 3. 有依赖数组：依赖改变时执行
useEffect(() => {
  console.log('When count or name changes');
}, [count, name]);
```

### 💡 useEffect 的执行时机

```javascript
function Component() {
  console.log('1. 渲染阶段');
  
  useEffect(() => {
    console.log('3. Effect 执行（在 DOM 更新后）');
    
    return () => {
      console.log('4. 清理函数（在下次 effect 前或卸载时）');
    };
  });
  
  return (
    <div>
      {console.log('2. 返回 JSX')}
      Hello
    </div>
  );
}

// 执行顺序：
// 1. 渲染阶段
// 2. 返回 JSX
// 3. Effect 执行（在 DOM 更新后）
// (用户交互导致重新渲染)
// 1. 渲染阶段
// 2. 返回 JSX
// 4. 清理函数
// 3. Effect 执行
```

### 📌 useEffect 注意事项

1. **必须在组件顶层调用**，不能在条件、循环中
2. **包含所有在 effect 中使用的外部变量**到依赖数组
3. **必须返回清理函数**（如果有副作用需要清理）
4. **不能直接 async**，要在内部定义 async 函数
5. **空依赖数组 `[]`** = 只在挂载时执行（类似 componentDidMount）
6. **无依赖数组** = 每次渲染都执行（谨慎使用）
7. **Effect 在浏览器绘制后执行**（不阻塞渲染）

### 💡 常见 useEffect 使用场景

```javascript
// 1. 数据获取
useEffect(() => {
  fetchData().then(setData);
}, []);

// 2. 订阅/监听
useEffect(() => {
  const sub = eventEmitter.subscribe(handleEvent);
  return () => sub.unsubscribe();
}, []);

// 3. 定时器
useEffect(() => {
  const timer = setInterval(() => tick(), 1000);
  return () => clearInterval(timer);
}, []);

// 4. 手动 DOM 操作
useEffect(() => {
  inputRef.current.focus();
}, []);

// 5. 响应 props/state 变化
useEffect(() => {
  if (userId) {
    fetchUserData(userId);
  }
}, [userId]);
```

---

## 9. 组件生命周期

**概念**：组件从创建到销毁的过程。

**函数组件的生命周期（通过 useEffect 实现）**：

```javascript
function LifecycleExample() {
  const [count, setCount] = useState(0);
  
  // 1. 挂载（Mount）- 组件第一次出现在页面上
  useEffect(() => {
    console.log('✅ Component mounted (appeared)');
    
    // 这里通常做：
    // - 获取数据
    // - 订阅事件
    // - 设置定时器
    
    return () => {
      // 4. 卸载（Unmount）- 组件从页面移除
      console.log('❌ Component will unmount (disappear)');
      
      // 这里通常做：
      // - 清理定时器
      // - 取消订阅
      // - 关闭连接
    };
  }, []); // 空数组 = 只在挂载时执行
  
  // 2. 更新（Update）- 状态或 props 改变
  useEffect(() => {
    console.log('🔄 Count updated to:', count);
    
    // 这里通常做：
    // - 响应数据变化
    // - 更新相关状态
  }, [count]); // count 改变时执行
  
  // 3. 每次渲染后
  useEffect(() => {
    console.log('🎨 Component rendered');
    
    // 没有依赖数组 = 每次渲染后都执行
  });
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
    </div>
  );
}
```

**生命周期流程图**：
```
1. 组件创建
   ↓
2. 首次渲染（Mount）
   ↓ useEffect(fn, []) 执行
3. 用户交互 / Props 改变
   ↓
4. 状态更新（State Change）
   ↓
5. 重新渲染（Re-render）
   ↓ useEffect(fn, [deps]) 执行
6. 再次交互...
   ↓
7. 组件移除（Unmount）
   ↓ useEffect cleanup 执行
```

**Tu2tor 实际例子**：
```javascript
// KnowledgeBaseUpload.jsx
function KnowledgeBaseUpload() {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [documentId, setDocumentId] = useState(null);
  
  // 挂载时：检查是否有未完成的上传
  useEffect(() => {
    console.log('Component mounted');
    const savedDocId = localStorage.getItem('uploadingDoc');
    if (savedDocId) {
      setDocumentId(savedDocId);
      pollProcessingStatus(savedDocId);
    }
  }, []);
  
  // 文档 ID 改变时：开始轮询处理状态
  useEffect(() => {
    if (!documentId) return;
    
    console.log('Start polling for doc:', documentId);
    
    const interval = setInterval(async () => {
      const doc = await knowledgeBaseAPI.getById(documentId);
      setUploadProgress(doc.processingStatus.progress);
      
      if (doc.processingStatus.status === 'completed') {
        clearInterval(interval);
        localStorage.removeItem('uploadingDoc');
      }
    }, 2000);
    
    // 卸载时：停止轮询
    return () => {
      console.log('Stop polling');
      clearInterval(interval);
    };
  }, [documentId]);
  
  // 卸载时：保存状态
  useEffect(() => {
    return () => {
      console.log('Component unmounting, saving state');
      if (documentId && uploadProgress < 100) {
        localStorage.setItem('uploadingDoc', documentId);
      }
    };
  }, [documentId, uploadProgress]);
}
```

### 📌 生命周期最佳实践

1. **挂载时获取数据**：使用 `useEffect(() => {...}, [])`
2. **响应变化时更新**：使用 `useEffect(() => {...}, [dependency])`
3. **总是清理副作用**：返回清理函数
4. **避免在 effect 中修改依赖**：会导致无限循环
5. **分离关注点**：不同的副作用用不同的 useEffect

```javascript
// ✅ 好的实践：分离关注点
function Component() {
  // Effect 1：数据获取
  useEffect(() => {
    fetchData();
  }, []);
  
  // Effect 2：订阅
  useEffect(() => {
    const sub = subscribe();
    return () => sub.unsubscribe();
  }, []);
  
  // Effect 3：定时器
  useEffect(() => {
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);
}

// ❌ 不好的实践：所有逻辑混在一起
function Component() {
  useEffect(() => {
    fetchData();
    const sub = subscribe();
    const timer = setInterval(tick, 1000);
    
    return () => {
      sub.unsubscribe();
      clearInterval(timer);
    };
  }, []);  // 难以维护
}
```

---

## 总结：React 核心概念关系图

```
┌─────────────────────────────────────────────────┐
│                  React 应用                      │
├─────────────────────────────────────────────────┤
│                                                  │
│  ┌──────────────────────────────────────┐      │
│  │         组件 (Components)            │      │
│  │                                       │      │
│  │  ┌─────────────┐    ┌─────────────┐ │      │
│  │  │   Props     │───▶│  JSX 渲染   │ │      │
│  │  │  (父→子)    │    │  HTML 样式  │ │      │
│  │  └─────────────┘    └─────────────┘ │      │
│  │         │                  ▲         │      │
│  │         │                  │         │      │
│  │  ┌─────▼────────┐   ┌─────┴───────┐ │      │
│  │  │    State     │   │   事件处理   │ │      │
│  │  │  (内部数据)  │◀──│  onClick等   │ │      │
│  │  └──────────────┘   └─────────────┘ │      │
│  │         │                            │      │
│  │         │ 改变时重新渲染             │      │
│  │         ▼                            │      │
│  │  ┌──────────────┐                   │      │
│  │  │  useEffect   │                   │      │
│  │  │  副作用处理  │                   │      │
│  │  └──────────────┘                   │      │
│  └──────────────────────────────────────┘      │
│                                                  │
└─────────────────────────────────────────────────┘
```

**记忆口诀**：
- **组件**是积木
- **Props**是参数（从父传到子）
- **State**是变量（可以改变，改变会重新渲染）
- **JSX**是模板（写 HTML 样式的 JS）
- **事件**是响应（用户点击、输入等）
- **useEffect**是钩子（处理数据获取、订阅等）

---

## 🎯 React 新手最容易犯的 10 个错误

### 1. 直接修改 State
```javascript
// ❌ 错误
state.name = 'new';
items.push(newItem);

// ✅ 正确
setState({ ...state, name: 'new' });
setItems([...items, newItem]);
```

### 2. 忘记 Key
```javascript
// ❌ 错误
{items.map(item => <div>{item}</div>)}

// ✅ 正确
{items.map(item => <div key={item.id}>{item}</div>)}
```

### 3. 事件处理直接调用函数
```javascript
// ❌ 错误
<button onClick={handleClick()}>Click</button>

// ✅ 正确
<button onClick={handleClick}>Click</button>
<button onClick={() => handleClick(param)}>Click</button>
```

### 4. useEffect 缺少依赖
```javascript
// ❌ 错误
useEffect(() => {
  console.log(count);
}, []);  // 缺少 count

// ✅ 正确
useEffect(() => {
  console.log(count);
}, [count]);
```

### 5. 忘记 useEffect 清理
```javascript
// ❌ 错误
useEffect(() => {
  const timer = setInterval(fn, 1000);
}, []);  // 没有清理

// ✅ 正确
useEffect(() => {
  const timer = setInterval(fn, 1000);
  return () => clearInterval(timer);
}, []);
```

### 6. 在 JSX 中忘记 {}
```javascript
// ❌ 错误
<div className="container-{type}">  // 输出字面量

// ✅ 正确
<div className={`container-${type}`}>
```

### 7. 用 class 而不是 className
```javascript
// ❌ 错误
<div class="box">...</div>

// ✅ 正确
<div className="box">...</div>
```

### 8. Props 解构错误
```javascript
// ❌ 错误：解构了不存在的 prop
function Component({ name, age }) {
  return <div>{age}</div>;  // 如果父组件没传 age
}

// ✅ 正确：使用默认值
function Component({ name, age = 0 }) {
  return <div>{age}</div>;
}
```

### 9. State 更新后立即使用
```javascript
// ❌ 错误
setCount(count + 1);
console.log(count);  // 仍是旧值

// ✅ 正确
useEffect(() => {
  console.log(count);  // 最新值
}, [count]);
```

### 10. 多个根元素
```javascript
// ❌ 错误
return (
  <h1>Title</h1>
  <p>Content</p>
);

// ✅ 正确
return (
  <>
    <h1>Title</h1>
    <p>Content</p>
  </>
);
```

---

## 🚀 React 性能优化提示

### 1. 避免在渲染中创建新对象/数组
```javascript
// ❌ 每次渲染都创建新对象
<Child style={{ color: 'red' }} />

// ✅ 提取到组件外
const style = { color: 'red' };
<Child style={style} />

// 或者使用 useMemo
const style = useMemo(() => ({ color: 'red' }), []);
```

### 2. 使用 React.memo 避免不必要的重新渲染
```javascript
// 子组件会随父组件每次渲染
function Child({ name }) {
  return <div>{name}</div>;
}

// ✅ 使用 memo：props 不变时不重新渲染
const Child = React.memo(({ name }) => {
  return <div>{name}</div>;
});
```

### 3. 大列表使用虚拟化
```javascript
// ❌ 渲染 10000 个元素
{items.map(item => <Item key={item.id} {...item} />)}

// ✅ 使用 react-window 或 react-virtualized
<FixedSizeList
  height={600}
  itemCount={items.length}
  itemSize={50}
>
  {({ index, style }) => (
    <div style={style}>{items[index].name}</div>
  )}
</FixedSizeList>
```

### 4. 防抖和节流
```javascript
import { debounce } from 'lodash';

// 搜索输入防抖
const debouncedSearch = useMemo(
  () => debounce((query) => search(query), 500),
  []
);

<input onChange={(e) => debouncedSearch(e.target.value)} />
```

---

## 📚 推荐学习资源

1. **官方文档**：https://react.dev（最权威）
2. **React 哲学**：理解组件化思维
3. **Tu2tor 项目代码**：实际项目中的 React 应用
4. **React DevTools**：浏览器插件，调试 React 应用必备

---

## 💬 常见问题解答

**Q: 什么时候用 State，什么时候用 Props？**
- Props：数据从父组件传来，不会在本组件改变
- State：数据在本组件内部，会改变

**Q: 为什么我的组件没有更新？**
- 检查是否直接修改了 state（必须用 setState）
- 检查是否传递了新的引用（对象/数组）
- 检查 React DevTools 中的 state 是否真的变了

**Q: useEffect 什么时候执行？**
- 在浏览器绘制完成后（不阻塞渲染）
- 根据依赖数组决定何时执行

**Q: 为什么会无限循环？**
- useEffect 中修改了依赖项
- 在渲染中直接调用 setState
- useEffect 缺少依赖数组

**Q: Key 一定要用 ID 吗？**
- 如果有唯一 ID，用 ID 最好
- 如果列表不会重排序，可以用 index
- 可以用唯一的字段组合（name + date）

---

**最后的建议**：
1. ✅ **多写代码**：理论再多不如动手实践
2. ✅ **看项目代码**：Tu2tor 是很好的学习资源
3. ✅ **用 React DevTools**：可视化理解 React 工作原理
4. ✅ **先掌握基础**：不要急着学 Redux/Zustand 等高级工具
5. ✅ **理解数据流**：单向数据流是 React 的核心

