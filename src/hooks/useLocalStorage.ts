import { useState, useEffect, useMemo, useContext } from "react";
import { useSession } from "next-auth/react";
import { useUserKeys } from "@/context/UserKeysContext";

export default function useLocalStorage<T>(key: string, initialValue: T) {
    const { data: session } = useSession();
    const [storedValue, setStoredValue] = useState<T>(initialValue);
    const { userHash } = useUserKeys();

    useEffect(() => {
        if (typeof window === "undefined") return;
        if (!session || !session.user?.email) return;

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
            
            const keyWithId = `${key}_${userHash}`;
            localStorage.setItem(keyWithId, JSON.stringify(valueToStore));
        } catch (err) {
            console.error(err);
        }
    };

    return [storedValue, setValue] as const;
}