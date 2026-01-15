import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./tests/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary'],
      include: [
        'src/app.js',
        'src/controllers/authController.js',
        'src/controllers/tutorController.js',
        'src/controllers/todoController.js',
        'src/middleware/auth.js',
        'src/models/User.js',
        'src/models/Tutor.js',
        'src/models/Todo.js',
        'src/routes/authRoutes.js',
        'src/routes/tutorRoutes.js',
        'src/routes/todoRoutes.js'
      ],
      thresholds: {
        lines: 90,
        statements: 90,
        functions: 90,
        branches: 80
      }
    }
  }
});
