// IT and Technology subjects - comprehensive coverage
const IT_SUBJECTS = {
  'Frontend Development': ['react', 'vue', 'angular', 'html', 'css', 'javascript', 'typescript', 'jsx', 'dom', 'webpack', 'vite', 'tailwind', 'bootstrap', 'sass', 'responsive', 'ui', 'ux'],
  'Backend Development': ['node', 'express', 'django', 'flask', 'spring', 'laravel', 'api', 'rest', 'graphql', 'server', 'middleware', 'authentication', 'jwt', 'oauth'],
  'Database': ['mongodb', 'mysql', 'postgresql', 'sql', 'nosql', 'database', 'query', 'schema', 'index', 'transaction', 'orm', 'mongoose', 'sequelize'],
  'Mobile Development': ['react native', 'flutter', 'swift', 'kotlin', 'ios', 'android', 'mobile', 'app', 'xamarin'],
  'DevOps & Cloud': ['docker', 'kubernetes', 'aws', 'azure', 'gcp', 'ci/cd', 'jenkins', 'github actions', 'deployment', 'nginx', 'linux', 'bash'],
  'Web Security': ['security', 'xss', 'csrf', 'sql injection', 'encryption', 'hashing', 'https', 'ssl', 'authentication', 'authorization', 'vulnerability'],
  'AI & Machine Learning': ['ai', 'machine learning', 'deep learning', 'neural network', 'tensorflow', 'pytorch', 'model', 'training', 'dataset', 'nlp', 'computer vision'],
  'Data Structures & Algorithms': ['algorithm', 'data structure', 'array', 'linked list', 'tree', 'graph', 'hash', 'sort', 'search', 'complexity', 'big o'],
  'Programming Languages': ['python', 'java', 'c++', 'c#', 'go', 'rust', 'php', 'ruby', 'programming', 'syntax', 'function', 'class', 'object'],
  'Version Control': ['git', 'github', 'gitlab', 'commit', 'branch', 'merge', 'pull request', 'repository'],
  'Testing': ['test', 'unit test', 'integration test', 'jest', 'mocha', 'pytest', 'testing', 'debug', 'bug'],
  'Web Technologies': ['http', 'websocket', 'ajax', 'fetch', 'promise', 'async', 'await', 'json', 'xml', 'cors']
};

/**
 * Use AI to detect if a message is study/learning-related
 * Uses backend AI API for classification
 * @param {string} message - The user's message
 * @returns {Promise<Object>} - { isStudyRelated: boolean, subject: string|null, confidence: number }
 */
export const detectWithAI = async (message) => {
  try {
    // Import aiAPI dynamically to avoid issues
    const { default: aiAPI } = await import('../services/aiAPI.js');
    
    console.log('[studyNoteHelper] Using backend AI service for detection');
    
    // Call backend API for subject detection
    const response = await aiAPI.detectSubject(message);
    
    if (response.success && response.isStudyRelated !== undefined) {
      return {
        isStudyRelated: response.isStudyRelated,
        subject: response.subject || null,
        confidence: response.confidence || 50,
      };
    }
    
    console.warn('[studyNoteHelper] Unexpected backend response:', response);
    return detectWithKeywords(message);
  } catch (error) {
    // Silently fallback to keyword detection if backend is unavailable
    console.log('[studyNoteHelper] Backend AI unavailable, using keyword fallback:', error.message);
    return detectWithKeywords(message);
  }
};

/**
 * Fallback: Keyword-based detection for IT subjects
 * @param {string} message - The user's message
 * @returns {Object} - { isStudyRelated: boolean, subject: string|null, confidence: number }
 */
const detectWithKeywords = (message) => {
  const lowerMessage = message.toLowerCase();
  
  // Check for learning/question indicators
  const learningIndicators = [
    'how', 'what', 'why', 'explain', 'difference', 'vs', 'versus',
    'implement', 'create', 'build', 'error', 'issue', 'problem',
    'best practice', 'should i', 'can i', 'help', 'tutorial'
  ];
  
  const hasLearningIndicator = learningIndicators.some(indicator => 
    lowerMessage.includes(indicator)
  );
  
  // Check for IT subjects
  let bestMatch = null;
  let maxScore = 0;
  
  for (const [subject, keywords] of Object.entries(IT_SUBJECTS)) {
    const matchCount = keywords.filter(keyword => 
      lowerMessage.includes(keyword.toLowerCase())
    ).length;
    
    if (matchCount > maxScore) {
      maxScore = matchCount;
      bestMatch = subject;
    }
  }
  
  // Determine if it's study-related
  const isStudyRelated = (maxScore >= 1 && hasLearningIndicator) || maxScore >= 2;
  const confidence = isStudyRelated ? Math.min(0.5 + (maxScore * 0.1), 0.9) : 0.2;
  
  return {
    isStudyRelated,
    subject: isStudyRelated ? bestMatch : null,
    confidence,
    reason: isStudyRelated ? 'Keyword match' : 'No strong indicators'
  };
};

/**
 * Detect if a message is academic/study-related (main function)
 * @param {string} message - The user's message
 * @returns {Promise<string|null>} - Detected subject or null
 */
export const detectAcademicSubject = async (message) => {
  // Try AI detection first (uses backend API)
  const result = await detectWithAI(message);
  if (result.isStudyRelated && result.confidence > 0.6) {
    return result.subject;
  }
  
  // Fallback to keyword detection if AI fails or confidence is low
  const keywordResult = detectWithKeywords(message);
  return keywordResult.isStudyRelated ? keywordResult.subject : null;
};

/**
 * Generate AI summary and structured markdown from conversation
 * @param {Array} messages - Array of conversation messages
 * @param {string} subject - Detected subject
 * @returns {Promise<Object>} - { title, content, tags, metadata, summary }
 */
export const generateStudyNote = async (messages, subject) => {
  if (!messages || messages.length < 2) return null;
  
  // Find the user's question and AI's response
  const userMessages = messages.filter(m => m.role === 'user');
  const aiMessages = messages.filter(m => m.role === 'assistant');
  
  if (userMessages.length === 0 || aiMessages.length === 0) return null;
  
  // Generate title from the first user question
  const firstQuestion = userMessages[0].content;
  const title = firstQuestion.length > 60 
    ? firstQuestion.substring(0, 60) + '...' 
    : firstQuestion;
  
  // Prepare conversation for AI summarization
  let conversationText = '';
  for (let i = 0; i < Math.min(userMessages.length, aiMessages.length); i++) {
    conversationText += `Q: ${userMessages[i].content}\n\nA: ${aiMessages[i].content}\n\n`;
  }
  
  // Get AI summary
  let summary = '';
  let keyPoints = [];
  let codeExamples = [];
  
  try {
    // Import aiAPI dynamically
    const { default: aiAPI } = await import('../services/aiAPI.js');
    
    const summaryPrompt = `Analyze this technical conversation and provide a structured summary in JSON format:

Conversation:
${conversationText}

Provide:
{
  "summary": "A concise 2-3 sentence summary of what was learned",
  "keyPoints": ["Key point 1", "Key point 2", "Key point 3"],
  "keyTakeaways": ["Main takeaway 1", "Main takeaway 2"],
  "codeExamples": [{"language": "javascript", "description": "What this code does", "code": "actual code"}],
  "relatedTopics": ["Related topic 1", "Related topic 2"]
}

Focus on:
- What problem was solved
- Key concepts explained
- Important code patterns or solutions
- Best practices mentioned`;

    const response = await aiAPI.generateContent(summaryPrompt);
    
    let responseText = '';
    if (typeof response === 'string') {
      responseText = response;
    } else if (response && response.content) {
      responseText = response.content;
    } else if (response && response.text) {
      responseText = response.text;
    }
    
    responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const summaryData = JSON.parse(jsonMatch[0]);
      summary = summaryData.summary || '';
      keyPoints = summaryData.keyPoints || [];
      codeExamples = summaryData.codeExamples || [];
      
      // Add related topics to tags
      if (summaryData.relatedTopics) {
        summaryData.relatedTopics.forEach(topic => {
          if (!keyPoints.includes(topic)) {
            keyPoints.push(topic);
          }
        });
      }
    }
  } catch (error) {
    console.error('Error generating AI summary:', error);
    summary = 'Summary generation failed. See full conversation below.';
  }
  
  // Generate enhanced markdown content
  let content = `# ${title}\n\n`;
  content += `> **Subject:** ${subject} | **Date:** ${new Date().toLocaleDateString()}\n\n`;
  content += `---\n\n`;
  
  // Add AI Summary Section
  content += `## 📝 Summary\n\n`;
  content += `${summary}\n\n`;
  
  // Add Key Points
  if (keyPoints.length > 0) {
    content += `## 🎯 Key Points\n\n`;
    keyPoints.forEach(point => {
      content += `- ${point}\n`;
    });
    content += `\n`;
  }
  
  // Add Code Examples if any
  if (codeExamples.length > 0) {
    content += `## 💻 Code Examples\n\n`;
    codeExamples.forEach(example => {
      content += `### ${example.description}\n\n`;
      content += `\`\`\`${example.language}\n${example.code}\n\`\`\`\n\n`;
    });
  }
  
  // Add Full Conversation
  content += `## 💬 Full Conversation\n\n`;
  for (let i = 0; i < Math.min(userMessages.length, aiMessages.length); i++) {
    content += `### Question ${i + 1}\n\n`;
    content += `${userMessages[i].content}\n\n`;
    content += `**Answer:**\n\n`;
    content += `${aiMessages[i].content}\n\n`;
    if (i < userMessages.length - 1) {
      content += `---\n\n`;
    }
  }
  
  // Extract tags
  const tags = [subject];
  const lowerContent = content.toLowerCase();
  
  // Add specific topic tags from IT subjects and key points
  Object.entries(IT_SUBJECTS).forEach(([subj, keywords]) => {
    keywords.forEach(keyword => {
      if (lowerContent.includes(keyword.toLowerCase()) && !tags.includes(keyword)) {
        tags.push(keyword);
      }
    });
  });
  
  // Add key points as tags
  keyPoints.forEach(point => {
    const shortPoint = point.split(' ').slice(0, 3).join(' ');
    if (shortPoint.length < 30 && !tags.includes(shortPoint)) {
      tags.push(shortPoint);
    }
  });
  
  // Metadata
  const metadata = {
    questionCount: userMessages.length,
    codeBlocks: (content.match(/```/g) || []).length / 2,
    hasImages: userMessages.some(m => m.files && m.files.length > 0),
    hasSummary: summary.length > 0,
    keyPointsCount: keyPoints.length
  };
  
  return {
    title,
    subject,
    content,
    tags: tags.slice(0, 15), // Limit to 15 tags
    metadata,
    summary
  };
};

/**
 * Check if conversation should be saved as study note
 * @param {Array} messages - Array of conversation messages
 * @returns {Promise<boolean>}
 */
export const shouldSaveAsStudyNote = async (messages) => {
  if (!messages || messages.length < 2) return false;
  
  const userMessages = messages.filter(m => m.role === 'user');
  if (userMessages.length === 0) return false;
  
  // Check if any user message is study-related
  for (const msg of userMessages) {
    const subject = await detectAcademicSubject(msg.content);
    if (subject) return true;
  }
  
  return false;
};

/**
 * Get unique conversation ID
 * @param {Array} messages - Array of conversation messages
 * @returns {string}
 */
export const getConversationId = (messages) => {
  if (!messages || messages.length === 0) return null;
  const firstMessage = messages[0];
  return `conv_${firstMessage.timestamp?.getTime() || Date.now()}`;
};

// Export IT_SUBJECTS for reference if needed
export { IT_SUBJECTS };

