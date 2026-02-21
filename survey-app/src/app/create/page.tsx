"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { PlusCircle, Trash2, GripVertical, CheckCircle } from 'lucide-react';

type QuestionType = 'text' | 'single_choice' | 'multiple_choice' | 'scale';

interface QuestionDraft {
    id: string;
    type: QuestionType;
    text: string;
    options: string[];
}

export default function CreateSurvey() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [questions, setQuestions] = useState<QuestionDraft[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    const addQuestion = (type: QuestionType) => {
        const newQ: QuestionDraft = {
            id: crypto.randomUUID(),
            type,
            text: '',
            options: type === 'text' || type === 'scale' ? [] : ['Option 1']
        };
        setQuestions([...questions, newQ]);
    };

    const updateQuestion = (id: string, updates: Partial<QuestionDraft>) => {
        setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q));
    };

    const removeQuestion = (id: string) => {
        setQuestions(questions.filter(q => q.id !== id));
    };

    const addOption = (qId: string) => {
        setQuestions(questions.map(q => {
            if (q.id === qId) {
                return { ...q, options: [...q.options, `Option ${q.options.length + 1}`] };
            }
            return q;
        }));
    };

    const updateOption = (qId: string, oIndex: number, text: string) => {
        setQuestions(questions.map(q => {
            if (q.id === qId) {
                const newOptions = [...q.options];
                newOptions[oIndex] = text;
                return { ...q, options: newOptions };
            }
            return q;
        }));
    };

    const removeOption = (qId: string, oIndex: number) => {
        setQuestions(questions.map(q => {
            if (q.id === qId) {
                return { ...q, options: q.options.filter((_, i) => i !== oIndex) };
            }
            return q;
        }));
    };

    const handleSave = async () => {
        if (!title) return alert('Please add a survey title');
        if (questions.length === 0) return alert('Please add at least one question');

        setIsSaving(true);
        const id = crypto.randomUUID();
        try {
            const res = await fetch('/api/surveys', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, title, description, questions }),
            });
            if (res.ok) {
                router.push(`/survey/${id}`);
            } else {
                alert('Failed to save survey');
            }
        } catch (err) {
            alert('Error saving survey');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="container py-8 animate-in">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-heading text-primary">Builder</h1>
                <Button onClick={handleSave} isLoading={isSaving} className="gap-2">
                    <CheckCircle size={18} /> Publish Survey
                </Button>
            </div>

            <Card className="mb-8">
                <div className="flex flex-col gap-4">
                    <Input
                        label="Survey Title"
                        placeholder="e.g. Employee Satisfaction"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="text-lg font-bold"
                    />
                    <div className="input-group">
                        <label className="input-label">Description (Optional)</label>
                        <textarea
                            className="textarea"
                            placeholder="Give respondents a little context..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                </div>
            </Card>

            <div className="flex flex-col gap-6 mb-8">
                {questions.map((q, index) => (
                    <Card key={q.id} className="relative group border-l-4 border-l-primary">
                        <div className="absolute left-[-20px] top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab text-muted">
                            <GripVertical size={20} />
                        </div>
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-sm font-semibold text-primary uppercase tracking-wider">
                                Q{index + 1}. {q.type.replace('_', ' ')}
                            </span>
                            <button onClick={() => removeQuestion(q.id)} className="text-red-400 hover:text-red-500 transition-colors">
                                <Trash2 size={18} />
                            </button>
                        </div>

                        <Input
                            placeholder="What is your question?"
                            value={q.text}
                            onChange={(e) => updateQuestion(q.id, { text: e.target.value })}
                            className="mb-4"
                        />

                        {(q.type === 'single_choice' || q.type === 'multiple_choice') && (
                            <div className="flex flex-col gap-3 ml-4">
                                {q.options.map((opt, oIndex) => (
                                    <div key={oIndex} className="flex items-center gap-3">
                                        <div className={`w-4 h-4 border-2 border-primary ${q.type === 'single_choice' ? 'rounded-full' : 'rounded-sm'}`}></div>
                                        <Input
                                            value={opt}
                                            onChange={(e) => updateOption(q.id, oIndex, e.target.value)}
                                            className="flex-1"
                                        />
                                        {q.options.length > 1 && (
                                            <button onClick={() => removeOption(q.id, oIndex)} className="text-muted hover:text-red-500">
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <Button variant="ghost" className="self-start mt-2 text-sm" onClick={() => addOption(q.id)}>
                                    + Add Option
                                </Button>
                            </div>
                        )}

                        {q.type === 'scale' && (
                            <div className="ml-4 mt-2 p-4 bg-gray-50 rounded-md border border-gray-100 flex items-center justify-center text-sm text-muted">
                                Preview: Respondents will see a 1 to 10 rating scale (1 = Disagree, 10 = Completely Agree).
                            </div>
                        )}
                    </Card>
                ))}
            </div>

            <Card className="flex gap-4 justify-center items-center bg-transparent border-dashed border-primary !shadow-none hover:bg-primary-light transition-colors">
                <span className="text-muted font-medium">Add Question:</span>
                <Button variant="secondary" onClick={() => addQuestion('multiple_choice')} className="gap-2">
                    <PlusCircle size={16} /> Checkboxes
                </Button>
                <Button variant="secondary" onClick={() => addQuestion('single_choice')} className="gap-2">
                    <PlusCircle size={16} /> Radio
                </Button>
                <Button variant="secondary" onClick={() => addQuestion('text')} className="gap-2">
                    <PlusCircle size={16} /> Text
                </Button>
                <Button variant="secondary" onClick={() => addQuestion('scale')} className="gap-2">
                    <PlusCircle size={16} /> 1-10 Scale
                </Button>
            </Card>
        </div>
    );
}
