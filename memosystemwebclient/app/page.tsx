// app/page.tsx or app/home/page.tsx
"use client"; // Mark this file as a client component

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch(`http://localhost:9090/auth?username=${username}&password=${password}`);

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Error ${response.status}: ${text}`);
            }

            const data = await response.json();
            const { userType } = data;

            if (userType === "student") {
                router.push("/user");
            } else if (userType === "lecturer") {
                router.push("/admin");
            } else {
                setError("Unknown user type");
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(`Failed to authenticate: ${err.message}`);
            } else {
                setError("Failed to authenticate: An unknown error occurred.");
            }
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gradient-to-r from-blue-50 to-blue-100">
            <main className="flex flex-col gap-8 w-full max-w-sm bg-white shadow-lg rounded-lg p-8">
                <h1 className="text-3xl font-bold text-gray-800 text-center">Welcome Back! 👋</h1>
                {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
                <form onSubmit={handleSubmit} className="flex flex-col">
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
                            className="text-black mt-1 p-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring focus:ring-blue-300"
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
                            className="text-black mt-1 p-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring focus:ring-blue-300"
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
            <footer className="mt-6 text-center text-gray-500 text-sm">
                &copy; {new Date().getFullYear()} MEMO ME THIS BY FRAN THE HUMAN
            </footer>
        </div>
    );
}
