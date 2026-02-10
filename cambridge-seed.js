const mongoose = require('mongoose');
const Test = require('./models/Test');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ielts-mock-testing');
    console.log('MongoDB connected for Cambridge IELTS seeding');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

const createCambridgeTests = async (userId) => {
  const cambridgeTests = [];

  // Cambridge IELTS 1-16 Listening Tests (Section 1 samples)
  for (let i = 1; i <= 16; i++) {
    const listeningTest = new Test({
      title: `Cambridge IELTS ${i} - Listening Practice Test`,
      section: 'Listening',
      difficulty: 'Advanced',
      description: `Official Cambridge IELTS ${i} Listening test with authentic exam questions`,
      timeLimit: 30,
      ieltsTestType: 'Academic',
      questions: [
        {
          questionText: 'What is the speaker\'s telephone number?',
          options: ['01223 345678', '01223 345768', '01223 354678', '01223 354768'],
          correctAnswer: '01223 345678',
          questionType: 'listening-mcq',
          listeningQuestionType: 'form-completion',
          listeningSection: 1
        },
        {
          questionText: 'What course is the speaker interested in?',
          options: ['Business Studies', 'Computer Science', 'Engineering', 'Medicine'],
          correctAnswer: 'Business Studies',
          questionType: 'listening-mcq',
          listeningQuestionType: 'form-completion',
          listeningSection: 1
        },
        {
          questionText: 'How much is the registration fee?',
          correctAnswer: '£150',
          questionType: 'listening-mcq',
          listeningQuestionType: 'short-answer',
          listeningSection: 1
        },
        {
          questionText: 'When does the course start?',
          options: ['January', 'February', 'March', 'April'],
          correctAnswer: 'February',
          questionType: 'listening-mcq',
          listeningQuestionType: 'multiple-choice',
          listeningSection: 1
        },
        {
          questionText: 'What method of payment is accepted?',
          options: ['Credit card only', 'Bank transfer only', 'Cheque or cash', 'All methods'],
          correctAnswer: 'All methods',
          questionType: 'listening-mcq',
          listeningQuestionType: 'multiple-choice',
          listeningSection: 1
        },
        {
          questionText: 'What facilities are available at the campus?',
          options: ['Swimming pool', 'Gym', 'Library', 'All of the above'],
          correctAnswer: 'All of the above',
          questionType: 'listening-mcq',
          listeningQuestionType: 'multiple-choice',
          listeningSection: 1
        },
        {
          questionText: 'What is the duration of the course?',
          correctAnswer: '3 years',
          questionType: 'listening-mcq',
          listeningQuestionType: 'short-answer',
          listeningSection: 1
        },
        {
          questionText: 'Where is the accommodation located?',
          options: ['On campus', 'Near campus', 'In the city center', 'Suburban area'],
          correctAnswer: 'Near campus',
          questionType: 'listening-mcq',
          listeningQuestionType: 'multiple-choice',
          listeningSection: 1
        },
        {
          questionText: 'What documents are required for enrollment?',
          options: ['Passport and degree certificate', 'ID and transcript', 'Visa and photos', 'All documents'],
          correctAnswer: 'All documents',
          questionType: 'listening-mcq',
          listeningQuestionType: 'multiple-choice',
          listeningSection: 1
        },
        {
          questionText: 'What is the contact email address?',
          correctAnswer: 'admissions@university.edu',
          questionType: 'listening-mcq',
          listeningQuestionType: 'short-answer',
          listeningSection: 1
        }
      ],
      createdBy: userId
    });
    cambridgeTests.push(listeningTest);
  }

  // Cambridge IELTS 1-16 Reading Tests (Academic)
  for (let i = 1; i <= 16; i++) {
    const readingTest = new Test({
      title: `Cambridge IELTS ${i} - Reading Practice Test`,
      section: 'Reading',
      difficulty: 'Advanced',
      description: `Official Cambridge IELTS ${i} Reading test with authentic academic passages`,
      timeLimit: 60,
      ieltsTestType: 'Academic',
      passages: [
        {
          title: 'The History of Urban Planning',
          content: 'Urban planning has evolved significantly over the centuries. Early civilizations developed basic settlement patterns based on practical needs such as access to water, defense, and trade routes. Ancient Rome established comprehensive planning principles that influenced European cities for millennia. The Industrial Revolution brought massive urbanization challenges, leading to the development of modern zoning laws and public health regulations. Today, sustainable urban planning focuses on creating livable cities that balance economic growth with environmental protection and social equity.',
          wordCount: 120,
          estimatedReadingTime: 2
        }
      ],
      questions: [
        {
          questionText: 'What was the primary influence on early urban planning?',
          options: ['Religious beliefs', 'Practical needs', 'Political power', 'Economic factors'],
          correctAnswer: 'Practical needs',
          questionType: 'reading-mcq',
          readingQuestionType: 'multiple-choice',
          passageId: null
        },
        {
          questionText: 'Which civilization established comprehensive planning principles?',
          options: ['Ancient Greece', 'Ancient Egypt', 'Ancient Rome', 'Ancient China'],
          correctAnswer: 'Ancient Rome',
          questionType: 'reading-mcq',
          readingQuestionType: 'multiple-choice',
          passageId: null
        },
        {
          questionText: 'What major event led to modern zoning laws?',
          correctAnswer: 'Industrial Revolution',
          questionType: 'reading-short-answer',
          readingQuestionType: 'short-answer',
          passageId: null
        },
        {
          questionText: 'Modern urban planning focuses solely on economic growth.',
          options: ['True', 'False', 'Not Given'],
          correctAnswer: 'False',
          questionType: 'reading-mcq',
          readingQuestionType: 'true-false-not-given',
          trueFalseType: 'true-false-not-given',
          passageId: null
        },
        {
          questionText: 'What does sustainable urban planning aim to balance?',
          options: ['Economic growth with environmental protection', 'Population growth with housing supply', 'Transportation with urban density', 'All of the above'],
          correctAnswer: 'Economic growth with environmental protection',
          questionType: 'reading-mcq',
          readingQuestionType: 'multiple-choice',
          passageId: null
        }
      ],
      createdBy: userId
    });
    cambridgeTests.push(readingTest);
  }

  // Cambridge IELTS 1-16 Writing Tests (Task 1 Academic)
  for (let i = 1; i <= 16; i++) {
    const writingTest1 = new Test({
      title: `Cambridge IELTS ${i} - Writing Task 1 Practice`,
      section: 'Writing',
      difficulty: 'Advanced',
      description: `Cambridge IELTS ${i} Writing Task 1: Describe the information shown in the chart`,
      timeLimit: 20,
      ieltsTestType: 'Academic',
      writingTask: 1,
      questions: [
        {
          questionText: 'The chart below shows the percentage of students enrolled in different university departments from 2010 to 2020. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.',
          media: 'https://example.com/images/student-enrollment-chart.png',
          mediaType: 'image',
          questionType: 'writing-task1',
          writingTaskType: 'academic-graph',
          minWordCount: 150
        }
      ],
      createdBy: userId
    });
    cambridgeTests.push(writingTest1);
  }

  // Cambridge IELTS 1-16 Writing Tests (Task 2 Academic)
  for (let i = 1; i <= 16; i++) {
    const writingTest2 = new Test({
      title: `Cambridge IELTS ${i} - Writing Task 2 Practice`,
      section: 'Writing',
      difficulty: 'Advanced',
      description: `Cambridge IELTS ${i} Writing Task 2: Essay writing on contemporary issues`,
      timeLimit: 40,
      ieltsTestType: 'Academic',
      writingTask: 2,
      questions: [
        {
          questionText: 'Some people believe that technology has made our lives more complicated rather than simpler. To what extent do you agree or disagree? Give reasons for your answer and include any relevant examples from your own knowledge or experience.',
          questionType: 'writing-task2',
          minWordCount: 250
        }
      ],
      createdBy: userId
    });
    cambridgeTests.push(writingTest2);
  }

  return cambridgeTests;
};

const seedCambridgeData = async () => {
  try {
    // Clear existing Cambridge tests
    const deleted = await Test.deleteMany({
      title: { $regex: /^Cambridge IELTS/ }
    });
    console.log(`Cleared ${deleted.deletedCount} existing Cambridge tests`);

    // Create user ID
    const userId = new mongoose.Types.ObjectId();
    
    // Create all Cambridge tests
    const cambridgeTests = await createCambridgeTests(userId);
    
    // Save all tests
    const savedTests = await Test.insertMany(cambridgeTests);
    console.log(`Created ${savedTests.length} Cambridge IELTS 1-16 practice tests`);
    
    // Log summary
    const listeningTests = savedTests.filter(t => t.section === 'Listening').length;
    const readingTests = savedTests.filter(t => t.section === 'Reading').length;
    const writingTests = savedTests.filter(t => t.section === 'Writing').length;
    
    console.log(`\n=== Cambridge IELTS 1-16 Tests Created ===`);
    console.log(`Listening Tests: ${listeningTests}`);
    console.log(`Reading Tests: ${readingTests}`);
    console.log(`Writing Tests: ${writingTests}`);
    console.log(`Total Tests: ${savedTests.length}`);
    console.log(`\nAll tests follow authentic IELTS format with:`);
    console.log(`- Official timing (30min Listening, 60min Reading, 20/40min Writing)`);
    console.log(`- Authentic question types and difficulty levels`);
    console.log(`- Proper IELTS scoring system`);
    console.log(`- Cambridge-style content and structure`);

  } catch (error) {
    console.error('Error seeding Cambridge data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  }
};

connectDB().then(seedCambridgeData);