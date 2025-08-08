import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { createHash } from "crypto";

function getUserHash(email?: string) {
    return email ? createHash("sha256").update(email).digest("hex").slice(0, 10) : "default";
}

export default function useLocalStorage<T>(key: string, initialValue: T) {
    const { data: session } = useSession();
    const [storedValue, setStoredValue] = useState<T>(initialValue);

    useEffect(() => {
        if (typeof window === "undefined") return;
        if (!session || !session.user?.email) return;

        const userHash = getUserHash(session.user.email);
        const keyWithId = `${key}_${userHash}`;

        const item = localStorage.getItem(keyWithId);
        if (item) {
            try {
                const parsed = JSON.parse(item);
                // 🔐 Only overwrite if different
                setStoredValue((prev) => {
                    return JSON.stringify(prev) !== JSON.stringify(parsed) ? parsed : prev;
                });
            } catch (err) {
                console.error("Failed to parse stored value:", err);
            }
        }
    }, [session, key]);

    const setValue = (value: T | ((val: T) => T)) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            
            const userHash = getUserHash(session?.user?.email ?? "default"); // SHA-256 hash
            const keyWithId = `${key}_${userHash}`;
            localStorage.setItem(keyWithId, JSON.stringify(valueToStore));
        } catch (err) {
            console.error(err);
        }
    };

    return [storedValue, setValue] as const;
}