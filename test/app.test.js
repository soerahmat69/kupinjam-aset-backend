const request = require('supertest');
const app = require('../index');
const session = require('supertest-session')

describe('Endpoint auth', () => {
  it('POST /login', async () => {
    const response = await request(app).post('/login').send({
      username: 'surahmat',
      password: 'gisel123',
    });;
    expect(response.status).toBe(200);
  });
  it('POST /logout', async () => {
    const response = await request(app).post('/logout')
    expect(response.status).toBe(200);
  });
});

describe('Endpoint koordinator/admin', () => {
  let testSession;
  beforeAll(() => {
    testSession = session(app);
  });
  it('GET /profile', async () => {
    await testSession.post('/login').send({
      username: 'surahmat',
      password: 'gisel123',
    });
    const response = await testSession.get('/profile');
    expect(response.status).toBe(200);
     await request(app).post('/logout')
    
  });
  it('GET /admin/dashboard/YEAR/MONTH', async () => {
  
    const response = await testSession.get('/admin/dashboard/0/0');
    expect(response.status).toBe(200);
    await request(app).post('/logout')
  });
  it('GET /adminrequest', async () => {
    await testSession.post('/login').send({
      username: 'surahmat',
      password: 'gisel123',
    });
    const response = await testSession.get('/admin/request');
    expect(response.status).toBe(200);
    await request(app).post('/logout')
  });
  it('GET /admin/sesiguna', async () => {
    await testSession.post('/login').send({
      username: 'surahmat',
      password: 'gisel123',
    });
    const response = await testSession.get('/admin/sesiguna');
    expect(response.status).toBe(200);
    await request(app).post('/logout')
  });
  it('GET /admin/user', async () => {
    await testSession.post('/login').send({
      username: 'surahmat',
      password: 'gisel123',
    });
    const response = await testSession.get('/admin/user');
    expect(response.status).toBe(200);
    await request(app).post('/logout')
  });
  it('GET /admin/user/peminjam', async () => {
    await testSession.post('/login').send({
      username: 'surahmat',
      password: 'gisel123',
    });
    const response = await testSession.get('/admin/user/peminjam');
    expect(response.status).toBe(200);
    await request(app).post('/logout')
  });
  it('GET /admin/user/pengemudi', async () => {
    await testSession.post('/login').send({
      username: 'surahmat',
      password: 'gisel123',
    });
    const response = await testSession.get('/admin/user/pengemudi');
    expect(response.status).toBe(200);
    await request(app).post('/logout')
  });
  it('GET /admin/request/etc', async () => {
    await testSession.post('/login').send({
      username: 'surahmat',
      password: 'gisel123',
    });
    const response = await testSession.get('/admin/request/etc');
    expect(response.status).toBe(200);
    await request(app).post('/logout')
  });
  it('GET /admin/request/status/selesai', async () => {
    await testSession.post('/login').send({
      username: 'surahmat',
      password: 'gisel123',
    });
    const response = await testSession.get('/admin/request/status/selesai');
    expect(response.status).toBe(200);
    await request(app).post('/logout')
  });
  it('GET /admin/sesiguna/status/selesai', async () => {
    await testSession.post('/login').send({
      username: 'surahmat',
      password: 'gisel123',
    });
    const response = await testSession.get('/admin/sesiguna/status/selesai');
    expect(response.status).toBe(200);
    await request(app).post('/logout')
  });
  it('GET /admin/asset/siap', async () => {
    await testSession.post('/login').send({
      username: 'surahmat',
      password: 'gisel123',
    });
    const response = await testSession.get('/admin/asset/siap');
    expect(response.status).toBe(200);
    await request(app).post('/logout')
  });
  it('GET /admin/jabatan', async () => {
    await testSession.post('/login').send({
      username: 'surahmat',
      password: 'gisel123',
    });
    const response = await testSession.get('/admin/jabatan');
    expect(response.status).toBe(200);
    await request(app).post('/logout')
  });
});
