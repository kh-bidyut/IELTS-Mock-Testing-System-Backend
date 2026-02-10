const mongoose = require('mongoose');
const Test = require('./models/Test'); // Old model
const Book = require('./models/Book');
const TestMeta = require('./models/TestMeta');
const Question = require('./models/Question');
const ListeningTest = require('./models/ListeningTest');
const ReadingTest = require('./models/ReadingTest');
const WritingTest = require('./models/WritingTest');
const SpeakingTest = require('./models/SpeakingTest');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ielts-mock-testing');
    console.log('MongoDB connected for migration');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

const migrateData = async () => {
  try {
    console.log('Starting database migration to new structure...\n');
    
    // Clear new collections first
    await Book.deleteMany({});
    await TestMeta.deleteMany({});
    await Question.deleteMany({});
    await ListeningTest.deleteMany({});
    await ReadingTest.deleteMany({});
    await WritingTest.deleteMany({});
    await SpeakingTest.deleteMany({});
    
    console.log('✅ Cleared new collections');
    
    // Get all existing tests
    const existingTests = await Test.find({});
    console.log(`Found ${existingTests.length} existing tests to migrate`);
    
    // Create Cambridge IELTS books
    const books = [];
    for (let i = 1; i <= 16; i++) {
      const book = new Book({
        series: 'Cambridge IELTS',
        bookNumber: i,
        title: `Cambridge IELTS ${i}`,
        testsCount: 4,
        year: 2020 + Math.floor(i/4) // Approximate years
      });
      books.push(book);
    }
    
    const savedBooks = await Book.insertMany(books);
    console.log(`✅ Created ${savedBooks.length} Cambridge books`);
    
    // Migrate tests
    let migratedCount = 0;
    for (const oldTest of existingTests) {
      try {
        // Find appropriate book (Cambridge 1-16)
        const bookIndex = (migratedCount % 16);
        const book = savedBooks[bookIndex];
        
        // Create test metadata
        const testMeta = new TestMeta({
          bookId: book._id,
          testNumber: Math.floor(migratedCount / 16) + 1,
          title: oldTest.title,
          type: 'full_test',
          modules: [oldTest.section.toLowerCase()],
          duration: oldTest.timeLimit,
          ieltsType: oldTest.ieltsTestType || 'Academic',
          difficulty: oldTest.difficulty
        });
        
        const savedTestMeta = await testMeta.save();
        
        // Migrate questions to central bank
        const questionIds = [];
        for (const oldQuestion of oldTest.questions) {
          const question = new Question({
            module: oldTest.section.toLowerCase(),
            type: oldQuestion.questionType.includes('mcq') ? 'mcq' : 
                  oldQuestion.questionType.includes('short') ? 'short_answer' :
                  oldQuestion.questionType.includes('writing') ? 'essay' : 'mcq',
            question: oldQuestion.questionText,
            options: oldQuestion.options || [],
            answer: oldQuestion.correctAnswer,
            keywords: [], // Would need to extract from question text
            marks: 1,
            difficulty: oldTest.difficulty.charAt(0).toUpperCase() + oldTest.difficulty.slice(1).toLowerCase(),
            minWords: oldQuestion.minWordCount || null,
            taskType: (oldQuestion.writingTaskType || '').replace('-', '_') || null,
            speakingPart: oldQuestion.speakingPart || null
          });
          
          const savedQuestion = await question.save();
          questionIds.push(savedQuestion._id);
        }
        
        // Create module-specific test data
        if (oldTest.section === 'Listening') {
          const listeningTest = new ListeningTest({
            testId: savedTestMeta._id,
            timeLimit: oldTest.timeLimit,
            sections: [{
              sectionNumber: 1,
              audioUrl: oldTest.questions[0]?.media || '',
              questionIds: questionIds
            }],
            totalQuestions: questionIds.length
          });
          await listeningTest.save();
        }
        else if (oldTest.section === 'Reading') {
          const readingTest = new ReadingTest({
            testId: savedTestMeta._id,
            timeLimit: oldTest.timeLimit,
            passages: [{
              passageNumber: 1,
              title: 'Reading Passage',
              content: 'Sample passage content would go here...',
              questionIds: questionIds
            }],
            totalQuestions: questionIds.length,
            ieltsType: oldTest.ieltsTestType || 'Academic'
          });
          await readingTest.save();
        }
        else if (oldTest.section === 'Writing') {
          const tasks = [];
          if (oldTest.writingTask === 1) {
            tasks.push({
              taskNumber: 1,
              taskType: oldTest.questions[0]?.writingTaskType || 'academic_graph',
              question: oldTest.questions[0]?.questionText || 'Describe the chart...',
              minWords: oldTest.questions[0]?.minWordCount || 150
            });
          }
          if (oldTest.writingTask === 2) {
            tasks.push({
              taskNumber: 2,
              taskType: 'essay',
              question: oldTest.questions[0]?.questionText || 'Write an essay...',
              minWords: oldTest.questions[0]?.minWordCount || 250
            });
          }
          
          const writingTest = new WritingTest({
            testId: savedTestMeta._id,
            timeLimit: oldTest.timeLimit,
            tasks: tasks,
            ieltsType: oldTest.ieltsTestType || 'Academic'
          });
          await writingTest.save();
        }
        else if (oldTest.section === 'Speaking') {
          const speakingTest = new SpeakingTest({
            testId: savedTestMeta._id,
            parts: [{
              partNumber: 1,
              title: 'Introduction and Interview',
              questions: ['Tell me about your hometown', 'What do you do?']
            }],
            totalParts: 1
          });
          await speakingTest.save();
        }
        
        migratedCount++;
        if (migratedCount % 10 === 0) {
          console.log(`Migrated ${migratedCount} tests...`);
        }
        
      } catch (error) {
        console.error(`Error migrating test ${oldTest._id}:`, error.message);
      }
    }
    
    console.log(`\n🎉 Migration completed successfully!`);
    console.log(`Migrated ${migratedCount} tests to new structure`);
    
    // Show new structure summary
    const bookCount = await Book.countDocuments();
    const testMetaCount = await TestMeta.countDocuments();
    const questionCount = await Question.countDocuments();
    const listeningCount = await ListeningTest.countDocuments();
    const readingCount = await ReadingTest.countDocuments();
    const writingCount = await WritingTest.countDocuments();
    const speakingCount = await SpeakingTest.countDocuments();
    
    console.log(`\n=== NEW DATABASE STRUCTURE ===`);
    console.log(`📁 books: ${bookCount} documents`);
    console.log(`📁 tests: ${testMetaCount} documents`);
    console.log(`📁 questions: ${questionCount} documents`);
    console.log(`📁 listening_tests: ${listeningCount} documents`);
    console.log(`📁 reading_tests: ${readingCount} documents`);
    console.log(`📁 writing_tests: ${writingCount} documents`);
    console.log(`📁 speaking_tests: ${speakingCount} documents`);
    
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  }
};

connectDB().then(migrateData);