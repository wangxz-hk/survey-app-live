import { NextResponse } from 'next/server';
import db, { initDb } from '@/lib/db';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const surveyId = searchParams.get('surveyId');

    try {
        await initDb();
        if (!surveyId) {
            return NextResponse.json({ error: 'Survey ID is required' }, { status: 400 });
        }
        const responses = await db.execute({
            sql: 'SELECT * FROM responses WHERE survey_id = ? ORDER BY created_at DESC',
            args: [surveyId]
        });
        return NextResponse.json(responses.rows);
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await initDb();
        const body = await request.json();
        const { id, survey_id, answers } = body;

        if (!id || !survey_id || !answers) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        await db.execute({
            sql: 'INSERT INTO responses (id, survey_id, answers) VALUES (?, ?, ?)',
            args: [id, survey_id, JSON.stringify(answers)]
        });

        return NextResponse.json({ success: true, id }, { status: 201 });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
