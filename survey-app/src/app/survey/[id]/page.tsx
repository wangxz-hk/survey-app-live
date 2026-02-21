"use client";

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { CheckCircle2 } from 'lucide-react';
import { Survey, Question } from '@/lib/db';

export default function TakeSurvey({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);
    const [survey, setSurvey] = useState<Survey | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        fetch(`/api/surveys?id=${id}`)
            .then(res => res.json())
            .then(data => {
                if (!data.error) {
                    setSurvey({ ...data });
                    setQuestions(JSON.parse(data.questions));
                }
            });
    }, [id]);

    const handleAnswerChange = (qId: string, value: string, isMultiple = false) => {
        setAnswers(prev => {
            if (!isMultiple) return { ...prev, [qId]: value };

            const prevArr = (prev[qId] as string[]) || [];
            if (prevArr.includes(value)) {
                return { ...prev, [qId]: prevArr.filter(v => v !== value) };
            } else {
                return { ...prev, [qId]: [...prevArr, value] };
            }
        });
    };

    const handleSubmit = async () => {
        if (Object.keys(answers).length < questions.length) {
            return alert('Please answer all questions before submitting.');
        }

        setIsSubmitting(true);
        try {
            const responseId = crypto.randomUUID();
            const res = await fetch('/api/responses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: responseId, survey_id: id, answers }),
            });
            if (res.ok) setSubmitted(true);
        } catch (err) {
            alert('Failed to submit response');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!survey) return <div className="container py-20 text-center animate-pulse">Loading Survey...</div>;

    if (submitted) {
        return (
            <div className="container py-20 flex flex-col items-center justify-center animate-in text-center max-w-lg">
                <CheckCircle2 size={80} className="text-secondary mb-6" />
                <h1 className="text-4xl font-heading text-gradient mb-4">Thank You!</h1>
                <p className="text-lg text-muted mb-8">Your response has been successfully recorded.</p>
                <Button onClick={() => router.push(`/analytics/${id}`)} variant="primary">
                    View Results Dashboard
                </Button>
            </div>
        );
    }

    return (
        <div className="container py-12 max-w-3xl animate-in">
            <Card className="mb-8 border-t-8 border-t-primary !rounded-t-sm bg-gradient-to-b from-primary-light/30 to-transparent">
                <h1 className="text-4xl font-heading mb-3">{survey.title}</h1>
                {survey.description && <p className="text-lg text-muted">{survey.description}</p>}
            </Card>

            <div className="flex flex-col gap-6 mb-8">
                {questions.map((q, index) => (
                    <Card key={q.id}>
                        <p className="font-semibold text-lg mb-4">
                            <span className="text-primary mr-2">{index + 1}.</span>
                            {q.text}
                        </p>

                        {q.type === 'text' && (
                            <Input
                                placeholder="Your answer"
                                value={(answers[q.id] as string) || ''}
                                onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                            />
                        )}

                        {q.type === 'single_choice' && (
                            <div className="flex flex-col gap-3">
                                {q.options?.map(opt => (
                                    <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors
                      ${answers[q.id] === opt ? 'border-primary' : 'border-gray-300 group-hover:border-primary-light'}`}>
                                            {answers[q.id] === opt && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                                        </div>
                                        <input
                                            type="radio"
                                            className="hidden"
                                            name={q.id}
                                            checked={answers[q.id] === opt}
                                            onChange={() => handleAnswerChange(q.id, opt)}
                                        />
                                        <span className="text-[1.05rem] group-hover:text-primary transition-colors">{opt}</span>
                                    </label>
                                ))}
                            </div>
                        )}

                        {q.type === 'multiple_choice' && (
                            <div className="flex flex-col gap-3">
                                {q.options?.map(opt => {
                                    const isChecked = ((answers[q.id] as string[]) || []).includes(opt);
                                    return (
                                        <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors
                        ${isChecked ? 'bg-primary border-primary' : 'border-gray-300 group-hover:border-primary-light'}`}>
                                                {isChecked && <CheckCircle2 size={14} className="text-white" />}
                                            </div>
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={isChecked}
                                                onChange={() => handleAnswerChange(q.id, opt, true)}
                                            />
                                            <span className="text-[1.05rem] group-hover:text-primary transition-colors">{opt}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        )}

                        {q.type === 'scale' && (
                            <div className="flex flex-col gap-2 mt-2">
                                <div className="flex justify-between text-xs text-muted font-medium mb-1 px-1 uppercase tracking-wide">
                                    <span>1 - Disagree</span>
                                    <span>10 - Completely Agree</span>
                                </div>
                                <div className="flex justify-between gap-1 sm:gap-2">
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => {
                                        return (
                                            <button
                                                key={num}
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleAnswerChange(q.id, num.toString());
                                                }}
                                                className={`scale-btn ${answers[q.id] === num.toString() ? 'selected' : ''}`}
                                            >
                                                {num}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </Card>
                ))}
            </div>

            <div className="flex justify-end">
                <Button className="px-10 py-3 text-lg" isLoading={isSubmitting} onClick={handleSubmit}>
                    Submit Response
                </Button>
            </div>
        </div>
    );
}
