// components/MemosDueView.tsx
import { useEffect, useState } from "react";
import ConfirmationDialog from "./ConfirmationDialog";

interface Memo {
    question_number: number;
    test_number: string;
    author: string;
    question_text: string;
    course_code: string;
    section: string;
}

export default function MemosDueView() {
    const [memos, setMemos] = useState<Memo[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState<Memo | null>(null);

    useEffect(() => {
        const fetchMemos = async () => {
            try {
                const response = await fetch("http://localhost:9090/memosDue");

                if (!response.ok) {
                    const text = await response.text();
                    throw new Error(`Error ${response.status}: ${text}`);
                }

                const data = await response.json();
                setMemos(data);
            } catch (err: unknown) {
                if (err instanceof Error) {
                    setError(`Failed to load memos: ${err.message}`);
                } else {
                    setError("Failed to load memos: An unknown error occurred.");
                }
            }
        };

        fetchMemos();
    }, []);

    const groupedMemos = memos.reduce((acc: Record<string, Memo[]>, memo) => {
        if (!acc[memo.test_number]) {
            acc[memo.test_number] = [];
        }
        acc[memo.test_number].push(memo);
        return acc;
    }, {});

    const handleAnswerChange = (questionNumber: number, answer: string) => {
        setAnswers((prev) => ({ ...prev, [questionNumber]: answer }));
    };

    const handlePostAnswer = (question: Memo) => {
        setCurrentQuestion(question);
        setDialogOpen(true);
    };

    const submitAnswer = async () => {
        if (!currentQuestion) return;

        const answerData = {
            testNumber: currentQuestion.test_number,
            questions: [
                {
                    questionNumber: currentQuestion.question_number.toString(),
                    answer: answers[currentQuestion.question_number] || "",
                },
            ],
        };

        try {
            const response = await fetch("http://localhost:9090/memos", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(answerData),
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Error ${response.status}: ${text}`);
            }

            // Optionally, you might want to reset the answers or refresh the data here
            setAnswers((prev) => ({ ...prev, [currentQuestion.question_number]: "" }));
            setDialogOpen(false);
            setCurrentQuestion(null);
            alert("Answer submitted successfully! ✅");
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(`Failed to submit answer: ${err.message}`);
            } else {
                setError("Failed to submit answer: An unknown error occurred.");
            }
        }
    };

    return (
        <div className="p-6 bg-gray-100 rounded-lg shadow-md">
            <h2 className="text-black text-2xl font-bold mb-4">Memos Due 📅</h2>
            {error && <p className="text-red-500">{error}</p>}
            {Object.entries(groupedMemos).map(([testNumber, questions]) => (
                <div key={testNumber} className="mt-4 mb-6 border-b border-gray-300 pb-4">
                    <h3 className="text-black text-lg font-semibold">Test {testNumber}</h3>
                    <ul className="list-none pl-0">
                        {questions.map((question) => (
                            <li key={question.question_number} className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm mb-2">
                                <div className="flex-1">
                                    <p className="text-black">{question.question_text} ❓</p>
                                    <input
                                        type="text"
                                        placeholder="Your answer"
                                        value={answers[question.question_number] || ""}
                                        onChange={(e) => handleAnswerChange(question.question_number, e.target.value)}
                                        className="text-black mt-1 p-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring focus:ring-blue-300"
                                    />
                                </div>
                                <button
                                    onClick={() => handlePostAnswer(question)}
                                    className="ml-2 p-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition duration-200"
                                >
                                    Submit ✍️
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}

            {/* Confirmation Dialog */}
            <ConfirmationDialog
                isOpen={isDialogOpen}
                onClose={() => setDialogOpen(false)}
                onConfirm={submitAnswer}
            />
        </div>
    );
}
