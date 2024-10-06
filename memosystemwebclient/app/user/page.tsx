// app/user/page.js
"use client"; // Client component
import { useState } from "react"; // Import useState for managing state
import CardOption from "../components/CardOption"; // Adjust the path if necessary
import PostQuestionView from "../components/PostQuestionView"; // Import your new view components
import MyTestsView from "../components/MyTestsView";
import SearchCourseView from "../components/SearchCourseView";

export default function UserPage() {
    const [activeView, setActiveView] = useState<"postQuestion" | "myTests" | "searchCourse" | null>(null);

    const handleCardClick = (view: "postQuestion" | "myTests" | "searchCourse") => {
        setActiveView(view); // Set the active view based on which card is clicked
    };

    return (
        <div className="flex min-h-screen">
            {/* Left Div: 1/4 of the screen */}
            <div className="w-1/4 p-4 bg-gray-100">
                <h2 className="text-black text-lg font-bold mb-4">MEMO SYSTEM</h2>
                <CardOption title="Post Question" onClick={() => handleCardClick("postQuestion")} />
                <CardOption title="My Tests" onClick={() => handleCardClick("myTests")} />
                <CardOption title="Search Course" onClick={() => handleCardClick("searchCourse")} />
            </div>

            {/* Right Div: 3/4 of the screen */}
            <div className="w-3/4 p-4 bg-white">
                <h1 className="text-black text-2xl font-bold">Welcome to the User Page!</h1>
                {/* Conditionally render the active view */}
                {activeView === "postQuestion" && <PostQuestionView />}
                {activeView === "myTests" && <MyTestsView />}
                {activeView === "searchCourse" && <SearchCourseView />}
                {/* Show a default message if no view is active */}
                {activeView === null && <p>Please select an option on the left.</p>}
            </div>
        </div>
    );
}
