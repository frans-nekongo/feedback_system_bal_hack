// components/MyTestsView.tsx
import { useEffect, useState } from "react";

interface Test {
    question_number: number;
    test_number: string;
    author: string;
    question_text: string;
    course_code: string;
    section: string;
    answer: string | null; // Allow answer to be null
}

export default function MyTestsView() {
    const [tests, setTests] = useState<Test[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [visibleAnswers, setVisibleAnswers] = useState<Set<number>>(new Set());
    const [collapsedTests, setCollapsedTests] = useState<Set<string>>(new Set<string>()); // Explicit type for Set<string>

    useEffect(() => {
        const fetchTests = async () => {
            try {
                const response = await fetch("http://localhost:9090/tests");

                if (!response.ok) {
                    const text = await response.text();
                    throw new Error(`Error ${response.status}: ${text}`);
                }

                const data: Test[] = await response.json();
                setTests(data);

                // Initialize collapsed state for all tests
                const testNumbers = Array.from(new Set<string>(data.map((test) => test.test_number))); // Explicitly typed as string
                setCollapsedTests(new Set<string>(testNumbers)); // Set<string> for collapsed tests
            } catch (err: unknown) {
                if (err instanceof Error) {
                    setError(`Failed to load tests: ${err.message}`);
                } else {
                    setError("Failed to load tests: An unknown error occurred.");
                }
            }
        };

        fetchTests();
    }, []);

    // Function to toggle the visibility of the answer
    const toggleAnswerVisibility = (questionNumber: number) => {
        setVisibleAnswers((prev) => {
            const newVisibleAnswers = new Set(prev);
            if (newVisibleAnswers.has(questionNumber)) {
                newVisibleAnswers.delete(questionNumber); // Hide answer
            } else {
                newVisibleAnswers.add(questionNumber); // Show answer
            }
            return newVisibleAnswers;
        });
    };

    // Function to toggle the collapsed state of tests
    const toggleTestCollapse = (testNumber: string) => {
        setCollapsedTests((prev) => {
            const newCollapsedTests = new Set(prev);
            if (newCollapsedTests.has(testNumber)) {
                newCollapsedTests.delete(testNumber); // Expand
            } else {
                newCollapsedTests.add(testNumber); // Collapse
            }
            return newCollapsedTests;
        });
    };

    // Group questions by test_number
    const groupedTests = tests.reduce<Record<string, Test[]>>((acc, question) => {
        const { test_number } = question;
        if (!acc[test_number]) {
            acc[test_number] = [];
        }
        acc[test_number].push(question);
        return acc;
    }, {});

    return (
        <div className="p-6 bg-gray-100 rounded-lg shadow-md">
            <h2 className="text-black text-2xl font-bold mb-4">My Tests 📝</h2>
            {error && <p className="text-red-500">{error}</p>}

            {/* Render the list of tests */}
            <ul className="list-none">
                {Object.keys(groupedTests).map((testNumber) => (
                    <li key={testNumber} className="mb-6 border-b border-gray-300 pb-4">
                        <h3
                            className="font-semibold text-xl cursor-pointer flex items-center justify-between hover:text-blue-500"
                            onClick={() => toggleTestCollapse(testNumber)}
                        >
                            {`Test ${testNumber}`}
                            <span className="text-lg">
                                {collapsedTests.has(testNumber) ? "▼" : "▲"}
                            </span>
                        </h3>
                        {!collapsedTests.has(testNumber) && (
                            <div className="mt-2 bg-white rounded-lg p-4 shadow-md">
                                {groupedTests[testNumber].map((question) => (
                                    <div key={question.question_number} className="mb-4 border-b border-gray-200 pb-2">
                                        <p className="text-black text-lg">{question.question_text} ❓</p>
                                        <button
                                            onClick={() => toggleAnswerVisibility(question.question_number)}
                                            className="mt-1 text-blue-500 hover:underline"
                                        >
                                            {visibleAnswers.has(question.question_number) ? "Hide Answer 🚫" : "View Answer 👀"}
                                        </button>
                                        {visibleAnswers.has(question.question_number) && question.answer !== null && (
                                            <p className="mt-1 font-semibold text-green-600">
                                                Correct Answer: {question.answer} ✔️
                                            </p>
                                        )}
                                        {visibleAnswers.has(question.question_number) && question.answer === null && (
                                            <p className="mt-1 font-semibold text-gray-500">
                                                No answer available 🚫
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}
