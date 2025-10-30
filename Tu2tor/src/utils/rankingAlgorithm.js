import { RECOMMENDATION_REASONS } from './constants';

/**
 * 固定权重配置
 * 时间重叠度: 40%, 评分质量: 30%, 响应速度: 20%, 同校偏好: 10%
 */
const DEFAULT_WEIGHTS = {
  timeOverlap: 0.4,
  rating: 0.3,
  responseSpeed: 0.2,
  sameSchool: 0.1
};

/**
 * 计算时间重叠度得分 (0-100)
 * @param {Array} tutorSlots - 导师可用时间段
 * @param {Array} studentPreferences - 学生偏好时间段
 * @returns {number} 重叠度得分
 */
function calculateTimeOverlap(tutorSlots, studentPreferences) {
  if (!studentPreferences || studentPreferences.length === 0) {
    return 50; // 默认中等分数
  }

  let matchCount = 0;
  const totalPreferences = studentPreferences.length;

  studentPreferences.forEach(pref => {
    const hasMatch = tutorSlots.some(slot =>
      slot.day === pref.day &&
      slot.startTime <= pref.startTime &&
      slot.endTime >= pref.endTime
    );
    if (hasMatch) matchCount++;
  });

  // 返回匹配百分比 (0-100)
  return (matchCount / totalPreferences) * 100;
}

/**
 * 归一化评分到0-100范围
 * @param {number} rating - 评分 (1-5)
 * @returns {number} 归一化后的分数
 */
function normalizeRating(rating) {
  return ((rating - 1) / 4) * 100;
}

/**
 * 归一化响应时间到0-100范围 (越快越好)
 * @param {number} responseTime - 响应时间（分钟）
 * @returns {number} 归一化后的分数
 */
function normalizeResponseTime(responseTime) {
  // 假设理想响应时间是30分钟，最差是240分钟
  const ideal = 30;
  const worst = 240;

  if (responseTime <= ideal) return 100;
  if (responseTime >= worst) return 0;

  return 100 - ((responseTime - ideal) / (worst - ideal)) * 100;
}

/**
 * 固定加权排序算法
 * @param {Array} tutors - 导师列表
 * @param {Array} studentTimePreferences - 学生时间偏好
 * @param {string} studentSchool - 学生学校
 * @returns {Array} 排序后的导师列表（包含分数）
 */
export function rankTutorsFixed(tutors, studentTimePreferences = [], studentSchool = 'TP') {
  return tutors.map(tutor => {
    // 计算各维度得分
    const timeScore = calculateTimeOverlap(tutor.availableSlots || [], studentTimePreferences);
    const ratingScore = normalizeRating(tutor.averageRating || 3.5);
    const responseScore = normalizeResponseTime(tutor.responseTime || 120);
    const schoolScore = (tutor.school === studentSchool) ? 100 : 0;

    // 加权计算总分
    const totalScore =
      timeScore * DEFAULT_WEIGHTS.timeOverlap +
      ratingScore * DEFAULT_WEIGHTS.rating +
      responseScore * DEFAULT_WEIGHTS.responseSpeed +
      schoolScore * DEFAULT_WEIGHTS.sameSchool;

    // 存储各维度分数用于生成推荐理由
    const scores = {
      timeOverlap: timeScore,
      rating: ratingScore,
      responseSpeed: responseScore,
      sameSchool: schoolScore
    };

    return {
      ...tutor,
      matchScore: Math.round(totalScore),
      dimensionScores: scores
    };
  }).sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * 动态加权排序算法
 * @param {Array} tutors - 导师列表
 * @param {Array} studentTimePreferences - 学生时间偏好
 * @param {string} studentSchool - 学生学校
 * @param {number} userPreference - 用户偏好值 (0-100, 0=看重时间, 100=看重评分)
 * @returns {Array} 排序后的导师列表
 */
export function rankTutorsDynamic(tutors, studentTimePreferences = [], studentSchool = 'TP', userPreference = 50) {
  // 根据用户偏好动态调整权重
  const preferenceRatio = userPreference / 100;

  const weights = {
    timeOverlap: 0.6 - (preferenceRatio * 0.6), // 60% -> 0%
    rating: 0.3 + (preferenceRatio * 0.3),      // 30% -> 60%
    responseSpeed: 0.1 + (preferenceRatio * 0.3), // 10% -> 40%
    sameSchool: 0.0                             // 关闭同校偏好
  };

  return tutors.map(tutor => {
    const timeScore = calculateTimeOverlap(tutor.availableSlots || [], studentTimePreferences);
    const ratingScore = normalizeRating(tutor.averageRating || 3.5);
    const responseScore = normalizeResponseTime(tutor.responseTime || 120);
    const schoolScore = (tutor.school === studentSchool) ? 100 : 0;

    const totalScore =
      timeScore * weights.timeOverlap +
      ratingScore * weights.rating +
      responseScore * weights.responseSpeed +
      schoolScore * weights.sameSchool;

    const scores = {
      timeOverlap: timeScore,
      rating: ratingScore,
      responseSpeed: responseScore,
      sameSchool: schoolScore
    };

    return {
      ...tutor,
      matchScore: Math.round(totalScore),
      dimensionScores: scores,
      appliedWeights: weights
    };
  }).sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * 生成推荐理由标签（Top 2 权重维度）
 * @param {Object} tutor - 导师对象（包含dimensionScores）
 * @param {Object} weights - 应用的权重
 * @returns {Array} 推荐理由数组
 */
export function generateRecommendationReasons(tutor, weights = DEFAULT_WEIGHTS) {
  const { dimensionScores } = tutor;

  // 计算每个维度的加权得分
  const weightedScores = [
    {
      dimension: 'timeOverlap',
      score: dimensionScores.timeOverlap * weights.timeOverlap,
      reason: RECOMMENDATION_REASONS.TIME_MATCH
    },
    {
      dimension: 'rating',
      score: dimensionScores.rating * weights.rating,
      reason: RECOMMENDATION_REASONS.HIGH_RATING
    },
    {
      dimension: 'responseSpeed',
      score: dimensionScores.responseSpeed * weights.responseSpeed,
      reason: RECOMMENDATION_REASONS.FAST_RESPONSE
    },
    {
      dimension: 'sameSchool',
      score: dimensionScores.sameSchool * weights.sameSchool,
      reason: RECOMMENDATION_REASONS.SAME_SCHOOL
    }
  ];

  // 按加权得分排序，取前2个
  const topReasons = weightedScores
    .filter(item => item.score > 15) // 过滤掉得分过低的
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map(item => item.reason);

  // 如果导师很活跃（辅导次数>20），添加活跃标签
  if (tutor.totalSessions > 20) {
    topReasons.push(RECOMMENDATION_REASONS.ACTIVE_TUTOR);
  }

  return topReasons.slice(0, 3); // 最多返回3个理由
}

/**
 * 应用用户负反馈，调整导师列表
 * @param {Array} tutors - 导师列表
 * @param {Array} feedbacks - 负反馈记录 [{tutorId, type, timestamp}]
 * @returns {Array} 调整后的导师列表
 */
export function applyUserFeedback(tutors, feedbacks = []) {
  if (!feedbacks || feedbacks.length === 0) {
    return tutors;
  }

  // 统计反馈类型
  const feedbackMap = {};
  feedbacks.forEach(fb => {
    if (!feedbackMap[fb.tutorId]) {
      feedbackMap[fb.tutorId] = { types: [], count: 0 };
    }
    feedbackMap[fb.tutorId].types.push(fb.type);
    feedbackMap[fb.tutorId].count++;
  });

  // 过滤掉"不相关"反馈的导师
  return tutors.filter(tutor => {
    const feedback = feedbackMap[tutor.userId];
    if (!feedback) return true;

    // 如果标记为"不相关"，隐藏该导师
    return !feedback.types.includes('not_relevant');
  }).map(tutor => {
    const feedback = feedbackMap[tutor.userId];
    if (!feedback) return tutor;

    // 根据反馈类型降低匹配分数
    let penalty = 0;
    if (feedback.types.includes('time_mismatch')) {
      penalty += 20; // 时间不合扣20分
    }
    if (feedback.types.includes('style_mismatch')) {
      penalty += 15; // 教学风格不合扣15分
    }

    return {
      ...tutor,
      matchScore: Math.max(0, tutor.matchScore - penalty)
    };
  }).sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * 根据负反馈自动调整用户偏好
 * @param {Array} feedbacks - 负反馈记录
 * @param {number} currentPreference - 当前偏好值 (0-100)
 * @returns {number} 调整后的偏好值
 */
export function adjustPreferenceFromFeedback(feedbacks = [], currentPreference = 50) {
  if (feedbacks.length < 3) {
    return currentPreference; // 反馈数量不足，不调整
  }

  const timeMismatchCount = feedbacks.filter(fb => fb.type === 'time_mismatch').length;
  const styleMismatchCount = feedbacks.filter(fb => fb.type === 'style_mismatch').length;

  let newPreference = currentPreference;

  // 如果时间不合反馈多，降低偏好值（更看重时间）
  if (timeMismatchCount > 3) {
    newPreference = Math.max(0, newPreference - 15);
  }

  // 如果教学风格不合反馈多，提高偏好值（更看重评分）
  if (styleMismatchCount > 3) {
    newPreference = Math.min(100, newPreference + 15);
  }

  return newPreference;
}
