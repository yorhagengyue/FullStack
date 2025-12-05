# Review Data Migration Guide

## 问题说明

在修复 Review 系统时，我们发现了一个数据不一致的问题：

### 数据模型关系
```
User (用户账户)
  └─> role: 'tutor'
       └─> Tutor (导师资料)
            ├─> userId: User._id
            ├─> averageRating
            └─> totalReviews

Booking (预约)
  ├─> studentId: User._id (学生)
  └─> tutorId: Tutor._id (导师资料 ID)

Review (评价) - 正确的结构
  ├─> studentId: User._id (学生)
  ├─> tutorId: User._id (导师的 User ID，不是 Tutor ID！)
  └─> bookingId: Booking._id
```

### 问题
旧的 reviews 可能存储了错误的 `tutorId`：
- ❌ **错误**: `tutorId` 指向 `Tutor._id`（Tutor 资料的 ID）
- ✅ **正确**: `tutorId` 应该指向 `User._id`（导师的用户账户 ID）

这导致：
1. 查询 reviews 时找不到数据
2. 评分统计无法正确计算
3. Reviews 页面显示为空

## 解决方案

### 步骤 1: 运行数据迁移脚本

在 `Tu2tor/server` 目录下运行：

```bash
npm run migrate:reviews
```

### 步骤 2: 迁移脚本功能

脚本会自动执行以下操作：

1. **检查所有 reviews**
   - 遍历数据库中的所有 review 记录
   
2. **识别需要迁移的数据**
   - 检查 `tutorId` 是否指向 User（正确）
   - 如果指向 Tutor，则查找对应的 User ID
   
3. **更新 tutorId**
   - 将错误的 Tutor ID 替换为正确的 User ID
   
4. **重新计算统计数据**
   - 为所有导师重新计算 `averageRating` 和 `totalReviews`
   - 更新 Tutor profile 中的统计信息

### 步骤 3: 验证结果

迁移完成后，你会看到类似的输出：

```
🔄 Starting Review tutorId migration...

✅ Connected to MongoDB

📊 Found 5 reviews to check

✓ Review 673abc123...: tutorId already correct (User ID)
✅ Review 673def456...: Migrated tutorId
   Old (Tutor ID): 673xxx...
   New (User ID):  674yyy...

============================================================
📈 Migration Summary:
============================================================
Total reviews:         5
Already correct:       2
Successfully migrated: 3
Errors:                0
============================================================

🔄 Recalculating tutor statistics...

✅ Updated stats for tutor 674yyy...: { averageRating: 4.5, totalReviews: 3 }

✅ Migration completed successfully!

🔌 Database connection closed
```

## 迁移后的效果

✅ **Reviews 页面**
- 正确显示平均评分
- 显示评分分布图
- 列出所有评价记录

✅ **Tutor 资料页**
- 显示正确的评分和评价数量
- 评分统计实时更新

✅ **数据一致性**
- 所有 reviews 的 `tutorId` 都指向正确的 User ID
- 统计数据与实际评价匹配

## 注意事项

1. **备份数据库**（可选但推荐）
   ```bash
   mongodump --uri="your_mongodb_uri" --out=backup_$(date +%Y%m%d)
   ```

2. **迁移是安全的**
   - 脚本只更新需要修复的数据
   - 已经正确的数据不会被修改
   - 所有操作都有详细日志

3. **可以重复运行**
   - 脚本是幂等的，可以安全地多次运行
   - 不会重复迁移已经正确的数据

## 故障排除

### 问题: "Could not find corresponding Tutor or User"
**原因**: Review 的 tutorId 既不是有效的 User ID 也不是有效的 Tutor ID
**解决**: 检查该 review 的 bookingId，从 Booking 中找到正确的 tutor 信息

### 问题: 迁移后评分仍然显示 0.0
**原因**: 可能是前端缓存问题
**解决**: 
1. 清除浏览器缓存
2. 刷新页面
3. 检查浏览器控制台的日志

### 问题: 连接数据库失败
**原因**: MongoDB URI 配置错误
**解决**: 检查 `Tu2tor/server/.env` 中的 `MONGODB_URI`

## 技术细节

### 迁移逻辑
```javascript
for (const review of reviews) {
  // 1. 尝试将 tutorId 作为 User ID 查找
  const user = await User.findById(review.tutorId);
  
  if (user && user.role === 'tutor') {
    // tutorId 已经正确 ✓
    continue;
  } else {
    // 2. 尝试将 tutorId 作为 Tutor ID 查找
    const tutor = await Tutor.findById(review.tutorId);
    
    if (tutor && tutor.userId) {
      // 3. 更新为正确的 User ID
      review.tutorId = tutor.userId;
      await review.save();
    }
  }
}
```

### 统计重新计算
```javascript
// 使用 MongoDB aggregation 计算平均分
const stats = await Review.getAverageRatingForTutor(userId);

// 更新 Tutor profile
await Tutor.findOneAndUpdate(
  { userId: userId },
  {
    averageRating: Math.round(stats.averageRating * 100) / 100,
    totalReviews: stats.totalReviews
  }
);
```

## 联系支持

如果迁移过程中遇到问题，请：
1. 保存完整的控制台输出
2. 检查 MongoDB 日志
3. 提供错误信息和堆栈跟踪


