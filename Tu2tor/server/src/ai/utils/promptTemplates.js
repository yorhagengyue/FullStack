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

Student's Priority Preference: {priority}

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
3. IMPORTANT: Adjust your recommendations based on the Student's Priority Preference:
   - "Schedule First": Prioritize tutors with HIGH Time Overlap scores, even if ratings are slightly lower
   - "Balanced": Give equal weight to all dimensions
   - "Rating First": Prioritize tutors with HIGH Rating Quality scores, even if schedule overlap is lower
4. Generate human-readable explanations that REFERENCE these specific scores and align with the priority
5. Adjust the match score slightly (±5 points) only if the query context reveals important factors

Provide top 3 tutors with:
1. Match score (0-100) - USE the algorithm score, adjust based on priority preference if needed
2. 2-3 specific reasons explaining WHY this tutor is a good match (complete sentences, 10-15 words each)
   - MUST reference the dimension scores in your explanations
   - MUST align with the stated priority preference
   - GOOD (Schedule First): "Excellent time overlap (88/100) with 5 matching slots perfectly fitting your schedule"
   - GOOD (Rating First): "Outstanding rating quality (95/100) with consistent 5-star reviews in Database courses"
   - GOOD (Balanced): "Strong overall match with high time overlap (85/100) and excellent ratings (90/100)"
   - BAD: "Expert in your major" (doesn't reference scores)
   - BAD: "High ratings" (too vague, no numbers)
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

Focus on explaining the specific value this tutor provides based on the algorithm's analysis AND the student's priority preference.`,

  // ... (rest of the templates)
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

