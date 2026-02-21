const Database = require('better-sqlite3');
const path = require('path');
const crypto = require('crypto');

const dbPath = path.join(process.cwd(), 'survey.db');
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS surveys (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    questions TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  
  CREATE TABLE IF NOT EXISTS responses (
    id TEXT PRIMARY KEY,
    survey_id TEXT NOT NULL,
    answers TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(survey_id) REFERENCES surveys(id)
  );
`);

const surveyId = crypto.randomUUID();

const mockSurvey = {
    id: surveyId,
    title: 'Future of Work Survey: Remote vs Office',
    description: 'Help us understand your preferences on remote work setup and productivity factors for our annual workplace report.',
    questions: JSON.stringify([
        {
            id: crypto.randomUUID(),
            type: 'multiple_choice',
            text: 'Which environments do you feel most productive in? (Select all that apply)',
            options: ['Home Office', 'Company Office', 'Coffee Shop', 'Co-working Space']
        },
        {
            id: crypto.randomUUID(),
            type: 'single_choice',
            text: 'How many days a week would you prefer to work remotely?',
            options: ['0 days (Full Office)', '1-2 days', '3-4 days', '5 days (Fully Remote)']
        },
        {
            id: crypto.randomUUID(),
            type: 'scale',
            text: 'To what extent do you agree with the following statement: "I feel more productive when working remotely."',
            options: []
        },
        {
            id: crypto.randomUUID(),
            type: 'text',
            text: 'What is the biggest challenge you face when working remotely?'
        }
    ])
};

try {
    const stmt = db.prepare('INSERT INTO surveys (id, title, description, questions) VALUES (?, ?, ?, ?)');
    stmt.run(mockSurvey.id, mockSurvey.title, mockSurvey.description, mockSurvey.questions);
    console.log('✅ Mock survey created successfully!');
    console.log(`\n🔗 Links to share:`);
    console.log(`Survey Link: /survey/${surveyId}`);
    console.log(`Analytics Dashboard: /analytics/${surveyId}`);
} catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_PRIMARYKEY') {
        console.log('Mock survey already exists.');
    } else {
        console.error('Failed to create mock survey:', error);
    }
}
