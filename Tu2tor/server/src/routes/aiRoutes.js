/**
 * AI Routes (Updated)
 * Secure AI API endpoints - API keys never exposed to frontend
 * Includes rate limiting and cost tracking
 */

import express from 'express';
import * as aiController from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';
import { aiRateLimit } from '../ai/middleware/rateLimit.js';
import { checkCostLimit } from '../ai/middleware/costTracking.js';

const router = express.Router();

// === Public Endpoints (No Authentication) ===

// Health check - public endpoint
router.get('/health', aiController.healthCheck);

// Get available providers - public endpoint (non-sensitive info)
router.get('/providers', aiController.getProviders);

// === Protected Endpoints (Require Authentication) ===

// All remaining AI routes require authentication
router.use(protect);

// Apply rate limiting to protected AI routes
router.use(aiRateLimit);

// Apply cost limit checking to protected AI routes
router.use(checkCostLimit);

// === Core AI Endpoints ===

// Generate content (non-streaming)
router.post('/generate', aiController.generateContent);

// Chat with streaming
router.post('/chat', aiController.chat);

// === Study Note Endpoints ===

// Detect academic subject from content
router.post('/detect-subject', aiController.detectSubject);

// Generate study note from conversation
router.post('/generate-note', aiController.generateNote);

// === Provider Management ===

// Switch provider (requires authentication)
router.post('/providers/switch', aiController.switchProvider);

// === Monitoring ===

// Get usage statistics
router.get('/usage', aiController.getUsage);

export default router;
