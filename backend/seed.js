import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Opportunity from './models/Opportunity.js';
import Application from './models/Application.js';
import MatchResult from './models/MatchResult.js';
import connectDB from './config/db.js';

dotenv.config();

const seedData = async () => {
  try {
    console.log('Seeding database...');

    // Connect to DB for seeding (ensure it's connected before any operations)
    await connectDB();

    // Clear existing data
    await User.deleteMany();
    await Opportunity.deleteMany();
    await Application.deleteMany();
    await MatchResult.deleteMany();

    // Admin User
    const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'adminpass', 10);
    const adminUser = await User.create({
      name: 'Admin User',
      email: process.env.ADMIN_EMAIL || 'admin@example.com',
      password: adminPassword,
      role: 'admin',
    });
    console.log('Admin user created.');

    // Students
    const studentsData = [
      {
        name: 'Alice Student',
        email: 'alice@student.com',
        password: 'password',
        role: 'student',
        category: 'General',
        skills: 'python, machine learning, data analysis',
        education: 'B.Tech Computer Science',
        locationPreferences: 'Bengaluru, Remote', // Use camelCase
      },
      {
        name: 'Bob Student',
        email: 'bob@student.com',
        password: 'password',
        role: 'student',
        category: 'SC',
        skills: 'javascript, react, nodejs',
        education: 'B.Sc Information Technology',
        locationPreferences: 'Mumbai, Pune', // Use camelCase
      },
      {
        name: 'Chandra Student',
        email: 'chandra@student.com',
        password: 'password',
        role: 'student',
        category: 'ST',
        skills: 'java, spring boot, sql',
        education: 'MCA',
        locationPreferences: 'Hyderabad', // Use camelCase
      },
      {
        name: 'Divya Student',
        email: 'divya@student.com',
        password: 'password',
        role: 'student',
        category: 'OBC',
        skills: 'python, react, django, sql',
        education: 'B.E. Software Engineering',
        locationPreferences: 'Bengaluru', // Use camelCase
      },
      {
        name: 'Esha Student',
        email: 'esha@student.com',
        password: 'password',
        role: 'student',
        category: 'PWD',
        skills: 'ui/ux design, figma, prototyping',
        education: 'B.Des Product Design',
        locationPreferences: 'Remote', // Use camelCase
      },
    ];

    const students = await Promise.all(studentsData.map(async (s) => {
      const hashedPassword = await bcrypt.hash(s.password, 10);
      return User.create({ ...s, password: hashedPassword });
    }));
    console.log(`${students.length} student users created.`);

    // Industries
    const industriesData = [
      {
        name: 'Innotech HR',
        email: 'hr@innotech.com',
        password: 'password',
        role: 'industry',
        companyName: 'Innotech Solutions', // Use camelCase
        companyInfo: 'Leading AI startup focusing on smart solutions.', // Use camelCase
      },
      {
        name: 'GreenWorks Rec',
        email: 'rec@greenworks.com',
        password: 'password',
        role: 'industry',
        companyName: 'GreenWorks Environmental', // Use camelCase
        companyInfo: 'Innovating for a sustainable future.', // Use camelCase
      },
      {
        name: 'Finova Talent',
        email: 'talent@finova.com',
        password: 'password',
        role: 'industry',
        companyName: 'Finova Capital', // Use camelCase
        companyInfo: 'Fintech company revolutionizing financial services.', // Use camelCase
      },
      {
        name: 'HealthIQ Careers',
        email: 'careers@healthiq.com',
        password: 'password',
        role: 'industry',
        companyName: 'HealthIQ Labs', // Use camelCase
        companyInfo: 'Pioneering healthtech solutions for better patient care.', // Use camelCase
      },
      {
        name: 'EduSpark HR',
        email: 'hr@eduspark.com',
        password: 'password',
        role: 'industry',
        companyName: 'EduSpark Innovations', // Use camelCase
        companyInfo: 'EdTech platform committed to accessible education.', // Use camelCase
      },
    ];

    const industries = await Promise.all(industriesData.map(async (i) => {
      const hashedPassword = await bcrypt.hash(i.password, 10);
      return User.create({ ...i, password: hashedPassword });
    }));
    console.log(`${industries.length} industry users created.`);

    // Opportunities
    const opportunitiesData = [
      {
        title: 'AI Research Intern',
        company: industries[0]._id,
        location: 'Bengaluru',
        sector: 'AI, Machine Learning',
        duration: '6 months',
        capacity: 3,
        description: 'Work on cutting-edge AI research projects, focusing on natural language processing and computer vision.',
        affirmativeCategory: 'SC', // Use camelCase
      },
      {
        title: 'Environmental Data Analyst Intern',
        company: industries[1]._id,
        location: 'Mumbai',
        sector: 'Environment, Data Analysis',
        duration: '3 months',
        capacity: 2,
        description: 'Analyze environmental data to identify trends and inform sustainability strategies.',
        affirmativeCategory: null,
      },
      {
        title: 'Frontend Developer Intern (Fintech)',
        company: industries[2]._id,
        location: 'Pune',
        sector: 'Finance, Web Development',
        duration: '4 months',
        capacity: 4,
        description: 'Develop responsive and user-friendly interfaces for our fintech platform using React and modern JavaScript.',
        affirmativeCategory: 'OBC', // Use camelCase
      },
      {
        title: 'Healthcare Product Manager Intern',
        company: industries[3]._id,
        location: 'Hyderabad',
        sector: 'Health, Product Management',
        duration: '6 months',
        capacity: 1,
        description: 'Assist in the product lifecycle management for our new healthtech solutions, conducting market research and gathering requirements.',
        affirmativeCategory: null,
      },
      {
        title: 'UX Designer Intern (EdTech)',
        company: industries[4]._id,
        location: 'Remote',
        sector: 'Education, UX/UI Design',
        duration: '3 months',
        capacity: 2,
        description: 'Design intuitive and engaging user experiences for educational applications, from wireframing to high-fidelity prototypes.',
        affirmativeCategory: 'PWD', // Use camelCase
      },
    ];

    await Opportunity.insertMany(opportunitiesData);
    console.log(`${opportunitiesData.length} opportunities created.`);

    console.log('Database seeded successfully!');
    // Do not exit process here, as it might be called from npm script that needs to keep node alive
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
