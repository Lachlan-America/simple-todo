"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { LogOut } from "lucide-react"; // or any icon library you like
import { FcGoogle } from "react-icons/fc";

export default function AuthButton() {
    const { data: session, status } = useSession();

    if (status === "loading") {
        return <p>Loading...</p>; // or a spinner
    }

    if (session) {
        // User is logged in → show Sign Out button with icon
        return (
            <button
                onClick={() => signOut()}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 rounded hover:bg-red-700 transition"
                aria-label="Sign out"
            >
                <LogOut size={20} />
                Sign Out
            </button>
        );
    }

    // User not logged in → show Sign In button with Google icon
    return (
        <button
            onClick={() => signIn("google")}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition"
            aria-label="Sign in with Google"
        >
            <FcGoogle size={20} className="bg-white rounded-full"/>
            Sign In
        </button>
    );
}