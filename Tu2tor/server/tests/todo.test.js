import request from 'supertest';
import { describe, it, beforeAll, afterAll, beforeEach, expect } from 'vitest';
import { createApp } from '../src/app.js';
import { connectTestDb, clearTestDb, disconnectTestDb } from './utils/testDb.js';

const { app } = createApp();

const buildUser = (overrides = {}) => ({
  username: 'todoUser',
  email: 'todo@example.com',
  password: 'Password123!',
  major: 'Information Tech',
  yearOfStudy: 1,
  ...overrides
});

const registerAndLogin = async () => {
  await request(app).post('/api/auth/register').send(buildUser());
  const login = await request(app)
    .post('/api/auth/login')
    .send({ email: 'todo@example.com', password: 'Password123!' });
  return login.body.token;
};

describe('Todo API', () => {
  beforeAll(connectTestDb);
  beforeEach(clearTestDb);
  afterAll(disconnectTestDb);

  it('creates, updates, toggles, and deletes todos', async () => {
    const token = await registerAndLogin();

    const create = await request(app)
      .post('/api/todos')
      .set('Authorization', `Bearer ${token}`)
      .send({ text: 'First todo', priority: 'high' });

    expect(create.status).toBe(201);
    expect(create.body.text).toBe('First todo');
    const todoId = create.body._id;

    const list = await request(app)
      .get('/api/todos')
      .set('Authorization', `Bearer ${token}`);

    expect(list.status).toBe(200);
    expect(list.body.length).toBe(1);

    const update = await request(app)
      .put(`/api/todos/${todoId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ text: 'Updated todo', completed: true });

    expect(update.status).toBe(200);
    expect(update.body.text).toBe('Updated todo');
    expect(update.body.completed).toBe(true);

    const toggle = await request(app)
      .patch(`/api/todos/${todoId}/toggle`)
      .set('Authorization', `Bearer ${token}`);

    expect(toggle.status).toBe(200);
    expect(toggle.body.completed).toBe(false);

    const deleteRes = await request(app)
      .delete(`/api/todos/${todoId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(deleteRes.status).toBe(200);
  });

  it('deletes completed todos in bulk', async () => {
    const token = await registerAndLogin();

    await request(app)
      .post('/api/todos')
      .set('Authorization', `Bearer ${token}`)
      .send({ text: 'Todo one', completed: true });

    await request(app)
      .post('/api/todos')
      .set('Authorization', `Bearer ${token}`)
      .send({ text: 'Todo two', completed: false });

    const cleanup = await request(app)
      .delete('/api/todos/completed/all')
      .set('Authorization', `Bearer ${token}`);

    expect(cleanup.status).toBe(200);
    expect(cleanup.body.deletedCount).toBe(1);
  });
});
