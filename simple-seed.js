const mongoose = require('mongoose');
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
    // Clear existing tests
    await Test.deleteMany({});
    console.log('Cleared existing tests');

    // Create a simple test
    const userId = new mongoose.Types.ObjectId();
    
    const simpleTest = new Test({
      title: 'IELTS Listening Practice Test',
      section: 'Listening',
      difficulty: 'Intermediate',
      description: 'Practice your listening skills with this IELTS-style test',
      timeLimit: 30,
      ieltsTestType: 'Academic',
      questions: [
        {
          questionText: 'What is the main topic of the conversation?',
          options: ['Travel planning', 'University application', 'Job interview', 'Shopping'],
          correctAnswer: 'University application',
          questionType: 'listening-mcq',
          listeningQuestionType: 'multiple-choice'
        },
        {
          questionText: 'Where does the conversation take place?',
          options: ['At home', 'In an office', 'At a university', 'In a restaurant'],
          correctAnswer: 'At a university',
          questionType: 'listening-mcq',
          listeningQuestionType: 'multiple-choice'
        },
        {
          questionText: 'What does the woman want to study?',
          options: ['Medicine', 'Engineering', 'Business', 'Literature'],
          correctAnswer: 'Business',
          questionType: 'listening-mcq',
          listeningQuestionType: 'multiple-choice'
        },
        {
          questionText: 'What is the man\'s occupation?',
          options: ['Professor', 'Student advisor', 'Librarian', 'Career counselor'],
          correctAnswer: 'Student advisor',
          questionType: 'listening-mcq',
          listeningQuestionType: 'multiple-choice'
        },
        {
          questionText: 'When is the application deadline?',
          options: ['Next week', 'Next month', 'In two weeks', 'Tomorrow'],
          correctAnswer: 'Next month',
          questionType: 'listening-mcq',
          listeningQuestionType: 'multiple-choice'
        }
      ],
      createdBy: userId
    });

    await simpleTest.save();
    console.log('Created simple IELTS listening test');

    // Create a reading test
    const readingTest = new Test({
      title: 'IELTS Reading Practice Test',
      section: 'Reading',
      difficulty: 'Advanced',
      description: 'Test your reading comprehension with academic passages',
      timeLimit: 60,
      ieltsTestType: 'Academic',
      questions: [
        {
          questionText: 'According to the passage, what is the main cause of climate change?',
          options: ['Natural cycles', 'Industrial activities', 'Volcanic eruptions', 'Solar radiation'],
          correctAnswer: 'Industrial activities',
          questionType: 'reading-mcq',
          readingQuestionType: 'multiple-choice'
        },
        {
          questionText: 'What solution does the author suggest?',
          options: ['Renewable energy', 'Nuclear power', 'Carbon capture', 'All of the above'],
          correctAnswer: 'All of the above',
          questionType: 'reading-mcq',
          readingQuestionType: 'multiple-choice'
        }
      ],
      createdBy: userId
    });

    await readingTest.save();
    console.log('Created IELTS reading test');

    // Create a writing test
    const writingTest = new Test({
      title: 'IELTS Writing Task 1 Practice',
      section: 'Writing',
      difficulty: 'Intermediate',
      description: 'Practice describing charts and graphs in academic writing',
      timeLimit: 20,
      ieltsTestType: 'Academic',
      writingTask: 1,
      questions: [
        {
          questionText: 'Describe the trend shown in the chart about population growth.',
          correctAnswer: 'Sample answer would go here...',
          questionType: 'writing-task1',
          minWordCount: 150
        }
      ],
      createdBy: userId
    });

    await writingTest.save();
    console.log('Created IELTS writing test');

    console.log('Sample data seeding completed successfully!');
    console.log('\nYou can now access the tests in the application.');

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  }
};

connectDB().then(seedData);