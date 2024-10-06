// app/page.tsx or app/home/page.tsx (depending on your structure)
"use client"; // Mark this file as a client component

import { useState } from "react";
import { useRouter } from "next/navigation"; // Change to next/navigation
import { authenticate } from "./components/auth"; // Adjust the path as necessary

export default function Home() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        const role = authenticate(username, password);

        if (role) {
            // Redirect based on user role
            if (role === "student") {
                router.push("/user");
            } else if (role === "admin") {
                router.push("/admin");
            }
        } else {
            setError("Invalid username or password");
        }
    };

    return (
        <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
                <h1 className="text-3xl font-bold text-gray-800">Welcome Back</h1>
                <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 max-w-sm w-full">
                    {error && <p className="text-red-500 mb-4">{error}</p>}
                    <div className="mb-4">
                        <label htmlFor="user-number" className="block text-sm font-medium text-gray-700">
                            User Number
                        </label>
                        <input
                            type="text"
                            id="user-number"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="mt-1 p-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring focus:ring-blue-300"
                            placeholder="Enter your user number"
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 p-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring focus:ring-blue-300"
                            placeholder="Enter your password"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white font-semibold py-2 rounded-md hover:bg-blue-600 transition duration-200"
                    >
                        Log In
                    </button>
                </form>
            </main>
            <footer className="text-center text-gray-500 text-sm">
                &copy; {new Date().getFullYear()} Your Company Name
            </footer>
        </div>
    );
}
