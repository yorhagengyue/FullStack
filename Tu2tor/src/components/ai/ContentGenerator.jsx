import { useState } from 'react';
import { useAI } from '../../context/AIContext';
import { ContentGenerationService } from '../../ai/services/ContentGenerationService';
import aiService from '../../ai/services/AIService';
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
      const contentService = new ContentGenerationService(aiService);
      let result;

      switch (type) {
        case 'bio':
          result = await contentService.generateTutorBio(data);
          if (result.success) setGeneratedContent(result.bio);
          break;
        case 'message':
          result = await contentService.generateMessage(data);
          if (result.success) setGeneratedContent(result.message);
          break;
        case 'description':
          result = await contentService.generateCourseDescription(data);
          if (result.success) setGeneratedContent(result.description);
          break;
        case 'studyTips':
          result = await contentService.generateStudyTips(data);
          if (result.success) setGeneratedContent(result.tips);
          break;
        case 'examPrep':
          result = await contentService.generateExamPrep(data);
          if (result.success) setGeneratedContent(result.plan);
          break;
        default:
          setGeneratedContent('Content generation not supported for this type.');
      }

      if (result?.success && onGenerated) {
        onGenerated(generatedContent);
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
