import { createClient } from '@libsql/client';

// Initialize the libSQL/Turso database connection
const db = createClient({
  url: process.env.TURSO_DATABASE_URL || "file:survey.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Initialize tables if they don't exist
export const initDb = async () => {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS surveys (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      questions TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  await db.execute(`
    CREATE TABLE IF NOT EXISTS responses (
      id TEXT PRIMARY KEY,
      survey_id TEXT NOT NULL,
      answers TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(survey_id) REFERENCES surveys(id)
    );
  `);
};

export interface Question {
  id: string;
  type: 'text' | 'single_choice' | 'multiple_choice' | 'scale';
  text: string;
  options?: string[]; // Used for choice types
}

export interface Survey {
  id: string;
  title: string;
  description: string;
  questions: string; // JSON string of Question[]
  created_at?: string;
}

export interface SurveyResponse {
  id: string;
  survey_id: string;
  answers: string; // JSON string mapping question_id -> answer(s)
  created_at?: string;
}

export default db;
