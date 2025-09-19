import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../app.js';
import User from '../models/User.js';
import connectDB from '../config/db.js';
import dotenv from 'dotenv';

dotenv.config();
connectDB();

const expect = chai.expect;
chai.use(chaiHttp);

describe('Auth Routes', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  it('should register a new student user', async () => {
    const res = await chai.request(app)
      .post('/api/auth/signup/student')
      .send({
        name: 'Test Student',
        email: 'teststudent@example.com',
        password: 'password123',
        category: 'General',
        skills: 'Node.js, Express',
        education: 'B.Tech',
        locationPreferences: 'Remote',
      });
    expect(res).to.have.status(201);
    expect(res.body).to.have.property('token');
    expect(res.body.user).to.have.property('email').eql('teststudent@example.com');
    expect(res.body.user).to.have.property('role').eql('student');
  });

  it('should register a new industry user', async () => {
    const res = await chai.request(app)
      .post('/api/auth/signup/industry')
      .send({
        name: 'Test Industry Contact',
        email: 'testindustry@example.com',
        password: 'password123',
        companyName: 'Test Corp',
        companyInfo: 'A test company',
      });
    expect(res).to.have.status(201);
    expect(res.body).to.have.property('token');
    expect(res.body.user).to.have.property('email').eql('testindustry@example.com');
    expect(res.body.user).to.have.property('role').eql('industry');
  });

  it('should login an existing student user', async () => {
    // First, register a user
    await chai.request(app)
      .post('/api/auth/signup/student')
      .send({
        name: 'Login Student',
        email: 'loginstudent@example.com',
        password: 'password123',
        category: 'General',
        skills: 'Node.js, Express',
        education: 'B.Tech',
        locationPreferences: 'Remote',
      });

    const res = await chai.request(app)
      .post('/api/auth/login/student')
      .send({
        email: 'loginstudent@example.com',
        password: 'password123',
      });
    expect(res).to.have.status(200);
    expect(res.body).to.have.property('token');
    expect(res.body.user).to.have.property('email').eql('loginstudent@example.com');
  });

  it('should not login with invalid credentials', async () => {
    const res = await chai.request(app)
      .post('/api/auth/login/student')
      .send({
        email: 'nonexistent@example.com',
        password: 'wrongpass',
      });
    expect(res).to.have.status(401);
    expect(res.body).to.have.property('message').eql('Invalid email or password');
  });
});
