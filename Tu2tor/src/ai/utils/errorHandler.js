/**
 * AI Error Handler
 *
 * Handles errors from AI providers with user-friendly messages and recovery strategies
 */

export class AIError extends Error {
  constructor(message, code, provider, originalError = null) {
    super(message);
    this.name = 'AIError';
    this.code = code;
    this.provider = provider;
    this.originalError = originalError;
    this.timestamp = new Date();
    this.recoverable = true;
  }
}

// Error codes
export const ERROR_CODES = {
  // Network errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  CONNECTION_REFUSED: 'CONNECTION_REFUSED',

  // Authentication errors
  INVALID_API_KEY: 'INVALID_API_KEY',
  UNAUTHORIZED: 'UNAUTHORIZED',
  API_KEY_MISSING: 'API_KEY_MISSING',

  // Rate limiting
  RATE_LIMIT: 'RATE_LIMIT',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
  DAILY_LIMIT: 'DAILY_LIMIT',

  // Provider errors
  PROVIDER_UNAVAILABLE: 'PROVIDER_UNAVAILABLE',
  MODEL_NOT_FOUND: 'MODEL_NOT_FOUND',
  INVALID_REQUEST: 'INVALID_REQUEST',

  // Content errors
  CONTENT_FILTERED: 'CONTENT_FILTERED',
  UNSAFE_CONTENT: 'UNSAFE_CONTENT',
  TOO_LONG: 'TOO_LONG',

  // Unknown
  UNKNOWN: 'UNKNOWN',
};

/**
 * Handle AI errors and provide user-friendly messages
 */
export function handleAIError(error, provider = 'unknown') {
  console.error('[AIError]', { error, provider });

  // Determine error type
  const errorInfo = categorizeError(error, provider);

  // Get user-friendly message
  const userMessage = getUserMessage(errorInfo);

  // Determine recovery action
  const recoveryAction = getRecoveryAction(errorInfo);

  return {
    ...errorInfo,
    userMessage,
    recoveryAction,
    timestamp: new Date(),
  };
}

/**
 * Categorize error into specific error type
 */
function categorizeError(error, provider) {
  const errorStr = error.toString().toLowerCase();
  const message = error.message?.toLowerCase() || '';

  // Network errors
  if (error.code === 'ECONNREFUSED' || errorStr.includes('econnrefused')) {
    return {
      code: ERROR_CODES.CONNECTION_REFUSED,
      provider,
      message: 'Cannot connect to AI service',
      recoverable: true,
      severity: 'high',
    };
  }

  if (error.code === 'ETIMEDOUT' || errorStr.includes('timeout')) {
    return {
      code: ERROR_CODES.TIMEOUT,
      provider,
      message: 'Request timed out',
      recoverable: true,
      severity: 'medium',
    };
  }

  if (errorStr.includes('network') || errorStr.includes('fetch failed')) {
    return {
      code: ERROR_CODES.NETWORK_ERROR,
      provider,
      message: 'Network error occurred',
      recoverable: true,
      severity: 'high',
    };
  }

  // Authentication errors
  if (
    message.includes('api key') ||
    message.includes('apikey') ||
    message.includes('invalid key')
  ) {
    return {
      code: ERROR_CODES.INVALID_API_KEY,
      provider,
      message: 'Invalid or missing API key',
      recoverable: false,
      severity: 'critical',
    };
  }

  if (errorStr.includes('unauthorized') || error.response?.status === 401) {
    return {
      code: ERROR_CODES.UNAUTHORIZED,
      provider,
      message: 'Unauthorized access',
      recoverable: false,
      severity: 'high',
    };
  }

  // Rate limiting
  if (
    message.includes('rate limit') ||
    message.includes('too many requests') ||
    error.response?.status === 429
  ) {
    return {
      code: ERROR_CODES.RATE_LIMIT,
      provider,
      message: 'Rate limit exceeded',
      recoverable: true,
      severity: 'medium',
    };
  }

  if (message.includes('quota') || message.includes('exceeded')) {
    return {
      code: ERROR_CODES.QUOTA_EXCEEDED,
      provider,
      message: 'API quota exceeded',
      recoverable: false,
      severity: 'high',
    };
  }

  // Provider-specific
  if (message.includes('model') && message.includes('not found')) {
    return {
      code: ERROR_CODES.MODEL_NOT_FOUND,
      provider,
      message: 'AI model not found',
      recoverable: true,
      severity: 'high',
    };
  }

  if (error.response?.status === 404) {
    return {
      code: ERROR_CODES.PROVIDER_UNAVAILABLE,
      provider,
      message: 'AI provider unavailable',
      recoverable: true,
      severity: 'high',
    };
  }

  // Content errors
  if (message.includes('content') && message.includes('filter')) {
    return {
      code: ERROR_CODES.CONTENT_FILTERED,
      provider,
      message: 'Content was filtered by safety system',
      recoverable: false,
      severity: 'low',
    };
  }

  if (message.includes('too long') || message.includes('max') || message.includes('limit')) {
    return {
      code: ERROR_CODES.TOO_LONG,
      provider,
      message: 'Input too long for model',
      recoverable: true,
      severity: 'medium',
    };
  }

  // Unknown error
  return {
    code: ERROR_CODES.UNKNOWN,
    provider,
    message: error.message || 'Unknown error occurred',
    recoverable: true,
    severity: 'medium',
  };
}

/**
 * Get user-friendly error message
 */
function getUserMessage(errorInfo) {
  const messages = {
    [ERROR_CODES.NETWORK_ERROR]: 'Unable to connect to the AI service. Please check your internet connection.',
    [ERROR_CODES.TIMEOUT]: 'The request took too long. Please try again.',
    [ERROR_CODES.CONNECTION_REFUSED]: errorInfo.provider === 'ollama'
      ? 'Ollama is not running. Please start Ollama on your computer.'
      : 'Cannot connect to the AI service. Please try again later.',
    [ERROR_CODES.INVALID_API_KEY]: 'Invalid API key. Please check your configuration in the .env.local file.',
    [ERROR_CODES.UNAUTHORIZED]: 'Not authorized to use this AI service. Please verify your API key.',
    [ERROR_CODES.API_KEY_MISSING]: 'API key is missing. Please configure it in the .env.local file.',
    [ERROR_CODES.RATE_LIMIT]: 'You\'ve made too many requests. Please wait a moment and try again.',
    [ERROR_CODES.QUOTA_EXCEEDED]: 'You\'ve reached your API usage limit. Please check your account.',
    [ERROR_CODES.DAILY_LIMIT]: 'You\'ve reached your daily usage limit. The limit will reset tomorrow.',
    [ERROR_CODES.PROVIDER_UNAVAILABLE]: `The ${errorInfo.provider} service is temporarily unavailable. Try switching to another provider.`,
    [ERROR_CODES.MODEL_NOT_FOUND]: errorInfo.provider === 'ollama'
      ? `The AI model is not installed. Run: ollama pull llama2`
      : 'The AI model is not available.',
    [ERROR_CODES.INVALID_REQUEST]: 'Invalid request. Please try rephrasing your message.',
    [ERROR_CODES.CONTENT_FILTERED]: 'Your message was filtered by the safety system. Please rephrase and try again.',
    [ERROR_CODES.UNSAFE_CONTENT]: 'This content violates safety guidelines. Please modify your request.',
    [ERROR_CODES.TOO_LONG]: 'Your message is too long. Please try a shorter message.',
    [ERROR_CODES.UNKNOWN]: 'An unexpected error occurred. Please try again.',
  };

  return messages[errorInfo.code] || errorInfo.message;
}

/**
 * Determine recovery action
 */
function getRecoveryAction(errorInfo) {
  const actions = {
    [ERROR_CODES.NETWORK_ERROR]: {
      type: 'retry',
      suggestion: 'Check your internet connection and try again',
    },
    [ERROR_CODES.TIMEOUT]: {
      type: 'retry',
      suggestion: 'Try again with a shorter message',
    },
    [ERROR_CODES.CONNECTION_REFUSED]: errorInfo.provider === 'ollama'
      ? {
          type: 'switch_provider',
          fallback: 'gemini',
          suggestion: 'Switch to online mode or start Ollama',
        }
      : {
          type: 'switch_provider',
          fallback: 'ollama',
          suggestion: 'Switch to offline mode (Ollama)',
        },
    [ERROR_CODES.INVALID_API_KEY]: {
      type: 'configure',
      suggestion: 'Update your API key in .env.local file',
    },
    [ERROR_CODES.RATE_LIMIT]: {
      type: 'wait',
      waitTime: 60000, // 1 minute
      suggestion: 'Wait 1 minute before trying again',
    },
    [ERROR_CODES.QUOTA_EXCEEDED]: {
      type: 'switch_provider',
      fallback: 'ollama',
      suggestion: 'Switch to offline mode (free) or upgrade your API plan',
    },
    [ERROR_CODES.DAILY_LIMIT]: {
      type: 'switch_provider',
      fallback: 'ollama',
      suggestion: 'Switch to offline mode or wait until tomorrow',
    },
    [ERROR_CODES.PROVIDER_UNAVAILABLE]: {
      type: 'switch_provider',
      fallback: errorInfo.provider === 'gemini' ? 'ollama' : 'gemini',
      suggestion: 'Try a different AI provider',
    },
    [ERROR_CODES.MODEL_NOT_FOUND]: errorInfo.provider === 'ollama'
      ? {
          type: 'install',
          suggestion: 'Install the model: ollama pull llama2',
        }
      : {
          type: 'switch_provider',
          fallback: 'ollama',
          suggestion: 'Try a different provider',
        },
    [ERROR_CODES.TOO_LONG]: {
      type: 'modify',
      suggestion: 'Shorten your message and try again',
    },
    [ERROR_CODES.CONTENT_FILTERED]: {
      type: 'modify',
      suggestion: 'Rephrase your message to be more appropriate',
    },
    [ERROR_CODES.UNKNOWN]: {
      type: 'retry',
      suggestion: 'Try again or contact support',
    },
  };

  return actions[errorInfo.code] || { type: 'retry', suggestion: 'Please try again' };
}

/**
 * Create a retry strategy
 */
export class RetryStrategy {
  constructor(maxRetries = 3, baseDelay = 1000) {
    this.maxRetries = maxRetries;
    this.baseDelay = baseDelay;
  }

  async execute(fn, errorHandler = null) {
    let lastError;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;

        if (attempt === this.maxRetries) {
          break;
        }

        // Check if error is retryable
        const errorInfo = categorizeError(error);
        if (!errorInfo.recoverable) {
          break;
        }

        // Exponential backoff
        const delay = this.baseDelay * Math.pow(2, attempt);
        console.log(`[RetryStrategy] Attempt ${attempt + 1} failed, retrying in ${delay}ms...`);

        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    // All retries failed
    if (errorHandler) {
      errorHandler(lastError);
    }

    throw lastError;
  }
}

export default {
  AIError,
  ERROR_CODES,
  handleAIError,
  RetryStrategy,
};
