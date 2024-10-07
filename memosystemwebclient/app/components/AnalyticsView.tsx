import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartOptions } from 'chart.js';

// Register the necessary components
Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Question {
    question_number: number;
    test_number: string;
    author: string;
    question_text: string;
    course_code: string;
    section: string;
    answer: string | null;
}

export default function AnalyticsView() {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const analyzeData = (data: Question[]) => {
        const sectionCount: Record<string, number> = {};
        const authorCount: Record<string, number> = {};

        data.forEach((question) => {
            sectionCount[question.section] = (sectionCount[question.section] || 0) + 1;
            authorCount[question.author] = (authorCount[question.author] || 0) + 1;
        });

        return { sectionCount, authorCount };
    };

    useEffect(() => {
        const fetchTests = async () => {
            try {
                const response = await fetch("http://localhost:9090/tests");

                if (!response.ok) {
                    const text = await response.text();
                    throw new Error(`Error ${response.status}: ${text}`);
                }

                const data: Question[] = await response.json();
                setQuestions(data);
                setLoading(false);
            } catch (err: unknown) {
                if (err instanceof Error) {
                    setError(`Failed to load tests: ${err.message}`);
                } else {
                    setError("Failed to load tests: An unknown error occurred.");
                }
                setLoading(false);
            }
        };

        fetchTests();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <div className="loader"></div> {/* Your loading spinner */}
            </div>
        );
    }

    if (error) {
        console.error(error); // Log error
        return <p className="text-red-500">Oops! Something went wrong. Please try again later.</p>;
    }

    const { sectionCount, authorCount } = analyzeData(questions);

    const sectionLabels = Object.keys(sectionCount);
    const sectionData = Object.values(sectionCount);
    const authorLabels = Object.keys(authorCount);
    const authorData = Object.values(authorCount);

    const sectionChartData = {
        labels: sectionLabels,
        datasets: [
            {
                label: "Questions by Section",
                data: sectionData,
                backgroundColor: "rgba(75, 192, 192, 0.6)",
            },
        ],
    };

    const authorChartData = {
        labels: authorLabels,
        datasets: [
            {
                label: "Questions by Author",
                data: authorData,
                backgroundColor: "rgba(153, 102, 255, 0.6)",
            },
        ],
    };

    const chartOptions: ChartOptions<'bar'> = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const, // Use 'top' as a literal type
            },
            title: {
                display: true,
                text: 'Analytics Overview',
            },
        },
    };

    return (
        <div className="p-4">
            <h2 className="text-black text-xl font-bold mb-4">Analytics</h2>
            <div className="mb-8">
                <h3 className="text-lg font-semibold mb-2">Questions by Section</h3>
                <Bar data={sectionChartData} options={chartOptions} />
            </div>
            <div className="mb-8">
                <h3 className="text-lg font-semibold mb-2">Questions by Author</h3>
                <Bar data={authorChartData} options={chartOptions} />
            </div>
            <div className="mt-8">
                <h3 className="text-lg font-semibold mb-2">More Coming Soon...</h3>
                <p>Stay tuned for more detailed analytics.</p>
            </div>
        </div>
    );
}
