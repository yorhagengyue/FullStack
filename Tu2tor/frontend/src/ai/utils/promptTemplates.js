/**
 * Prompt Templates for AI interactions
 *
 * Reusable, well-structured prompts for different AI features
 */

export const PROMPT_TEMPLATES = {
  // ==================== CHAT ASSISTANT ====================
  CHAT_SYSTEM: `You are a friendly and helpful AI assistant for Tu2tor, a peer-to-peer student tutoring platform at Temasek Polytechnic (TP).

Your role is to help students:
1. Find suitable tutors for their subjects
2. Understand how the tutoring platform works
3. Get guidance on booking sessions
4. Answer questions about courses and study tips

Guidelines:
- Be encouraging and supportive
- Use simple, clear language
- Reference TP courses and programs when relevant
- Suggest tutors based on student needs
- Keep responses concise but helpful
- Always maintain a professional yet friendly tone

Available context:
{context}`,

  CHAT_WITH_TUTOR_CONTEXT: `Based on the following available tutors:
{tutorList}

Help the student find the best match for their needs.`,

  // ==================== TUTOR RECOMMENDATIONS ====================
  RECOMMEND_TUTORS: `Analyze the student's profile and recommend the most suitable tutors.

Student Profile:
- Major: {studentMajor}
- Year: {studentYear}
- Available Times: {studentTimes}
- Preferred Locations: {studentLocations}

Student's Request: {query}

Available Tutors (with algorithm-calculated match scores):
{tutorList}

IMPORTANT: Each tutor has been pre-scored by our matching algorithm based on:
- Time Overlap: How well their schedule matches the student's preferences (0-100)
- Rating Quality: Their historical performance and student feedback (0-100)
- Response Speed: How quickly they typically respond to requests (0-100)
- Same School: Whether they attend the same institution (0 or 100)

Your task:
1. Use the Algorithm Match Score as your baseline recommendation score
2. Analyze the dimension scores to understand WHY a tutor scored high/low
3. Generate human-readable explanations that REFERENCE these specific scores
4. Adjust the match score slightly (±5 points) only if the query context reveals important factors

Provide top 3 tutors with:
1. Match score (0-100) - USE the algorithm score, adjust only if contextually justified
2. 2-3 specific reasons explaining WHY this tutor is a good match (complete sentences, 10-15 words each)
   - MUST reference the dimension scores in your explanations
   - ✅ GOOD: "Strong time overlap (85/100) with 4 matching evening slots for your schedule"
   - ✅ GOOD: "Excellent rating quality (92/100) with consistent 5-star reviews in Database courses"
   - ✅ GOOD: "Fast response speed (78/100) typically replies within 30 minutes on weekdays"
   - ❌ BAD: "Expert in your major" (doesn't reference scores)
   - ❌ BAD: "High ratings" (too vague, no numbers)
3. 1 consideration if applicable (complete sentence, max 12 words)

Format as JSON:
{
  "recommendations": [
    {
      "tutorId": "user001",
      "matchScore": 87,
      "reasons": [
        "Strong time overlap score (85/100) provides 4 shared availability slots this week",
        "Outstanding rating quality (92/100) with proven track record in your subject area"
      ],
      "concerns": ["High demand may limit immediate availability during exam period"]
    }
  ]
}

Focus on explaining the specific value this tutor provides based on the algorithm's analysis.`,

  // ==================== CONTENT GENERATION ====================
  GENERATE_TUTOR_BIO: `Generate a professional and engaging tutor bio for a student tutor.

Tutor Information:
- Name: {name}
- Major: {major}
- Year: {year}
- School: {school}
- Subjects: {subjects}
- Completed Courses: {courses}
- Teaching Style: {teachingStyle}

Requirements:
1. 2-3 paragraphs (150-200 words total)
2. Highlight expertise and teaching approach
3. Mention completed courses and grades if relevant
4. Sound friendly and approachable
5. Emphasize peer-to-peer learning benefits
6. Use first person ("I am...")

Generate a compelling tutor bio:`,

  GENERATE_COURSE_DESCRIPTION: `Create a clear and engaging course/subject description for a tutoring session.

Subject: {subjectCode} - {subjectName}
Category: {category}
Level: {level}
Prerequisites: {prerequisites}

Requirements:
1. 2-3 sentences
2. Explain what students will learn
3. Mention real-world applications
4. Keep it motivating and clear

Generate description:`,

  GENERATE_MESSAGE_TEMPLATE: `Generate a professional message template for a tutoring booking request.

Context:
- Student: {studentName}
- Tutor: {tutorName}
- Subject: {subject}
- Preferred Time: {time}
- Location: {location}
- Message Type: {messageType} (initial_contact, follow_up, confirmation, cancellation)

Requirements:
1. Polite and professional
2. Clear about intent
3. Include necessary details
4. Friendly tone suitable for peer-to-peer communication

Generate message:`,

  // ==================== SEARCH ENHANCEMENT ====================
  SEMANTIC_SEARCH: `Understand the student's natural language query and extract key search parameters.

Student's Query: "{query}"

Extract and return:
1. Subject/course codes mentioned
2. Desired tutor qualities
3. Time preferences
4. Location preferences
5. Any special requirements
6. Suggested search keywords

Format as JSON:
{
  "subjects": ["IT2001", "BDA2001"],
  "qualities": ["patient", "experienced"],
  "timePreferences": ["weekday evenings", "Saturday morning"],
  "locations": ["Library @ TP", "Online"],
  "specialRequirements": ["need help before exam"],
  "keywords": ["database", "SQL", "urgent"]
}`,

  REFINE_SEARCH_QUERY: `The student's search returned {resultCount} results.

Original Query: "{originalQuery}"
Current Filters: {currentFilters}

Suggest 3 ways to refine the search to get better results:
1. Add more specific keywords
2. Adjust filters
3. Broaden or narrow criteria

Return as JSON with suggestions and reasoning.`,

  // ==================== LEARNING ASSISTANCE ====================
  STUDY_TIPS: `Provide personalized study tips for a student struggling with a subject.

Subject: {subject}
Student's Concern: {concern}
Student's Learning Style: {learningStyle}

Provide:
1. 3-5 specific, actionable study tips
2. Recommended resources
3. Time management suggestions
4. How a tutor can help specifically

Keep it encouraging and practical.`,

  EXAM_PREP_ADVICE: `Create an exam preparation plan for a student.

Subject: {subject}
Exam Date: {examDate}
Days Until Exam: {daysRemaining}
Current Understanding Level: {currentLevel}
Topics to Cover: {topics}

Provide:
1. Week-by-week study schedule
2. Priority topics
3. Practice strategies
4. When to book tutoring sessions
5. Last-minute tips

Be realistic and encouraging.`,

  // ==================== FEEDBACK ANALYSIS ====================
  ANALYZE_REVIEW: `Analyze this tutor review and extract key insights.

Review:
Rating: {rating}/5
Comment: "{comment}"
Tags: {tags}

Extract:
1. Main strengths mentioned
2. Areas for improvement
3. Teaching style indicators
4. Subject expertise level
5. Overall sentiment (positive/neutral/negative)

Return as structured JSON.`,

  SUMMARIZE_TUTOR_REVIEWS: `Summarize the overall feedback for a tutor based on their reviews.

Tutor: {tutorName}
Total Reviews: {reviewCount}
Average Rating: {averageRating}

Reviews:
{reviewsList}

Provide:
1. Overall performance summary (2-3 sentences)
2. Top 3 strengths
3. Common themes in positive feedback
4. Any recurring concerns
5. Recommended for (student types)

Keep it objective and balanced.`,
};

/**
 * Fill a template with provided data
 */
export function fillTemplate(templateKey, data) {
  let template = PROMPT_TEMPLATES[templateKey];

  if (!template) {
    throw new Error(`Template '${templateKey}' not found`);
  }

  // Replace all placeholders {key} with data[key]
  Object.keys(data).forEach((key) => {
    const placeholder = `{${key}}`;
    const value = data[key] !== undefined ? data[key] : '';
    template = template.replace(new RegExp(placeholder, 'g'), value);
  });

  return template;
}

/**
 * Create a chat message array with system prompt
 */
export function createChatMessages(systemPrompt, userMessage, history = []) {
  return [
    { role: 'system', content: systemPrompt },
    ...history,
    { role: 'user', content: userMessage },
  ];
}

/**
 * Format tutor list for prompts
 */
export function formatTutorListForPrompt(tutors) {
  return tutors
    .map((tutor, index) => {
      let tutorInfo = `${index + 1}. ${tutor.username} (${tutor.userId})
   - Major: ${tutor.major}
   - Year: ${tutor.yearOfStudy}
   - Rating: ${tutor.averageRating}/5 (${tutor.totalReviews} reviews)`;

      // Add algorithm match score if available
      if (tutor.matchScore !== undefined) {
        tutorInfo += `\n   - Algorithm Match Score: ${tutor.matchScore}/100`;
      }

      // Add dimension scores if available
      if (tutor.dimensionScores) {
        tutorInfo += `\n   - Dimension Scores:`;
        tutorInfo += `\n     * Time Overlap: ${Math.round(tutor.dimensionScores.timeOverlap)}/100`;
        tutorInfo += `\n     * Rating Quality: ${Math.round(tutor.dimensionScores.rating)}/100`;
        tutorInfo += `\n     * Response Speed: ${Math.round(tutor.dimensionScores.responseSpeed)}/100`;
        tutorInfo += `\n     * Same School: ${Math.round(tutor.dimensionScores.sameSchool)}/100`;
      }

      tutorInfo += `\n   - Subjects: ${tutor.subjects?.map(s => s.code).join(', ') || 'None'}`;
      tutorInfo += `\n   - Available: ${tutor.availableSlotsDisplay?.slice(0, 3).join(', ') || 'See profile'}`;
      tutorInfo += `\n   - Locations: ${tutor.preferredLocations?.join(', ') || 'TBD'}`;

      return tutorInfo;
    })
    .join('\n\n');
}

/**
 * Extract JSON from AI response (handles markdown code blocks)
 */
export function extractJSON(text) {
  try {
    // First try direct parsing
    return JSON.parse(text);
  } catch (e) {
    // Try to extract JSON from markdown code block
    const jsonMatch = text.match(/```json?\s*\n?([\s\S]*?)\n?```/);
    if (jsonMatch && jsonMatch[1]) {
      return JSON.parse(jsonMatch[1].trim());
    }

    // Try to find JSON object in text
    const objectMatch = text.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      return JSON.parse(objectMatch[0]);
    }

    throw new Error('Could not extract JSON from response');
  }
}

export default PROMPT_TEMPLATES;
