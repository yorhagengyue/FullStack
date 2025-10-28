/**
 * ContentGenerationService - AI content generation for the platform
 *
 * Generates tutor bios, course descriptions, messages, and other content
 */

import { fillTemplate, PROMPT_TEMPLATES } from '../utils/promptTemplates';

export class ContentGenerationService {
  constructor(aiService) {
    this.aiService = aiService;
  }

  /**
   * Generate a tutor bio
   */
  async generateTutorBio(tutorData) {
    try {
      const prompt = fillTemplate('GENERATE_TUTOR_BIO', {
        name: tutorData.name || 'Unknown',
        major: tutorData.major || 'Unknown Major',
        year: tutorData.year || 'N/A',
        school: tutorData.school || 'Temasek Polytechnic',
        subjects: tutorData.subjects?.join(', ') || 'Various subjects',
        courses: tutorData.completedCourses?.map(c => `${c.code} (${c.grade})`).join(', ') || 'None specified',
        teachingStyle: tutorData.teachingStyle || 'patient and encouraging',
      });

      const result = await this.aiService.generateContent(prompt, {
        temperature: 0.8,
        maxTokens: 500,
      });

      return {
        success: true,
        bio: result.content,
        tokens: result.tokens,
        cost: result.cost,
      };
    } catch (error) {
      console.error('[ContentGenerationService] Generate bio failed:', error);
      return {
        success: false,
        bio: `I'm ${tutorData.name}, a ${tutorData.major} student passionate about helping fellow students succeed. Let's learn together!`,
      };
    }
  }

  /**
   * Generate a course/subject description
   */
  async generateCourseDescription(courseData) {
    try {
      const prompt = fillTemplate('GENERATE_COURSE_DESCRIPTION', {
        subjectCode: courseData.code || 'SUBJ101',
        subjectName: courseData.name || 'Subject',
        category: courseData.category || 'General',
        level: courseData.level || 'Intermediate',
        prerequisites: courseData.prerequisites || 'None',
      });

      const result = await this.aiService.generateContent(prompt, {
        temperature: 0.7,
        maxTokens: 300,
      });

      return {
        success: true,
        description: result.content,
        tokens: result.tokens,
        cost: result.cost,
      };
    } catch (error) {
      console.error('[ContentGenerationService] Generate description failed:', error);
      return {
        success: false,
        description: `Learn about ${courseData.name} through one-on-one tutoring sessions.`,
      };
    }
  }

  /**
   * Generate a message template for booking requests
   */
  async generateMessage(messageData) {
    try {
      const prompt = fillTemplate('GENERATE_MESSAGE_TEMPLATE', {
        studentName: messageData.studentName || 'Student',
        tutorName: messageData.tutorName || 'Tutor',
        subject: messageData.subject || 'a subject',
        time: messageData.time || 'a convenient time',
        location: messageData.location || 'to be decided',
        messageType: messageData.type || 'initial_contact',
      });

      const result = await this.aiService.generateContent(prompt, {
        temperature: 0.7,
        maxTokens: 300,
      });

      return {
        success: true,
        message: result.content,
        tokens: result.tokens,
        cost: result.cost,
      };
    } catch (error) {
      console.error('[ContentGenerationService] Generate message failed:', error);
      return {
        success: false,
        message: `Hi ${messageData.tutorName}, I'm interested in booking a tutoring session for ${messageData.subject}. Are you available?`,
      };
    }
  }

  /**
   * Generate review response for tutors
   */
  async generateReviewResponse(reviewData) {
    try {
      const prompt = `Generate a professional, friendly response to this review:

Review Rating: ${reviewData.rating}/5
Review Comment: "${reviewData.comment}"

Requirements:
- Thank the student sincerely
- Acknowledge specific points they mentioned
- Stay humble and professional
- Encourage future sessions
- 2-3 sentences maximum
- First person perspective`;

      const result = await this.aiService.generateContent(prompt, {
        temperature: 0.8,
        maxTokens: 200,
      });

      return {
        success: true,
        response: result.content,
      };
    } catch (error) {
      console.error('[ContentGenerationService] Generate response failed:', error);
      return {
        success: false,
        response: 'Thank you for your feedback! I really enjoyed our session and hope to help you again soon.',
      };
    }
  }

  /**
   * Improve/polish existing text
   */
  async improveText(text, textType = 'general') {
    try {
      const prompt = `Improve this ${textType} text to be more professional, clear, and engaging:

Original: "${text}"

Requirements:
- Fix grammar and spelling
- Improve clarity and flow
- Keep the same tone
- Keep it concise
- Return only the improved text, no explanations`;

      const result = await this.aiService.generateContent(prompt, {
        temperature: 0.5,
        maxTokens: 400,
      });

      return {
        success: true,
        improvedText: result.content,
      };
    } catch (error) {
      console.error('[ContentGenerationService] Improve text failed:', error);
      return {
        success: false,
        improvedText: text,
      };
    }
  }

  /**
   * Generate study tips for a subject
   */
  async generateStudyTips(subjectData) {
    try {
      const prompt = fillTemplate('STUDY_TIPS', {
        subject: subjectData.subject || 'this subject',
        concern: subjectData.concern || 'understanding the material',
        learningStyle: subjectData.learningStyle || 'visual and hands-on',
      });

      const result = await this.aiService.generateContent(prompt, {
        temperature: 0.7,
        maxTokens: 600,
      });

      return {
        success: true,
        tips: result.content,
      };
    } catch (error) {
      console.error('[ContentGenerationService] Generate study tips failed:', error);
      return {
        success: false,
        tips: 'Practice regularly, take notes, and don\'t hesitate to ask questions.',
      };
    }
  }

  /**
   * Generate exam preparation advice
   */
  async generateExamPrep(examData) {
    try {
      const prompt = fillTemplate('EXAM_PREP_ADVICE', {
        subject: examData.subject || 'Subject',
        examDate: examData.examDate || 'upcoming',
        daysRemaining: examData.daysRemaining || 'N/A',
        currentLevel: examData.currentLevel || 'intermediate',
        topics: examData.topics?.join(', ') || 'All topics',
      });

      const result = await this.aiService.generateContent(prompt, {
        temperature: 0.6,
        maxTokens: 800,
      });

      return {
        success: true,
        plan: result.content,
      };
    } catch (error) {
      console.error('[ContentGenerationService] Generate exam prep failed:', error);
      return {
        success: false,
        plan: 'Create a study schedule, review past materials, and practice regularly.',
      };
    }
  }

  /**
   * Generate FAQ answers
   */
  async answerFAQ(question, context = {}) {
    try {
      const contextStr = context.userType === 'tutor'
        ? 'Answer from a tutor\'s perspective'
        : 'Answer from a student\'s perspective';

      const prompt = `Answer this frequently asked question about the Tu2tor platform:

Question: "${question}"
Context: ${contextStr}

Platform info:
- Peer-to-peer student tutoring at Temasek Polytechnic
- Credit-based system (no real money)
- Book sessions, leave reviews, send messages
- All tutors are fellow students

Requirements:
- Clear, concise answer (2-3 sentences)
- Friendly, helpful tone
- Include actionable advice if applicable`;

      const result = await this.aiService.generateContent(prompt, {
        temperature: 0.6,
        maxTokens: 300,
      });

      return {
        success: true,
        answer: result.content,
      };
    } catch (error) {
      console.error('[ContentGenerationService] Answer FAQ failed:', error);
      return {
        success: false,
        answer: 'Please check our help documentation or contact support for assistance.',
      };
    }
  }
}

export default ContentGenerationService;
