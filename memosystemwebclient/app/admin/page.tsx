// app/admin/page.tsx
"use client"; // This makes it a client component
import { useState } from "react"; // Import useState for managing state
import CardOptionAdmin from "../components/CardOptionAdmin"; // Adjust the path if necessary
import CreateCourseView from "../components/CreateCourseView"; // Import your new view components
import MemosDueView from "../components/MemosDueView";
import AnalyticsView from "../components/AnalyticsView";
import { FaBook, FaClipboardList, FaChartBar } from "react-icons/fa"; // Import your desired icons

export default function AdminPage() {
    // Set the default active view to "memosDue"
    const [activeView, setActiveView] = useState<"createCourse" | "memosDue" | "analytics">("memosDue");

    const handleCardClick = (view: "createCourse" | "memosDue" | "analytics") => {
        setActiveView(view); // Set the active view based on which card is clicked
    };

    return (
        <div className="flex min-h-screen">
            {/* Left Div: 1/4 of the screen */}
            <div className="w-1/4 p-4 bg-gray-100">
                <h2 className="text-black text-lg font-bold mb-4">ADMIN PANEL</h2>
                <CardOptionAdmin
                    title="Create Course"
                    onClick={() => handleCardClick("createCourse")}
                    icon={<FaBook />} // Pass the Create Course icon
                />
                <CardOptionAdmin
                    title="Memos Due"
                    onClick={() => handleCardClick("memosDue")}
                    icon={<FaClipboardList />} // Pass the Memos Due icon
                />
                <CardOptionAdmin
                    title="Analytics"
                    onClick={() => handleCardClick("analytics")}
                    icon={<FaChartBar />} // Pass the Analytics icon
                />
            </div>

            {/* Right Div: 3/4 of the screen */}
            <div className="w-3/4 p-4 bg-white">
                <h1 className="text-black text-2xl font-bold">Welcome to the Admin Page!</h1>
                {/* Conditionally render the active view */}
                {activeView === "createCourse" && <CreateCourseView />}
                {activeView === "memosDue" && <MemosDueView />}
                {activeView === "analytics" && <AnalyticsView />}
                {/* No need for the default message since we are setting an initial view */}
            </div>
        </div>
    );
}
