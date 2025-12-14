/**
 * Notes Intelligence Service
 * 
 * AI-powered service for deep analysis and restructuring of study notes.
 * Transforms linear conversation records into structured, hierarchical learning materials.
 */

import aiService from './AIService.js';

/**
 * Intensity levels for restructuring
 */
const RESTRUCTURE_INTENSITY = {
  LIGHT: 'light',     // Quick summary + basic structure
  MEDIUM: 'medium',   // Full concept analysis + knowledge graph
  DEEP: 'deep'        // Complete restructuring + supplemental content
};

/**
 * Extract concepts and their relationships from conversation
 */
async function analyzeConversation(messages, options = {}) {
  console.log('[NotesIntelligence] Analyzing conversation...', {
    messageCount: messages.length,
    intensity: options.intensity || 'medium'
  });

  // Limit conversation length to avoid token overflow
  let conversationText = messages
    .map((m, i) => `${m.role === 'user' ? 'Q' : 'A'}${Math.floor(i/2) + 1}: ${m.content}`)
    .join('\n\n');
  
  // Truncate if too long (keep first ~4000 chars for analysis)
  if (conversationText.length > 4000) {
    console.log('[NotesIntelligence] Truncating conversation for analysis:', conversationText.length, '→ 4000');
    conversationText = conversationText.substring(0, 4000) + '\n\n[... conversation continues ...]';
  }

  const analysisPrompt = `Analyze this conversation. Extract main topic, difficulty, and key concepts.

${conversationText}

Return JSON only:
{
  "mainTopic": "topic",
  "difficulty": "beginner|intermediate|advanced",
  "estimatedReadTime": 5,
  "coreConcepts": [
    {"name": "concept", "category": "definition", "mentioned": true, "explained": true}
  ],
  "supportingConcepts": ["concept1"],
  "practicalSkills": ["skill1"],
  "knowledgeHierarchy": {"parent": null, "children": ["sub1"], "related": ["rel1"]},
  "prerequisites": ["prereq1"],
  "learningObjectives": ["learn to do X"]
}`;

  try {
    const response = await aiService.generateContent(analysisPrompt, {
      maxTokens: 4000, // Large buffer for complete JSON
      temperature: 0.2 // Very low for structured output
    });

    const content = typeof response === 'string' ? response : response.content || response.text || '';
    
    console.log('[NotesIntelligence] AI response length:', content.length);
    console.log('[NotesIntelligence] AI response preview:', content.substring(0, 200));
    
    // Extract JSON from response (handle markdown code blocks)
    let jsonMatch = content.match(/```json\s*(\{[\s\S]*?\})\s*```/);
    if (!jsonMatch) {
      jsonMatch = content.match(/\{[\s\S]*\}/);
    }
    
    if (!jsonMatch) {
      console.error('[NotesIntelligence] No JSON found in response:', content);
      throw new Error('Failed to extract JSON from AI response');
    }

    const jsonText = jsonMatch[1] || jsonMatch[0];
    
    // Try to parse, if fails due to truncation, try to fix
    let analysis;
    try {
      analysis = JSON.parse(jsonText);
    } catch (parseError) {
      console.warn('[NotesIntelligence] JSON parse failed, attempting repair...');
      // If JSON is incomplete, try to close it
      let repairedJson = jsonText;
      
      // Count unclosed braces/brackets
      const openBraces = (repairedJson.match(/\{/g) || []).length;
      const closeBraces = (repairedJson.match(/\}/g) || []).length;
      const openBrackets = (repairedJson.match(/\[/g) || []).length;
      const closeBrackets = (repairedJson.match(/\]/g) || []).length;
      
      // Close arrays first
      for (let i = 0; i < openBrackets - closeBrackets; i++) {
        repairedJson += ']';
      }
      // Then close objects
      for (let i = 0; i < openBraces - closeBraces; i++) {
        repairedJson += '}';
      }
      
      console.log('[NotesIntelligence] Attempting to parse repaired JSON...');
      analysis = JSON.parse(repairedJson);
    }
    
    console.log('[NotesIntelligence] Analysis complete:', {
      mainTopic: analysis.mainTopic,
      conceptCount: analysis.coreConcepts?.length || 0,
      difficulty: analysis.difficulty
    });

    return analysis;
  } catch (error) {
    console.error('[NotesIntelligence] Analysis failed:', error);
    console.error('[NotesIntelligence] Error details:', error.message);
    throw new Error(`Conversation analysis failed: ${error.message}`);
  }
}

/**
 * Build structured learning content from analysis
 */
async function buildStructuredContent(messages, analysis, options = {}) {
  console.log('[NotesIntelligence] Building structured content...', {
    intensity: options.intensity || 'medium',
    mainTopic: analysis.mainTopic
  });

  // Limit conversation text to avoid token overflow
  let conversationText = messages
    .map((m, i) => `${m.role === 'user' ? 'Student' : 'AI'}: ${m.content}`)
    .join('\n\n---\n\n');
  
  // Truncate if too long
  const maxLength = 5000;
  if (conversationText.length > maxLength) {
    console.log('[NotesIntelligence] Truncating conversation for structure:', conversationText.length, '→', maxLength);
    conversationText = conversationText.substring(0, maxLength) + '\n\n[... conversation continues ...]';
  }

  const intensity = options.intensity || RESTRUCTURE_INTENSITY.MEDIUM;
  
  // Build prompt based on intensity
  let structurePrompt = `Transform this conversation into structured learning content.

Topic: ${analysis.mainTopic}
Concepts: ${analysis.coreConcepts?.map(c => c.name).slice(0, 5).join(', ')}
Difficulty: ${analysis.difficulty}

Conversation:
${conversationText}

Create sections for each concept:`;

  if (intensity === RESTRUCTURE_INTENSITY.LIGHT) {
    structurePrompt += `
Each concept needs: definition, example, key takeaway.`;
  } else if (intensity === RESTRUCTURE_INTENSITY.MEDIUM) {
    structurePrompt += `
Each concept needs: definition, importance, usage, example, pitfalls.`;
  } else { // DEEP
    structurePrompt += `
Each concept needs: background, definition, importance, usage, examples, pitfalls, related concepts.
Add: introduction, summary, practice exercises.`;
  }

  structurePrompt += `

IMPORTANT: Respond with ONLY valid JSON. No markdown, no code blocks, just the JSON object.

Format:
{
  "introduction": "string",
  "sections": [
    {
      "concept": "string",
      "definition": "string",
      "importance": "string",
      "usage": "string",
      "examples": ["string"],
      "caveats": ["string"],
      "related": ["string"]
    }
  ],
  "summary": "string",
  "practiceExercises": ["string"]
}`;

  try {
    const response = await aiService.generateContent(structurePrompt, {
      maxTokens: intensity === RESTRUCTURE_INTENSITY.DEEP ? 6000 : 
                 intensity === RESTRUCTURE_INTENSITY.MEDIUM ? 4500 : 3000,
      temperature: 0.3
    });

    const content = typeof response === 'string' ? response : response.content || response.text || '';
    
    console.log('[NotesIntelligence] Structure response length:', content.length);
    console.log('[NotesIntelligence] Structure response preview:', content.substring(0, 200));
    
    // Extract JSON from response (handle markdown code blocks)
    let jsonMatch = content.match(/```json\s*(\{[\s\S]*?\})\s*```/);
    if (!jsonMatch) {
      jsonMatch = content.match(/\{[\s\S]*\}/);
    }
    
    if (!jsonMatch) {
      console.error('[NotesIntelligence] No JSON found in structure response:', content);
      throw new Error('Failed to extract JSON from AI response');
    }

    const jsonText = jsonMatch[1] || jsonMatch[0];
    
    // Try to parse, repair if truncated
    let structure;
    try {
      structure = JSON.parse(jsonText);
    } catch (parseError) {
      console.warn('[NotesIntelligence] JSON parse failed, attempting repair...');
      let repairedJson = jsonText;
      
      // Count and close unclosed structures
      const openBraces = (repairedJson.match(/\{/g) || []).length;
      const closeBraces = (repairedJson.match(/\}/g) || []).length;
      const openBrackets = (repairedJson.match(/\[/g) || []).length;
      const closeBrackets = (repairedJson.match(/\]/g) || []).length;
      
      for (let i = 0; i < openBrackets - closeBrackets; i++) {
        repairedJson += ']';
      }
      for (let i = 0; i < openBraces - closeBraces; i++) {
        repairedJson += '}';
      }
      
      console.log('[NotesIntelligence] Attempting to parse repaired JSON...');
      structure = JSON.parse(repairedJson);
    }
    
    console.log('[NotesIntelligence] Structure built:', {
      sectionCount: structure.sections?.length || 0,
      hasExercises: (structure.practiceExercises?.length || 0) > 0
    });

    return structure;
  } catch (error) {
    console.error('[NotesIntelligence] Structure building failed:', error);
    console.error('[NotesIntelligence] Error details:', error.message);
    throw new Error(`Content structuring failed: ${error.message}`);
  }
}

/**
 * Generate markdown from structured content
 */
function generateMarkdown(structure, analysis, metadata = {}) {
  console.log('[NotesIntelligence] Generating markdown...');

  let markdown = `# ${analysis.mainTopic}\n\n`;

  // Metadata header
  markdown += `> **Difficulty**: ${analysis.difficulty} | `;
  markdown += `**Read Time**: ~${analysis.estimatedReadTime} min | `;
  markdown += `**Date**: ${new Date().toLocaleDateString()}\n\n`;

  if (analysis.prerequisites?.length > 0) {
    markdown += `> **Prerequisites**: ${analysis.prerequisites.join(', ')}\n\n`;
  }

  markdown += `---\n\n`;

  // Introduction
  if (structure.introduction) {
    markdown += `## 📚 Introduction\n\n${structure.introduction}\n\n`;
  }

  // Learning Objectives
  if (analysis.learningObjectives?.length > 0) {
    markdown += `## 🎯 Learning Objectives\n\n`;
    analysis.learningObjectives.forEach(obj => {
      markdown += `- ${obj}\n`;
    });
    markdown += `\n`;
  }

  // Core Concepts
  markdown += `## 📖 Core Concepts\n\n`;

  structure.sections?.forEach((section, index) => {
    markdown += `### ${index + 1}. ${section.concept}\n\n`;

    // Definition
    if (section.definition) {
      markdown += `**Definition:**\n\n${section.definition}\n\n`;
    }

    // Why It Matters
    if (section.importance) {
      markdown += `**Why It Matters:**\n\n${section.importance}\n\n`;
    }

    // How To Use
    if (section.usage) {
      markdown += `**How To Use:**\n\n${section.usage}\n\n`;
    }

    // Examples
    if (section.examples?.length > 0) {
      markdown += `**Examples:**\n\n`;
      section.examples.forEach((example, i) => {
        if (example.includes('```')) {
          markdown += `${example}\n\n`;
        } else {
          markdown += `${i + 1}. ${example}\n\n`;
        }
      });
    }

    // Common Pitfalls
    if (section.caveats?.length > 0) {
      markdown += `**⚠️ Common Pitfalls:**\n\n`;
      section.caveats.forEach(caveat => {
        markdown += `- ${caveat}\n`;
      });
      markdown += `\n`;
    }

    // Related Concepts
    if (section.related?.length > 0) {
      markdown += `**🔗 Related:** ${section.related.join(', ')}\n\n`;
    }

    markdown += `---\n\n`;
  });

  // Summary
  if (structure.summary) {
    markdown += `## 📝 Summary\n\n${structure.summary}\n\n`;
  }

  // Practice Exercises
  if (structure.practiceExercises?.length > 0) {
    markdown += `## 💪 Practice Exercises\n\n`;
    structure.practiceExercises.forEach((exercise, i) => {
      markdown += `${i + 1}. ${exercise}\n\n`;
    });
  }

  // Knowledge Graph
  if (analysis.knowledgeHierarchy) {
    markdown += `## 🌐 Knowledge Map\n\n`;
    const hierarchy = analysis.knowledgeHierarchy;
    
    if (hierarchy.parent) {
      markdown += `**Parent Topic:** ${hierarchy.parent}\n\n`;
    }
    
    if (hierarchy.children?.length > 0) {
      markdown += `**Sub-topics:**\n`;
      hierarchy.children.forEach(child => {
        markdown += `- ${child}\n`;
      });
      markdown += `\n`;
    }
    
    if (hierarchy.related?.length > 0) {
      markdown += `**Related Topics:**\n`;
      hierarchy.related.forEach(rel => {
        markdown += `- ${rel}\n`;
      });
      markdown += `\n`;
    }
  }

  console.log('[NotesIntelligence] Markdown generated:', {
    length: markdown.length,
    sections: structure.sections?.length || 0
  });

  return markdown;
}

/**
 * Main function: Restructure conversation into intelligent study note
 * @param {Array} messages - Conversation messages [{role, content}]
 * @param {Object} options - { intensity: 'light'|'medium'|'deep', subject: string }
 * @returns {Object} Restructured note data
 */
export async function restructureConversation(messages, options = {}) {
  console.log('[NotesIntelligence] Starting conversation restructure...', {
    messageCount: messages.length,
    intensity: options.intensity || 'medium',
    subject: options.subject
  });

  if (!messages || messages.length < 2) {
    throw new Error('At least 2 messages required for restructuring');
  }

  try {
    // Step 1: Analyze conversation
    const analysis = await analyzeConversation(messages, options);

    // Step 2: Build structured content
    const structure = await buildStructuredContent(messages, analysis, options);

    // Step 3: Generate markdown
    const markdown = generateMarkdown(structure, analysis);

    // Step 4: Extract highlights (top concepts)
    const highlights = analysis.coreConcepts
      ?.filter(c => c.explained)
      .slice(0, 5)
      .map(c => c.name) || [];

    // Step 5: Generate tags
    const tags = [
      options.subject || analysis.mainTopic,
      analysis.difficulty,
      ...analysis.coreConcepts?.slice(0, 8).map(c => c.name) || [],
      ...analysis.practicalSkills?.slice(0, 5) || []
    ].filter(Boolean);

    const result = {
      title: analysis.mainTopic,
      subject: options.subject || analysis.mainTopic,
      content: markdown,
      summary: structure.summary || analysis.learningObjectives?.join(' ') || '',
      highlights,
      tags: [...new Set(tags)].slice(0, 15),
      
      // Restructured metadata
      restructured: {
        enabled: true,
        version: 1,
        intensity: options.intensity || RESTRUCTURE_INTENSITY.MEDIUM,
        mainConcepts: analysis.coreConcepts?.map(c => c.name) || [],
        difficulty: analysis.difficulty || 'intermediate',
        estimatedReadTime: analysis.estimatedReadTime || 5,
        prerequisites: analysis.prerequisites || [],
        structure: structure,
        analysis: {
          mainTopic: analysis.mainTopic,
          learningObjectives: analysis.learningObjectives,
          knowledgeHierarchy: analysis.knowledgeHierarchy
        },
        lastRestructured: new Date()
      },

      // Store original messages for potential re-restructuring
      originalMessages: messages.map(m => ({
        role: m.role,
        content: m.content,
        timestamp: m.timestamp || new Date()
      })),

      metadata: {
        questionCount: messages.filter(m => m.role === 'user').length,
        codeBlocks: markdown.match(/```/g)?.length / 2 || 0,
        hasImages: false,
        isRestructured: true,
        restructureIntensity: options.intensity || RESTRUCTURE_INTENSITY.MEDIUM
      }
    };

    console.log('[NotesIntelligence] Restructure complete!', {
      title: result.title,
      conceptCount: result.restructured.mainConcepts.length,
      contentLength: result.content.length
    });

    return result;
  } catch (error) {
    console.error('[NotesIntelligence] Restructure failed:', error);
    throw error;
  }
}

/**
 * Re-restructure existing note with different intensity
 */
export async function reRestructureNote(originalMessages, currentNote, newIntensity) {
  console.log('[NotesIntelligence] Re-restructuring note...', {
    oldIntensity: currentNote.restructured?.intensity,
    newIntensity
  });

  if (!originalMessages || originalMessages.length < 2) {
    throw new Error('Original messages required for re-restructuring');
  }

  return restructureConversation(originalMessages, {
    intensity: newIntensity,
    subject: currentNote.subject
  });
}

/**
 * Compare original conversation with restructured version
 */
export function compareVersions(originalMessages, restructuredNote) {
  const originalText = originalMessages
    .map(m => `${m.role === 'user' ? 'Q' : 'A'}: ${m.content}`)
    .join('\n\n');

  return {
    original: {
      length: originalText.length,
      messageCount: originalMessages.length,
      format: 'linear',
      preview: originalText.substring(0, 500) + '...'
    },
    restructured: {
      length: restructuredNote.content.length,
      conceptCount: restructuredNote.restructured?.mainConcepts?.length || 0,
      format: 'structured',
      sections: restructuredNote.restructured?.structure?.sections?.length || 0,
      preview: restructuredNote.content.substring(0, 500) + '...'
    },
    improvements: {
      hasIntroduction: !!restructuredNote.restructured?.structure?.introduction,
      hasLearningObjectives: (restructuredNote.restructured?.analysis?.learningObjectives?.length || 0) > 0,
      hasPracticeExercises: (restructuredNote.restructured?.structure?.practiceExercises?.length || 0) > 0,
      hasKnowledgeMap: !!restructuredNote.restructured?.analysis?.knowledgeHierarchy,
      structuredSections: restructuredNote.restructured?.structure?.sections?.length || 0
    }
  };
}

export default {
  restructureConversation,
  reRestructureNote,
  compareVersions,
  RESTRUCTURE_INTENSITY
};

