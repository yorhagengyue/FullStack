import { useState } from 'react';
import { useAI } from '../../context/AIContext';
import aiAPI from '../../services/aiAPI';
import { Sparkles, Loader2, Copy, Check, RefreshCw } from 'lucide-react';

const ContentGenerator = ({ type, data, onGenerated }) => {
  const { isInitialized } = useAI();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [copied, setCopied] = useState(false);

  const getTitle = () => {
    const titles = {
      bio: 'Generate Tutor Bio',
      message: 'Generate Message',
      description: 'Generate Description',
      studyTips: 'Get Study Tips',
      examPrep: 'Create Exam Plan',
    };
    return titles[type] || 'Generate Content';
  };

  const getDescription = () => {
    const descriptions = {
      bio: 'AI will create a professional tutor bio based on your profile',
      message: 'Generate a polite message template for your booking',
      description: 'Create an engaging course description',
      studyTips: 'Get personalized study tips for your subject',
      examPrep: 'Generate a comprehensive exam preparation plan',
    };
    return descriptions[type] || 'Generate content with AI';
  };

  const handleGenerate = async () => {
    if (!isInitialized) return;

    setIsGenerating(true);
    try {
      let prompt = '';
      let content = '';

      switch (type) {
        case 'bio':
          prompt = `Generate a professional tutor bio for a tutor with the following information:
Name: ${data.name || 'Tutor'}
Major: ${data.major || 'Not specified'}
Courses: ${data.courses || 'Not specified'}
Experience: ${data.experience || 'Not specified'}

Create a friendly, professional bio that highlights their expertise and teaching style. Keep it concise (2-3 paragraphs).`;
          break;
        case 'message':
          prompt = `Generate a polite booking message for the following context:
Tutor: ${data.tutorName || 'Tutor'}
Course: ${data.course || 'Subject'}
Purpose: ${data.purpose || 'Learning session'}

Create a professional yet friendly message expressing interest in booking a tutoring session. Keep it brief and to the point.`;
          break;
        case 'description':
          prompt = `Generate an engaging course description for:
Course Name: ${data.courseName || 'Course'}
Topic: ${data.topic || 'General'}
Level: ${data.level || 'Intermediate'}

Create an informative description that explains what students will learn. Keep it 2-3 paragraphs.`;
          break;
        case 'studyTips':
          prompt = `Generate personalized study tips for:
Subject: ${data.subject || 'General'}
Current Level: ${data.level || 'Intermediate'}
Goals: ${data.goals || 'Improve understanding'}

Provide 5-7 actionable study tips tailored to this subject and level.`;
          break;
        case 'examPrep':
          prompt = `Create a comprehensive exam preparation plan for:
Subject: ${data.subject || 'General'}
Exam Date: ${data.examDate || 'Upcoming'}
Topics: ${data.topics || 'All topics'}

Generate a structured study plan with timeline, key topics, and preparation strategies.`;
          break;
        default:
          setGeneratedContent('Content generation not supported for this type.');
          return;
      }

      const response = await aiAPI.generateContent(prompt, {
        maxTokens: 500,
        temperature: 0.7
      });

      if (response.success && response.content) {
        content = response.content;
        setGeneratedContent(content);
        if (onGenerated) {
          onGenerated(content);
        }
      } else {
        throw new Error('Failed to generate content from AI');
      }
    } catch (error) {
      console.error('[ContentGenerator] Error:', error);
      setGeneratedContent('Failed to generate content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gradient-to-r from-primary-50 to-teal-50 rounded-lg border border-primary-200 p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-primary-600" />
          <div>
            <h4 className="font-semibold text-gray-900">{getTitle()}</h4>
            <p className="text-xs text-gray-600">{getDescription()}</p>
          </div>
        </div>
      </div>

      {!generatedContent ? (
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !isInitialized}
          className="w-full btn-primary flex items-center justify-center space-x-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate with AI</span>
            </>
          )}
        </button>
      ) : (
        <div className="space-y-3">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-900 whitespace-pre-wrap">{generatedContent}</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="flex-1 btn-secondary flex items-center justify-center space-x-2"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </>
              )}
            </button>
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="flex-1 btn-secondary flex items-center justify-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Regenerate</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentGenerator;
