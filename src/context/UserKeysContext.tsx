'use client';

import { useSession } from 'next-auth/react';
import React, { createContext, useContext, useMemo } from 'react';
import { getUserHash } from '@/lib/utils';

type UserKeysContextType = {
    userHash?: string;
    rateLimitKey?: string;
    todoCategoriseKey?: string;
    aiSummaryKey?: string;
    error?: string;
};
const UserKeysContext = createContext<UserKeysContextType>({});

export function UserKeysProvider({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession();

    const value = useMemo(() => {
        if (!session?.user?.email) return {};
        const userHash = getUserHash(session.user.email);
        return {
            userHash: userHash,
            rateLimitKey: `${userHash}:rate-limit`,
            todoCategoriseKey: `${userHash}:categorise`,
            aiSummaryKey: `${userHash}:summary`,
        };
    }, [session?.user?.email]);

    return (
        <UserKeysContext.Provider value={value}>
            {children}
        </UserKeysContext.Provider>
    );
}

export function useUserKeys() {
    return useContext(UserKeysContext);
}