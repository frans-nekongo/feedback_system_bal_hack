// app/user/page.js
"use client"; // Client component
import {useState} from "react"; // Import useState for managing state
import CardOption from "../components/CardOption"; // Adjust the path if necessary
import PostQuestionView from "../components/PostQuestionView"; // Import your new view components
import MyTestsView from "../components/MyTestsView";
import SearchCourseView from "../components/SearchCourseView";

export default function UserPage() {
    // Set the default active view to "myTests"
    const [activeView, setActiveView] = useState<"postQuestion" | "myTests" | "searchCourse">("myTests");

    const handleCardClick = (view: "postQuestion" | "myTests" | "searchCourse") => {
        setActiveView(view); // Set the active view based on which card is clicked
    };

    return (
        <div className="flex min-h-screen ">
            {/*className="flex flex-col items-center justify-center min-h-screen p-8 bg-gradient-to-r from-blue-50 to-blue-100">*/}
            {/* Left Div: 1/4 of the screen */}
            <div className="w-1/4 p-4 bg-gradient-to-r from-blue-50 to-blue-100">
                <h2 className="text-3xl font-extrabold text-gray-800 mb-6 text-center relative">
  <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
    DFM SYSTEM
  </span>
                    <span
                        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-lg"></span>
                </h2>
                <CardOption title="Post Question" onClick={() => handleCardClick("postQuestion")}/>
                <CardOption title="My Tests" onClick={() => handleCardClick("myTests")}/>
                <CardOption title="Search Course" onClick={() => handleCardClick("searchCourse")}/>
            </div>

            {/* Right Div: 3/4 of the screen */}
            <div className="w-3/4 p-4 bg-white">
                <h1 className="text-3xl font-extrabold text-gray-800 mb-4 text-center relative">
                    <span className="block">Welcome to the User Page!</span>
                    <span
                        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-lg"></span>
                </h1>
                {/* Conditionally render the active view */}
                {activeView === "postQuestion" && <PostQuestionView/>}
                {activeView === "myTests" && <MyTestsView/>}
                {activeView === "searchCourse" && <SearchCourseView/>}
                {/* No need for the default message since we are setting an initial view */}
            </div>
        </div>
    );
}
