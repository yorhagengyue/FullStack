import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  toggleTodo,
  deleteCompletedTodos
} from '../controllers/todoController.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// GET /api/todos - Get all todos for current user
router.get('/', getTodos);

// POST /api/todos - Create a new todo
router.post('/', createTodo);

// PUT /api/todos/:id - Update a todo
router.put('/:id', updateTodo);

// PATCH /api/todos/:id/toggle - Toggle todo completion
router.patch('/:id/toggle', toggleTodo);

// DELETE /api/todos/:id - Delete a todo
router.delete('/:id', deleteTodo);

// DELETE /api/todos/completed - Delete all completed todos
router.delete('/completed/all', deleteCompletedTodos);

export default router;

