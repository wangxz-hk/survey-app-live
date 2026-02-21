import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    try {
        if (id) {
            const survey = db.prepare('SELECT * FROM surveys WHERE id = ?').get(id);
            if (!survey) {
                return NextResponse.json({ error: 'Survey not found' }, { status: 404 });
            }
            return NextResponse.json(survey);
        } else {
            const surveys = db.prepare('SELECT * FROM surveys ORDER BY created_at DESC').all();
            return NextResponse.json(surveys);
        }
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { id, title, description, questions } = body;

        if (!id || !title || !questions) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const stmt = db.prepare('INSERT INTO surveys (id, title, description, questions) VALUES (?, ?, ?, ?)');
        stmt.run(id, title, description, JSON.stringify(questions));

        return NextResponse.json({ success: true, id }, { status: 201 });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
