import request from 'supertest';
import { app, server } from '../index.js';
import mongoose from 'mongoose';

describe('Health and Readiness APIs', () => {
  afterAll(async () => {
    server.close();
    await mongoose.connection.close();
  });

  it('should return 200 OK for /api/health', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('timestamp');
  });

  it('should return 200 or 503 for /api/health/ready depending on DB connection', async () => {
    const res = await request(app).get('/api/health/ready');
    // It could be 200 if connected, or 503 if disconnected.
    expect([200, 503]).toContain(res.statusCode);
    expect(res.body).toHaveProperty('database');
  });
});
