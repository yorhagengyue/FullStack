# Part 1: 数据模型设计 (5%) - 导师查找系统

## 📊 数据模型概述

本系统需要**5个核心数据模型**来支持所有功能:
1. User (用户)
2. TutorProfile (导师档案)
3. Booking (预约)
4. Review (评价)
5. Subject (科目)

---

## 📋 数据模型1: User (用户模型)

### 表信息

| 项目 | 内容 |
|------|------|
| **表名** | User |
| **描述** | 存储所有用户的基本账户信息和身份验证数据 |
| **用途** | • 用户注册和登录认证<br>• 存储用户基本信息<br>• 关联导师档案和预约记录<br>• 管理用户角色和权限 |

### 属性详情

| 属性名 | 类型 | 示例值 | 描述 |
|--------|------|--------|------|
| userId | String (ObjectId) | "507f1f77bcf86cd799439011" | 用户唯一标识符,MongoDB自动生成的_id |
| email | String | "zhang.san@student.tp.edu.sg" | 学校邮箱地址,用于登录和验证,必须唯一 |
| password | String (Hashed) | "$2b$10$XYZ..." | 加密后的密码(使用bcrypt哈希) |
| username | String | "张三" | 用户显示名称 |
| studentId | String | "1234567D" | 学号,验证学生身份 |
| major | String | "计算机科学" | 专业 |
| yearOfStudy | Number | 3 | 年级(1-4) |
| avatar | String (URL) | "/uploads/avatars/user123.jpg" | 头像图片路径或URL |
| role | Array[String] | ["student", "tutor"] | 用户角色,可以同时是学生和导师 |
| isEmailVerified | Boolean | true | 邮箱是否已验证 |
| points | Number | 280 | 用户积分总数 |
| badges | Array[String] | ["newbie", "expert"] | 已解锁的徽章ID列表 |
| createdAt | Date | "2024-09-15T08:30:00Z" | 账户创建时间 |
| updatedAt | Date | "2024-10-27T14:20:00Z" | 最后更新时间 |
| isActive | Boolean | true | 账户是否激活 |

### 关系说明
- **一对一**: User → TutorProfile (一个用户可以有一个导师档案)
- **一对多**: User → Booking (一个用户可以有多个预约,作为学生或导师)
- **一对多**: User → Review (一个用户可以给出或收到多个评价)

### 索引
- `email`: 唯一索引,加速登录查询
- `studentId`: 唯一索引,验证学生身份
- `role`: 索引,快速查找导师

---

## 👨‍🏫 数据模型2: TutorProfile (导师档案模型)

### 表信息

| 项目 | 内容 |
|------|------|
| **表名** | TutorProfile |
| **描述** | 存储导师的详细信息、技能、可用时间和统计数据 |
| **用途** | • 展示导师详细信息<br>• 搜索和筛选导师<br>• 管理导师可用时间<br>• 统计导师表现数据 |

### 属性详情

| 属性名 | 类型 | 示例值 | 描述 |
|--------|------|--------|------|
| profileId | String (ObjectId) | "507f1f77bcf86cd799439012" | 导师档案唯一标识符 |
| userId | String (ObjectId) | "507f1f77bcf86cd799439011" | 关联的用户ID(外键) |
| bio | String | "我是计算机科学大三学生,擅长编程和数据结构..." | 个人简介(最多500字符) |
| subjects | Array[Object] | [{"subjectId": "sub001", "subjectName": "Python编程", "proficiencyLevel": "expert"}] | 擅长的科目列表,包含科目ID、名称和熟练程度 |
| completedCourses | Array[Object] | [{"courseCode": "CS101", "courseName": "编程基础", "grade": "A"}] | 已完成的课程列表 |
| availableSlots | Array[Object] | [{"day": "Monday", "startTime": "14:00", "endTime": "16:00"}] | 可用时间段列表 |
| hourlyRate | Number | 0 | 每小时费用(0表示免费) |
| preferredLocation | Array[String] | ["图书馆", "线上", "咖啡厅"] | 偏好的辅导地点 |
| languages | Array[String] | ["中文", "英文"] | 可用语言 |
| tutoringSince | Date | "2023-09-01T00:00:00Z" | 开始辅导的日期 |
| totalSessions | Number | 45 | 总辅导次数 |
| totalHours | Number | 68.5 | 总辅导小时数 |
| averageRating | Number | 4.9 | 平均评分(1-5) |
| totalReviews | Number | 28 | 收到的评价总数 |
| responseRate | Number | 98 | 预约响应率(百分比) |
| responseTime | Number | 120 | 平均响应时间(分钟) |
| isVerified | Boolean | true | 是否经过验证(可能需要提交成绩单) |
| status | String | "active" | 状态: active(活跃), inactive(不活跃), suspended(暂停) |
| createdAt | Date | "2023-09-01T10:00:00Z" | 档案创建时间 |
| updatedAt | Date | "2024-10-27T15:30:00Z" | 最后更新时间 |

### 复杂属性详解

**subjects 数组对象结构:**
```json
{
  "subjectId": "sub001",
  "subjectName": "Python编程",
  "proficiencyLevel": "expert",  // beginner, intermediate, advanced, expert
  "yearsOfExperience": 2
}
```

**availableSlots 数组对象结构:**
```json
{
  "day": "Monday",  // Monday-Sunday
  "startTime": "14:00",
  "endTime": "16:00",
  "isRecurring": true  // 是否每周重复
}
```

### 关系说明
- **多对一**: TutorProfile → User (多个档案属于一个用户,实际上是一对一)
- **多对多**: TutorProfile ↔ Subject (通过subjects数组实现)
- **一对多**: TutorProfile → Booking (一个导师有多个预约)
- **一对多**: TutorProfile → Review (一个导师收到多个评价)

### 索引
- `userId`: 唯一索引,关联用户
- `subjects.subjectName`: 文本索引,支持科目搜索
- `averageRating`: 索引,按评分排序
- `status`: 索引,筛选活跃导师

---

## 📅 数据模型3: Booking (预约模型)

### 表信息

| 项目 | 内容 |
|------|------|
| **表名** | Booking |
| **描述** | 存储学生和导师之间的辅导预约信息 |
| **用途** | • 管理预约请求和确认<br>• 追踪预约状态<br>• 记录辅导历史<br>• 生成统计报告 |

### 属性详情

| 属性名 | 类型 | 示例值 | 描述 |
|--------|------|--------|------|
| bookingId | String (ObjectId) | "507f1f77bcf86cd799439013" | 预约唯一标识符 |
| studentId | String (ObjectId) | "507f1f77bcf86cd799439011" | 学生用户ID(外键) |
| tutorId | String (ObjectId) | "507f1f77bcf86cd799439014" | 导师用户ID(外键) |
| subjectId | String | "sub001" | 科目ID |
| subjectName | String | "Python编程" | 科目名称(冗余存储,便于查询) |
| courseCode | String | "CS101" | 课程代码(可选) |
| sessionDate | Date | "2024-10-28T14:00:00Z" | 辅导日期和开始时间 |
| duration | Number | 2 | 辅导时长(小时) |
| endTime | Date | "2024-10-28T16:00:00Z" | 结束时间(计算得出) |
| location | String | "图书馆3楼" | 辅导地点 |
| locationType | String | "offline" | 地点类型: online(线上), offline(线下) |
| meetingLink | String | "https://zoom.us/j/123456" | 在线会议链接(仅线上) |
| description | String | "需要帮助理解Python的类和对象..." | 学生描述需要帮助的内容 |
| studentNotes | String | "希望通过实际例子学习" | 学生备注 |
| tutorNotes | String | "准备了几个实际项目案例" | 导师备注 |
| status | String | "confirmed" | 预约状态: pending(待确认), confirmed(已确认), completed(已完成), cancelled(已取消), rejected(已拒绝) |
| cancellationReason | String | "时间冲突" | 取消原因(可选) |
| cancelledBy | String | "student" | 取消者: student, tutor, system |
| isRated | Boolean | false | 是否已评价 |
| reminderSent | Boolean | true | 是否已发送提醒 |
| createdAt | Date | "2024-10-20T10:00:00Z" | 预约创建时间 |
| updatedAt | Date | "2024-10-21T09:30:00Z" | 最后更新时间 |
| confirmedAt | Date | "2024-10-21T09:30:00Z" | 确认时间 |
| completedAt | Date | null | 完成时间 |

### 状态流转
```
pending(待确认)
    ↓
confirmed(已确认) → cancelled(已取消)
    ↓           → rejected(已拒绝)
completed(已完成)
```

### 关系说明
- **多对一**: Booking → User (studentId) 多个预约属于一个学生
- **多对一**: Booking → User (tutorId) 多个预约属于一个导师
- **多对一**: Booking → Subject 多个预约关联一个科目
- **一对一**: Booking → Review 一个预约可以有一个评价

### 索引
- `studentId`: 索引,查询学生的预约
- `tutorId`: 索引,查询导师的预约
- `status`: 索引,筛选不同状态的预约
- `sessionDate`: 索引,按日期排序和筛选
- 复合索引: `(tutorId, sessionDate)` 查询导师某天的预约

### 业务规则
- **防止重复预约**: 同一导师在同一时间段不能有重叠预约
- **提前预约**: 至少提前2小时预约
- **取消政策**: 至少提前2小时取消
- **自动完成**: 预约结束时间过后24小时自动标记为completed

---

## ⭐ 数据模型4: Review (评价模型)

### 表信息

| 项目 | 内容 |
|------|------|
| **表名** | Review |
| **描述** | 存储学生对导师的评价和反馈 |
| **用途** | • 展示导师评价<br>• 计算导师平均评分<br>• 建立信任机制<br>• 帮助学生选择导师 |

### 属性详情

| 属性名 | 类型 | 示例值 | 描述 |
|--------|------|--------|------|
| reviewId | String (ObjectId) | "507f1f77bcf86cd799439015" | 评价唯一标识符 |
| bookingId | String (ObjectId) | "507f1f77bcf86cd799439013" | 关联的预约ID(外键) |
| tutorId | String (ObjectId) | "507f1f77bcf86cd799439014" | 被评价的导师ID(外键) |
| studentId | String (ObjectId) | "507f1f77bcf86cd799439011" | 评价者(学生)ID(外键) |
| rating | Number | 5 | 评分(1-5星) |
| comment | String | "张同学讲解非常清楚,Python的基础知识帮我梳理得很清晰!强烈推荐!" | 评价内容(最多500字符) |
| tags | Array[String] | ["耐心", "讲解清晰", "准备充分"] | 评价标签 |
| isAnonymous | Boolean | false | 是否匿名评价 |
| isVerified | Boolean | true | 是否经过验证(确认预约已完成) |
| helpfulCount | Number | 12 | 其他用户认为有用的数量 |
| reportCount | Number | 0 | 被举报次数 |
| response | Object | {"content": "感谢你的反馈!", "createdAt": "2024-10-16T10:00:00Z"} | 导师回复(可选) |
| status | String | "published" | 状态: published(已发布), hidden(已隐藏), deleted(已删除) |
| createdAt | Date | "2024-10-15T20:00:00Z" | 评价创建时间 |
| updatedAt | Date | "2024-10-15T20:00:00Z" | 最后更新时间 |

### 评分分布计算
基于所有评价计算:
- 5星占比
- 4星占比
- 3星占比
- 2星占比
- 1星占比

### 关系说明
- **多对一**: Review → Booking 多个评价关联一个预约
- **多对一**: Review → User (tutorId) 多个评价属于一个导师
- **多对一**: Review → User (studentId) 多个评价由一个学生给出

### 索引
- `tutorId`: 索引,查询导师的所有评价
- `bookingId`: 唯一索引,一个预约只能有一个评价
- `rating`: 索引,按评分筛选
- `createdAt`: 索引,按时间排序
- 复合索引: `(tutorId, createdAt)` 查询导师的最新评价

### 业务规则
- **评价资格**: 只有预约状态为completed才能评价
- **一次评价**: 每个预约只能评价一次
- **时间限制**: 预约完成后7天内必须评价
- **防刷分**: 同一学生对同一导师的评价不能过于频繁

---

## 📚 数据模型5: Subject (科目模型)

### 表信息

| 项目 | 内容 |
|------|------|
| **表名** | Subject |
| **描述** | 存储所有可辅导的科目/课程信息 |
| **用途** | • 标准化科目名称<br>• 支持科目分类和搜索<br>• 统计热门科目<br>• 管理科目信息 |

### 属性详情

| 属性名 | 类型 | 示例值 | 描述 |
|--------|------|--------|------|
| subjectId | String | "sub001" | 科目唯一标识符 |
| name | String | "Python编程" | 科目名称 |
| code | String | "CS101" | 课程代码(可选) |
| category | String | "编程" | 科目分类: 编程, 数学, 物理, 化学, 语言等 |
| description | String | "学习Python基础语法和面向对象编程" | 科目描述 |
| level | String | "beginner" | 难度级别: beginner, intermediate, advanced |
| department | String | "计算机科学" | 所属院系 |
| icon | String | "🐍" | 科目图标(emoji或图片URL) |
| tags | Array[String] | ["编程", "Python", "初级"] | 搜索标签 |
| tutorCount | Number | 15 | 教这个科目的导师数量 |
| bookingCount | Number | 234 | 这个科目的总预约次数 |
| averageRating | Number | 4.7 | 这个科目所有辅导的平均评分 |
| isActive | Boolean | true | 是否激活 |
| createdAt | Date | "2024-09-01T00:00:00Z" | 创建时间 |
| updatedAt | Date | "2024-10-27T16:00:00Z" | 最后更新时间 |

### 科目分类体系
```
编程
  ├─ Python
  ├─ Java
  ├─ JavaScript
  └─ C++

数学
  ├─ 微积分
  ├─ 线性代数
  ├─ 统计学
  └─ 离散数学

理科
  ├─ 物理
  ├─ 化学
  └─ 生物

语言
  ├─ 英语
  ├─ 中文
  └─ 日语
```

### 关系说明
- **多对多**: Subject ↔ TutorProfile (通过TutorProfile.subjects数组)
- **一对多**: Subject → Booking 一个科目有多个预约

### 索引
- `subjectId`: 主键索引
- `name`: 文本索引,支持搜索
- `category`: 索引,按分类筛选
- `code`: 索引,按课程代码查询

### 业务规则
- **预设科目**: 系统预设常见科目,管理员可添加
- **自定义科目**: 导师可申请添加新科目(需审核)
- **统计更新**: tutorCount和bookingCount定期更新

---

## 🔗 数据模型关系图

```
┌─────────────┐
│    User     │
│  (用户)     │
└──────┬──────┘
       │
       │ 1:1
       ↓
┌─────────────┐      ┌─────────────┐
│TutorProfile │ M:M  │   Subject   │
│ (导师档案)  │←────→│   (科目)    │
└──────┬──────┘      └─────────────┘
       │                     ↑
       │ 1:M                 │ M:1
       ↓                     │
┌─────────────┐              │
│   Booking   │──────────────┘
│   (预约)    │
└──────┬──────┘
       │
       │ 1:1
       ↓
┌─────────────┐
│   Review    │
│   (评价)    │
└─────────────┘
```

### 关系说明:
1. **User ↔ TutorProfile**: 一对一(可选)
2. **TutorProfile ↔ Subject**: 多对多
3. **User → Booking**: 一对多(作为学生或导师)
4. **Subject → Booking**: 一对多
5. **Booking → Review**: 一对一

---

## 📊 数据示例

### 完整数据示例: 一个导师的完整信息

**User 文档:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "email": "zhang.san@student.tp.edu.sg",
  "password": "$2b$10$...",
  "username": "张三",
  "studentId": "1234567D",
  "major": "计算机科学",
  "yearOfStudy": 3,
  "avatar": "/uploads/avatars/zhang.jpg",
  "role": ["student", "tutor"],
  "isEmailVerified": true,
  "points": 280,
  "badges": ["newbie", "expert", "helpful"],
  "createdAt": "2024-09-15T08:30:00Z",
  "updatedAt": "2024-10-27T14:20:00Z",
  "isActive": true
}
```

**TutorProfile 文档:**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "userId": "507f1f77bcf86cd799439011",
  "bio": "我是计算机科学大三学生,擅长编程和数据结构。有2年辅导经验,帮助过30多位同学提高成绩。",
  "subjects": [
    {
      "subjectId": "sub001",
      "subjectName": "Python编程",
      "proficiencyLevel": "expert",
      "yearsOfExperience": 2
    },
    {
      "subjectId": "sub002",
      "subjectName": "Java",
      "proficiencyLevel": "advanced",
      "yearsOfExperience": 1
    }
  ],
  "completedCourses": [
    {
      "courseCode": "CS101",
      "courseName": "编程基础",
      "grade": "A"
    },
    {
      "courseCode": "CS201",
      "courseName": "数据结构",
      "grade": "A"
    }
  ],
  "availableSlots": [
    {
      "day": "Monday",
      "startTime": "14:00",
      "endTime": "16:00",
      "isRecurring": true
    },
    {
      "day": "Wednesday",
      "startTime": "14:00",
      "endTime": "16:00",
      "isRecurring": true
    }
  ],
  "hourlyRate": 0,
  "preferredLocation": ["图书馆", "线上"],
  "languages": ["中文", "英文"],
  "tutoringSince": "2023-09-01T00:00:00Z",
  "totalSessions": 45,
  "totalHours": 68.5,
  "averageRating": 4.9,
  "totalReviews": 28,
  "responseRate": 98,
  "responseTime": 120,
  "isVerified": true,
  "status": "active",
  "createdAt": "2023-09-01T10:00:00Z",
  "updatedAt": "2024-10-27T15:30:00Z"
}
```

**Booking 文档:**
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "studentId": "507f1f77bcf86cd799439020",
  "tutorId": "507f1f77bcf86cd799439011",
  "subjectId": "sub001",
  "subjectName": "Python编程",
  "courseCode": "CS101",
  "sessionDate": "2024-10-28T14:00:00Z",
  "duration": 2,
  "endTime": "2024-10-28T16:00:00Z",
  "location": "图书馆3楼",
  "locationType": "offline",
  "description": "需要帮助理解Python的类和对象概念",
  "studentNotes": "希望通过实际例子学习",
  "tutorNotes": "准备了几个实际项目案例",
  "status": "confirmed",
  "isRated": false,
  "reminderSent": true,
  "createdAt": "2024-10-20T10:00:00Z",
  "updatedAt": "2024-10-21T09:30:00Z",
  "confirmedAt": "2024-10-21T09:30:00Z"
}
```

**Review 文档:**
```json
{
  "_id": "507f1f77bcf86cd799439015",
  "bookingId": "507f1f77bcf86cd799439013",
  "tutorId": "507f1f77bcf86cd799439011",
  "studentId": "507f1f77bcf86cd799439020",
  "rating": 5,
  "comment": "张同学讲解非常清楚,Python的基础知识帮我梳理得很清晰!强烈推荐!",
  "tags": ["耐心", "讲解清晰", "准备充分"],
  "isAnonymous": false,
  "isVerified": true,
  "helpfulCount": 12,
  "reportCount": 0,
  "response": {
    "content": "感谢你的反馈!很高兴能帮到你!",
    "createdAt": "2024-10-16T10:00:00Z"
  },
  "status": "published",
  "createdAt": "2024-10-15T20:00:00Z",
  "updatedAt": "2024-10-16T10:00:00Z"
}
```

**Subject 文档:**
```json
{
  "_id": "sub001",
  "subjectId": "sub001",
  "name": "Python编程",
  "code": "CS101",
  "category": "编程",
  "description": "学习Python基础语法、数据结构和面向对象编程",
  "level": "beginner",
  "department": "计算机科学",
  "icon": "🐍",
  "tags": ["编程", "Python", "初级", "CS"],
  "tutorCount": 15,
  "bookingCount": 234,
  "averageRating": 4.7,
  "isActive": true,
  "createdAt": "2024-09-01T00:00:00Z",
  "updatedAt": "2024-10-27T16:00:00Z"
}
```

---

## ✅ 数据模型完整性检查

### 必需元素检查:
- [x] 至少4个关键数据模型(实际5个)
- [x] 每个模型都有表名
- [x] 每个模型都有描述
- [x] 每个模型都有在应用中的用途说明
- [x] 每个模型都有详细的属性列表
- [x] 每个属性都有类型、示例值、描述
- [x] 说明了模型之间的关系
- [x] 提供了完整的数据示例

### 数据模型覆盖功能:
- [x] 用户管理 → User
- [x] 导师档案 → TutorProfile
- [x] 搜索科目 → Subject
- [x] 预约管理 → Booking
- [x] 评价系统 → Review
- [x] 积分系统 → User.points, User.badges

---

## 🎯 下一步

数据模型设计已完成!现在Part 1所有内容都已经准备好:

1. ✅ 案例选择和问题定义
2. ✅ 项目目标和价值主张
3. ✅ 建议功能列表(8个功能)
4. ✅ 线框图规划(3个页面)
5. ✅ 数据模型设计(5个模型)

**最后一步: 准备PPT演示文稿!** 📊

准备好我帮你整理PPT内容大纲了吗? 🚀
