const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Test = require('./models/Test');
const ieltsSampleTests = require('./ielts-sample-tests');

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
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123', // Don't hash here - the model will hash it
      role: 'admin',
      profilePic: '',
      profilePicPublicId: ''
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
          },
          {
            questionText: 'What is the man\'s occupation?',
            options: ['Professor', 'Student advisor', 'Librarian', 'Career counselor'],
            correctAnswer: 'Student advisor'
          },
          {
            questionText: 'When is the application deadline?',
            options: ['Next week', 'Next month', 'In two weeks', 'Tomorrow'],
            correctAnswer: 'Next month'
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
          },
          {
            questionText: 'How much has global temperature increased since pre-industrial times?',
            options: ['0.5°C', '1.1°C', '2.0°C', '3.5°C'],
            correctAnswer: '1.1°C'
          },
          {
            questionText: 'Which sector contributes most to greenhouse gas emissions?',
            options: ['Transportation', 'Agriculture', 'Energy production', 'Manufacturing'],
            correctAnswer: 'Energy production'
          },
          {
            questionText: 'What is the target temperature increase limit according to the Paris Agreement?',
            options: ['1.5°C', '2°C', '2.5°C', '3°C'],
            correctAnswer: '1.5°C'
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
            correctAnswer: 'The chart shows a steady increase in population from 1950 to 2020, with the most rapid growth occurring between 1980 and 2000. The population started at approximately 2.5 billion in 1950 and reached about 7.8 billion by 2020.'
          }
        ],
        createdBy: adminUser._id
      },
      {
        title: 'IELTS Speaking Test - Part 1',
        section: 'Speaking',
        difficulty: 'Intermediate',
        description: 'Practice common speaking topics for IELTS Part 1.',
        timeLimit: 15,
        questions: [
          {
            questionText: 'Tell me about your hometown.',
            options: [],
            correctAnswer: 'My hometown is a beautiful coastal city in the south of the country. It has a population of about 200,000 people and is famous for its beaches and seafood restaurants.'
          },
          {
            questionText: 'What do you like to do in your free time?',
            options: [],
            correctAnswer: 'In my free time, I enjoy reading books, especially fiction and self-help books. I also like to go for walks in the park and spend time with my family.'
          }
        ],
        createdBy: adminUser._id
      },
      {
        title: 'IELTS Listening - Academic Lecture',
        section: 'Listening',
        difficulty: 'Advanced',
        description: 'Listen to an academic lecture on environmental science.',
        timeLimit: 40,
        questions: [
          {
            questionText: 'What is the main focus of the lecture?',
            options: ['Marine biology', 'Climate science', 'Environmental policy', 'Renewable energy'],
            correctAnswer: 'Climate science'
          },
          {
            questionText: 'According to the lecturer, what percentage of climate scientists agree on human-caused global warming?',
            options: ['75%', '85%', '95%', '99%'],
            correctAnswer: '95%'
          },
          {
            questionText: 'What is the primary greenhouse gas mentioned?',
            options: ['Methane', 'Carbon dioxide', 'Nitrous oxide', 'Water vapor'],
            correctAnswer: 'Carbon dioxide'
          },
          {
            questionText: 'What solution does the lecturer emphasize?',
            options: ['Individual action', 'Government policy', 'Technological innovation', 'All of the above'],
            correctAnswer: 'All of the above'
          }
        ],
        createdBy: adminUser._id
      },
      {
        title: 'IELTS Reading - Technology Passage',
        section: 'Reading',
        difficulty: 'Intermediate',
        description: 'Read about the impact of technology on modern society.',
        timeLimit: 50,
        questions: [
          {
            questionText: 'What is the main theme of the passage?',
            options: ['Social media impact', 'Artificial intelligence', 'Digital transformation', 'Technology addiction'],
            correctAnswer: 'Digital transformation'
          },
          {
            questionText: 'According to the text, what has been the biggest change in the last decade?',
            options: ['Mobile technology', 'Cloud computing', 'Social media', 'E-commerce'],
            correctAnswer: 'Mobile technology'
          },
          {
            questionText: 'What concern does the author raise about technology?',
            options: ['Privacy issues', 'Job displacement', 'Social isolation', 'All of the above'],
            correctAnswer: 'All of the above'
          }
        ],
        createdBy: adminUser._id
      }
    ];

    const createdTests = await Test.insertMany(sampleTests);
    console.log(`Created ${createdTests.length} sample tests`);

    // Create regular users for testing
    const regularUser = await User.create({
      name: 'Test User',
      email: 'user@example.com',
      password: 'user123', // Don't hash here - the model will hash it
      role: 'user',
      profilePic: '',
      profilePicPublicId: '',
      testAttempts: [
        {
          testId: createdTests[0]._id,
          score: 85,
          sectionScores: {
            listening: 85
          },
          answers: [
            { 
              questionId: createdTests[0].questions[0]._id, 
              questionText: createdTests[0].questions[0].questionText,
              userAnswer: 'University application', 
              correctAnswer: 'University application',
              isCorrect: true,
              options: createdTests[0].questions[0].options
            },
            { 
              questionId: createdTests[0].questions[1]._id, 
              questionText: createdTests[0].questions[1].questionText,
              userAnswer: 'At a university', 
              correctAnswer: 'At a university',
              isCorrect: true,
              options: createdTests[0].questions[1].options
            },
            { 
              questionId: createdTests[0].questions[2]._id, 
              questionText: createdTests[0].questions[2].questionText,
              userAnswer: 'Business', 
              correctAnswer: 'Business',
              isCorrect: true,
              options: createdTests[0].questions[2].options
            },
            { 
              questionId: createdTests[0].questions[3]._id, 
              questionText: createdTests[0].questions[3].questionText,
              userAnswer: 'Student advisor', 
              correctAnswer: 'Student advisor',
              isCorrect: true,
              options: createdTests[0].questions[3].options
            },
            { 
              questionId: createdTests[0].questions[4]._id, 
              questionText: createdTests[0].questions[4].questionText,
              userAnswer: 'Next month', 
              correctAnswer: 'Next month',
              isCorrect: true,
              options: createdTests[0].questions[4].options
            }
          ],
          timeTaken: 1800,
          date: new Date()
        }
      ]
    });

    // Create another user with multiple attempts
    const user2 = await User.create({
      name: 'Advanced Learner',
      email: 'advanced@example.com',
      password: 'test456', // Don't hash here - the model will hash it
      role: 'user',
      profilePic: '',
      profilePicPublicId: '',
      testAttempts: [
        {
          testId: createdTests[1]._id,
          score: 92,
          sectionScores: {
            reading: 92
          },
          answers: [
            { 
              questionId: createdTests[1].questions[0]._id,
              questionText: createdTests[1].questions[0].questionText,
              userAnswer: 'Industrial activities',
              correctAnswer: 'Industrial activities',
              isCorrect: true,
              options: createdTests[1].questions[0].options
            },
            { 
              questionId: createdTests[1].questions[1]._id,
              questionText: createdTests[1].questions[1].questionText,
              userAnswer: 'All of the above',
              correctAnswer: 'All of the above',
              isCorrect: true,
              options: createdTests[1].questions[1].options
            },
            { 
              questionId: createdTests[1].questions[2]._id,
              questionText: createdTests[1].questions[2].questionText,
              userAnswer: '1.1°C',
              correctAnswer: '1.1°C',
              isCorrect: true,
              options: createdTests[1].questions[2].options
            },
            { 
              questionId: createdTests[1].questions[3]._id,
              questionText: createdTests[1].questions[3].questionText,
              userAnswer: 'Energy production',
              correctAnswer: 'Energy production',
              isCorrect: true,
              options: createdTests[1].questions[3].options
            },
            { 
              questionId: createdTests[1].questions[4]._id,
              questionText: createdTests[1].questions[4].questionText,
              userAnswer: '1.5°C',
              correctAnswer: '1.5°C',
              isCorrect: true,
              options: createdTests[1].questions[4].options
            }
          ],
          timeTaken: 3200,
          date: new Date(Date.now() - 86400000) // 1 day ago
        },
        {
          testId: createdTests[3]._id,
          score: 78,
          sectionScores: {
            speaking: 78
          },
          answers: [
            { 
              questionId: createdTests[3].questions[0]._id,
              questionText: createdTests[3].questions[0].questionText,
              userAnswer: 'My hometown is a beautiful coastal city in the south of the country. It has a population of about 200,000 people and is famous for its beaches and seafood restaurants.',
              correctAnswer: 'My hometown is a beautiful coastal city in the south of the country. It has a population of about 200,000 people and is famous for its beaches and seafood restaurants.',
              isCorrect: true,
              options: []
            },
            { 
              questionId: createdTests[3].questions[1]._id,
              questionText: createdTests[3].questions[1].questionText,
              userAnswer: 'In my free time, I enjoy reading books, especially fiction and self-help books. I also like to go for walks in the park and spend time with my family.',
              correctAnswer: 'In my free time, I enjoy reading books, especially fiction and self-help books. I also like to go for walks in the park and spend time with my family.',
              isCorrect: true,
              options: []
            }
          ],
          timeTaken: 900,
          date: new Date(Date.now() - 172800000) // 2 days ago
        }
      ]
    });

    console.log('Created regular users:', regularUser.email, user2.email);
    console.log('Sample data seeding completed successfully!');

    console.log('\n=== LOGIN CREDENTIALS ===');
    console.log('Admin Login:');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
    console.log('\nUser Login:');
    console.log('Email: user@example.com');
    console.log('Password: user123');
    console.log('\nAdvanced User Login:');
    console.log('Email: advanced@example.com');
    console.log('Password: test456');

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  }
};

connectDB().then(seedData);