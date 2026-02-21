import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const surveyId = searchParams.get('surveyId');

    try {
        if (!surveyId) {
            return NextResponse.json({ error: 'Survey ID is required' }, { status: 400 });
        }
        const responses = db.prepare('SELECT * FROM responses WHERE survey_id = ? ORDER BY created_at DESC').all(surveyId);
        return NextResponse.json(responses);
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { id, survey_id, answers } = body;

        if (!id || !survey_id || !answers) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const stmt = db.prepare('INSERT INTO responses (id, survey_id, answers) VALUES (?, ?, ?)');
        stmt.run(id, survey_id, JSON.stringify(answers));

        return NextResponse.json({ success: true, id }, { status: 201 });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
