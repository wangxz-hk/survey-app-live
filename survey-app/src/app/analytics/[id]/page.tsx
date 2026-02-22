"use client";

import { useState, useEffect, use } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Survey, SurveyResponse, Question } from '@/lib/db';
import Link from 'next/link';
import { BarChart3, Users } from 'lucide-react';

export default function Analytics({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [survey, setSurvey] = useState<Survey | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [responses, setResponses] = useState<SurveyResponse[]>([]);

    useEffect(() => {
        // Fetch Survey
        fetch(`/api/surveys?id=${id}`)
            .then(res => res.json())
            .then(data => {
                if (!data.error) {
                    setSurvey(data);
                    setQuestions(JSON.parse(data.questions));
                }
            });

        // Fetch Responses
        fetch(`/api/responses?surveyId=${id}`)
            .then(res => res.json())
            .then(data => {
                if (!data.error) setResponses(data);
            });
    }, [id]);

    if (!survey) return <div className="container py-20 text-center animate-pulse">Loading Analytics...</div>;

    // Aggregate Data
    const getAggregatedData = (qId: string, type: string, options?: string[]) => {
        if (type === 'text') {
            return responses
                .map(r => {
                    const parsed = JSON.parse(r.answers);
                    return parsed[qId] as string;
                })
                .filter(ans => !!ans);
        }

        if (type === 'scale') {
            const numberAnswers = responses
                .map(r => {
                    const parsed = JSON.parse(r.answers);
                    return parseInt(parsed[qId]);
                })
                .filter(n => !isNaN(n));

            const average = numberAnswers.length > 0
                ? (numberAnswers.reduce((sum, val) => sum + val, 0) / numberAnswers.length).toFixed(1)
                : 0;

            const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0 };
            numberAnswers.forEach(n => counts[n]++);
            return { average, counts };
        }

        // For choice questions
        const counts: Record<string, number> = {};
        options?.forEach(opt => counts[opt] = 0);

        responses.forEach(r => {
            const parsed = JSON.parse(r.answers);
            const ans = parsed[qId];
            if (!ans) return;

            if (Array.isArray(ans)) {
                ans.forEach(a => counts[a] = (counts[a] || 0) + 1);
            } else {
                counts[ans] = (counts[ans] || 0) + 1;
            }
        });

        return counts;
    };

    return (
        <div className="container py-12 animate-in max-w-4xl">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-heading text-primary">Analytics Dashboard</h1>
                    <p className="text-muted mt-1">{survey.title}</p>
                </div>
                <Link href={`/survey/${id}`} target="_blank">
                    <Button variant="secondary">Take Survey (Preview)</Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <Card className="flex items-center gap-4 border-l-4 border-l-secondary bg-gradient-to-r from-secondary/10 to-transparent">
                    <div className="p-3 bg-secondary/20 rounded-full text-secondary">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-muted font-medium">Total Responses</p>
                        <p className="text-3xl font-heading">{responses.length}</p>
                    </div>
                </Card>

                <Card className="flex items-center gap-4 border-l-4 border-l-primary bg-gradient-to-r from-primary-light/50 to-transparent">
                    <div className="p-3 bg-primary-light rounded-full text-primary">
                        <BarChart3 size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-muted font-medium">Questions</p>
                        <p className="text-3xl font-heading">{questions.length}</p>
                    </div>
                </Card>
            </div>

            <div className="flex flex-col gap-8">
                {questions.map((q, i) => {
                    const data = getAggregatedData(q.id, q.type, q.options);

                    return (
                        <Card key={q.id}>
                            <h3 className="font-heading text-xl mb-6 flex items-start gap-2">
                                <span className="text-primary">{i + 1}.</span> {q.text}
                            </h3>

                            {q.type === 'text' && (
                                <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                    {(data as string[]).length === 0 ? (
                                        <p className="text-muted italic">No responses yet.</p>
                                    ) : (
                                        (data as string[]).map((ans, i) => (
                                            <div key={i} className="p-3 bg-gray-50 border border-gray-100 rounded-md text-sm">
                                                {ans}
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {q.type !== 'text' && q.type !== 'scale' && (
                                <div>
                                    {Object.keys(data as Record<string, number>).length === 0 ? (
                                        <p className="text-muted italic">No responses yet.</p>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            {Object.entries(data as Record<string, number>).map(([opt, count]) => {
                                                const percentage = responses.length > 0 ? Math.round((count / responses.length) * 100) : 0;
                                                return (
                                                    <div key={opt} style={{ width: '100%', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', padding: '0', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', border: '1px solid var(--border)', height: '3rem' }}>
                                                        <div
                                                            style={{ position: 'absolute', left: 0, top: 0, height: '100%', background: 'var(--primary-light)', width: `${percentage}%`, transition: 'width 1s ease-out' }}
                                                        />
                                                        <div style={{ position: 'relative', zIndex: 10, padding: '0 1rem', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '1rem', fontWeight: 500 }}>
                                                            <span style={{ color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: '1rem' }}>{opt}</span>
                                                            <span style={{ color: 'var(--text-main)', whiteSpace: 'nowrap', fontWeight: 600 }}>{count} ({percentage}%)</span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}

                            {q.type === 'scale' && (
                                <div className="flex flex-col gap-6">
                                    <div className="flex items-end gap-3 pb-6 border-b border-gray-100">
                                        <div className="text-5xl font-heading text-primary">
                                            {(data as any).average}
                                        </div>
                                        <div className="text-muted text-lg mb-1 font-medium">
                                            Average Rating (out of 10)
                                        </div>
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '1.5rem' }}>Score Distribution</p>
                                        <div style={{ display: 'flex', alignItems: 'flex-end', height: '250px', gap: '8px', padding: '15px 5px 0', borderBottom: '2px solid var(--border)', background: 'linear-gradient(to bottom, transparent, var(--bg-input))', borderRadius: '0 0 var(--radius-md) var(--radius-md)' }}>
                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(score => {
                                                const countsHash = (data as any).counts as Record<number, number>;
                                                const currentCount = countsHash[score] || 0;
                                                const totalScaleResponses = Object.values(countsHash).reduce((sum, val) => sum + val, 0);

                                                const percentage = totalScaleResponses > 0 ? Math.round((currentCount / totalScaleResponses) * 100) : 0;
                                                const heightPercent = currentCount > 0 ? Math.max(percentage, 4) : 0;

                                                return (
                                                    <div key={score} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                                                        {percentage > 0 && (
                                                            <div style={{ fontSize: '0.75rem', fontWeight: 700, background: 'var(--bg-card)', padding: '2px 6px', borderRadius: '4px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)', marginBottom: '8px' }}>
                                                                {percentage}%
                                                            </div>
                                                        )}
                                                        <div style={{ width: '100%', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', borderRadius: '4px 4px 0 0', background: currentCount > 0 ? 'var(--bg-card)' : 'transparent', border: currentCount > 0 ? '1px solid var(--border)' : 'none', borderBottom: 'none', height: '100%' }}>
                                                            <div
                                                                style={{ width: '100%', height: `${heightPercent}%`, background: currentCount > 0 ? 'var(--secondary)' : 'transparent', transition: 'height 0.7s ease-out' }}
                                                            />
                                                        </div>
                                                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginTop: '8px' }}>{score}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
