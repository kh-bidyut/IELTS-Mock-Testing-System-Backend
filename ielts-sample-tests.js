// Sample IELTS Test Data
const ieltsSampleTests = [
  // IELTS Academic Writing Task 1 - Graph
  {
    title: 'IELTS Academic Writing Task 1: Line Graph',
    section: 'Writing',
    difficulty: 'Intermediate',
    ieltsTestType: 'Academic',
    writingTask: 1,
    description: 'You should spend about 20 minutes on this task. Write at least 150 words.',
    timeLimit: 20,
    questions: [
      {
        questionText: 'The chart below shows the amount of money spent on different consumer goods in five European countries in 2019. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.',
        media: 'https://example.com/sample-graph.jpg',
        mediaType: 'image',
        questionType: 'writing-task1',
        writingTaskType: 'academic-graph',
        minWordCount: 150,
        correctAnswer: 'Sample answer would describe the main trends in spending across countries...'
      }
    ]
  },

  // IELTS Academic Writing Task 2 - Essay
  {
    title: 'IELTS Academic Writing Task 2: Opinion Essay',
    section: 'Writing',
    difficulty: 'Advanced',
    ieltsTestType: 'Academic',
    writingTask: 2,
    description: 'You should spend about 40 minutes on this task. Write at least 250 words.',
    timeLimit: 40,
    questions: [
      {
        questionText: 'Some people believe that unpaid community service should be a compulsory part of high school programs. To what extent do you agree or disagree?',
        questionType: 'writing-task2',
        writingTaskType: 'essay',
        minWordCount: 250,
        correctAnswer: 'Sample essay discussing both sides and presenting a clear position...'
      }
    ]
  },

  // IELTS Speaking Test - Full 3 Parts
  {
    title: 'IELTS Speaking Test: Full Interview',
    section: 'Speaking',
    difficulty: 'Intermediate',
    description: 'Complete IELTS Speaking test with all 3 parts. Total time: 11-14 minutes.',
    timeLimit: 15,
    testParts: [
      {
        partNumber: 1,
        title: 'Part 1: Introduction and Interview',
        description: 'Answer questions about familiar topics (4-5 minutes)',
        timeLimit: 5,
        questions: [
          {
            questionText: 'What is your full name?',
            questionType: 'speaking',
            speakingPart: 1,
            correctAnswer: 'Sample introduction response...'
          },
          {
            questionText: 'Where are you from?',
            questionType: 'speaking',
            speakingPart: 1,
            correctAnswer: 'Sample hometown response...'
          },
          {
            questionText: 'Do you work or study?',
            questionType: 'speaking',
            speakingPart: 1,
            correctAnswer: 'Sample work/study response...'
          }
        ]
      },
      {
        partNumber: 2,
        title: 'Part 2: Individual Long Turn',
        description: 'Speak for 1-2 minutes on a given topic (3-4 minutes total)',
        timeLimit: 4,
        questions: [
          {
            questionText: 'Describe a memorable journey you have taken. You should say: where you went, when you went, who you went with, and explain why it was memorable.',
            questionType: 'speaking',
            speakingPart: 2,
            correctAnswer: 'Sample long turn response with detailed description...'
          }
        ]
      },
      {
        partNumber: 3,
        title: 'Part 3: Two-way Discussion',
        description: 'Discuss more abstract ideas related to Part 2 topic (4-5 minutes)',
        timeLimit: 6,
        questions: [
          {
            questionText: 'Why do you think people enjoy traveling?',
            questionType: 'speaking',
            speakingPart: 3,
            correctAnswer: 'Sample discussion response with opinions and examples...'
          },
          {
            questionText: 'How has travel changed over the past few decades?',
            questionType: 'speaking',
            speakingPart: 3,
            correctAnswer: 'Sample discussion on travel evolution...'
          }
        ]
      }
    ]
  },

  // IELTS General Training Writing Task 1 - Letter
  {
    title: 'IELTS General Training Writing Task 1: Formal Letter',
    section: 'Writing',
    difficulty: 'Intermediate',
    ieltsTestType: 'General Training',
    writingTask: 1,
    description: 'You should spend about 20 minutes on this task. Write at least 150 words.',
    timeLimit: 20,
    questions: [
      {
        questionText: 'You have recently moved to a new city and are looking for a place to live. Write a letter to an accommodation agency. In your letter: describe what kind of accommodation you are looking for, give details of your budget, and explain when you would like to move in.',
        questionType: 'writing-task1',
        writingTaskType: 'general-letter',
        minWordCount: 150,
        correctAnswer: 'Sample formal letter requesting accommodation...'
      }
    ]
  },

  // IELTS Listening Practice
  {
    title: 'IELTS Listening: Academic Lecture',
    section: 'Listening',
    difficulty: 'Advanced',
    description: 'Listen to an academic lecture and answer the questions below.',
    timeLimit: 30,
    questions: [
      {
        questionText: 'What is the main topic of the lecture?',
        options: ['Climate change', 'Renewable energy', 'Environmental policy', 'Sustainable development'],
        correctAnswer: 'Climate change',
        media: 'https://example.com/sample-lecture.mp3',
        mediaType: 'audio',
        questionType: 'listening-mcq'
      },
      {
        questionText: 'According to the lecturer, what percentage of scientists agree on human-caused global warming?',
        options: ['75%', '85%', '95%', '99%'],
        correctAnswer: '95%',
        questionType: 'listening-mcq'
      }
    ]
  },

  // IELTS Reading Practice
  {
    title: 'IELTS Reading: Academic Passage',
    section: 'Reading',
    difficulty: 'Advanced',
    description: 'Read the passage and answer the questions below.',
    timeLimit: 60,
    questions: [
      {
        questionText: 'According to the passage, what is the primary cause of coral bleaching?',
        options: ['Ocean pollution', 'Rising sea temperatures', 'Overfishing', 'Coastal development'],
        correctAnswer: 'Rising sea temperatures',
        questionType: 'reading-mcq',
        media: 'https://example.com/sample-passage.pdf',
        mediaType: 'document'
      }
    ]
  }
];

module.exports = ieltsSampleTests;