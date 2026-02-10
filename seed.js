const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Test = require('./models/Test');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ielts-mock-testing');
    console.log('MongoDB connected for seeding');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Test.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: adminPassword,
      role: 'admin',
      profilePic: ''
    });

    console.log('Created admin user:', adminUser.email);

    // Create sample tests
    const sampleTests = [
      {
        title: 'IELTS Listening Practice Test 1',
        section: 'Listening',
        difficulty: 'Intermediate',
        description: 'Practice your listening skills with this comprehensive IELTS listening test.',
        timeLimit: 30,
        questions: [
          {
            questionText: 'What is the main topic of the conversation?',
            options: ['Travel planning', 'University application', 'Job interview', 'Shopping'],
            correctAnswer: 'University application'
          },
          {
            questionText: 'Where does the conversation take place?',
            options: ['At home', 'In an office', 'At a university', 'In a restaurant'],
            correctAnswer: 'At a university'
          },
          {
            questionText: 'What does the woman want to study?',
            options: ['Medicine', 'Engineering', 'Business', 'Literature'],
            correctAnswer: 'Business'
          }
        ],
        createdBy: adminUser._id
      },
      {
        title: 'IELTS Reading Comprehension Test',
        section: 'Reading',
        difficulty: 'Advanced',
        description: 'Test your reading comprehension with academic passages.',
        timeLimit: 60,
        questions: [
          {
            questionText: 'According to the passage, what is the main cause of climate change?',
            options: ['Natural cycles', 'Industrial activities', 'Volcanic eruptions', 'Solar radiation'],
            correctAnswer: 'Industrial activities'
          },
          {
            questionText: 'What solution does the author suggest?',
            options: ['Renewable energy', 'Nuclear power', 'Carbon capture', 'All of the above'],
            correctAnswer: 'All of the above'
          }
        ],
        createdBy: adminUser._id
      },
      {
        title: 'IELTS Writing Task 1 Practice',
        section: 'Writing',
        difficulty: 'Intermediate',
        description: 'Practice describing charts and graphs in academic writing.',
        timeLimit: 20,
        questions: [
          {
            questionText: 'Describe the trend shown in the chart about population growth.',
            options: [],
            correctAnswer: 'The chart shows a steady increase in population from 1950 to 2020, with the most rapid growth occurring between 1980 and 2000.'
          }
        ],
        createdBy: adminUser._id
      }
    ];

    const createdTests = await Test.insertMany(sampleTests);
    console.log(`Created ${createdTests.length} sample tests`);

    // Create a regular user for testing
    const userPassword = await bcrypt.hash('user123', 12);
    const regularUser = await User.create({
      name: 'Test User',
      email: 'user@example.com',
      password: userPassword,
      role: 'user',
      profilePic: '',
      testAttempts: [
        {
          testId: createdTests[0]._id,
          score: 85,
          sectionScores: {
            listening: 85
          },
          answers: [
            { questionId: createdTests[0].questions[0]._id, answer: 'University application', isCorrect: true },
            { questionId: createdTests[0].questions[1]._id, answer: 'At a university', isCorrect: true },
            { questionId: createdTests[0].questions[2]._id, answer: 'Business', isCorrect: true }
          ],
          date: new Date()
        }
      ]
    });

    console.log('Created regular user:', regularUser.email);
    console.log('Sample data seeding completed successfully!');

    console.log('\n=== LOGIN CREDENTIALS ===');
    console.log('Admin Login:');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
    console.log('\nUser Login:');
    console.log('Email: user@example.com');
    console.log('Password: user123');

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  }
};

connectDB().then(seedData);