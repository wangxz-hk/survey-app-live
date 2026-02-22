import { NextResponse } from 'next/server';
import db, { initDb } from '@/lib/db';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    try {
        await initDb();
        if (id) {
            const survey = await db.execute({
                sql: 'SELECT * FROM surveys WHERE id = ?',
                args: [id]
            });
            if (survey.rows.length === 0) {
                return NextResponse.json({ error: 'Survey not found' }, { status: 404 });
            }
            return NextResponse.json(survey.rows[0]);
        } else {
            const surveys = await db.execute('SELECT * FROM surveys ORDER BY created_at DESC');
            return NextResponse.json(surveys.rows);
        }
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await initDb();
        const body = await request.json();
        const { id, title, description, questions } = body;

        if (!id || !title || !questions) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        await db.execute({
            sql: 'INSERT INTO surveys (id, title, description, questions) VALUES (?, ?, ?, ?)',
            args: [id, title, description, JSON.stringify(questions)]
        });

        return NextResponse.json({ success: true, id }, { status: 201 });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
