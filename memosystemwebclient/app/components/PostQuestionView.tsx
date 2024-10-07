// components/PostQuestionView.tsx
import { useState } from "react";

interface QuestionForm {
    author: string;
    questionText: string;
    courseCode: string;
    section: string;
}

export default function PostQuestionView() {
    const [formData, setFormData] = useState<QuestionForm>({
        author: "",
        questionText: "",
        courseCode: "",
        section: "",
    });
    const [showModal, setShowModal] = useState(false);
    const [submissionError, setSubmissionError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Handle form input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Handle form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setShowModal(true); // Show the confirmation modal
    };

    // Confirm submission
    const handleConfirmSubmit = async () => {
        setIsSubmitting(true);
        try {
            const response = await fetch("http://localhost:9090/questions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Error ${response.status}: ${text}`);
            }

            // Optionally clear the form after successful submission
            setFormData({
                author: "",
                questionText: "",
                courseCode: "",
                section: "",
            });
            setShowModal(false);
            alert("Question submitted successfully!"); // Or use a notification
        } catch (err: unknown) {
            if (err instanceof Error) {
                setSubmissionError(`Failed to submit question: ${err.message}`);
            } else {
                setSubmissionError("Failed to submit question: An unknown error occurred.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            <h2 className="text-black text-xl font-bold">Post Question 📝</h2>
            {submissionError && <p className="text-red-500">{submissionError}</p>}
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <div>
                    <label className="block text-gray-700">
                        Author 👤
                        <input
                            type="text"
                            name="author"
                            value={formData.author}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full border border-gray-300 p-2 rounded"
                        />
                    </label>
                </div>
                <div>
                    <label className="block text-gray-700">
                        Question Text ❓
                        <textarea
                            name="questionText"
                            value={formData.questionText}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full border border-gray-300 p-2 rounded"
                        />
                    </label>
                </div>
                <div>
                    <label className="block text-gray-700">
                        Course Code 📚
                        <input
                            type="text"
                            name="courseCode"
                            value={formData.courseCode}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full border border-gray-300 p-2 rounded"
                        />
                    </label>
                </div>
                <div>
                    <label className="block text-gray-700">
                        Section 🏷️
                        <input
                            type="text"
                            name="section"
                            value={formData.section}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full border border-gray-300 p-2 rounded"
                        />
                    </label>
                </div>
                <button
                    type="submit"
                    className="mt-4 bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Submitting..." : "Submit Question"}
                </button>
            </form>

            {/* Confirmation Modal */}
            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-5 rounded shadow-lg">
                        <h3 className="text-black font-bold text-lg">Confirm Submission</h3>
                        <p className="text-black">Are you sure you want to submit this question?</p>
                        <div className="flex justify-end mt-4">
                            <button
                                onClick={() => setShowModal(false)}
                                className="mr-2 bg-gray-300 text-black p-2 rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmSubmit}
                                className="bg-blue-500 text-white p-2 rounded"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Submitting..." : "Yes, Submit"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
