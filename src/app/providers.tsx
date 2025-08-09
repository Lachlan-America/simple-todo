'use client';

import { UserKeysProvider } from '@/context/UserKeysContext';
import { SessionProvider } from 'next-auth/react';
import React from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
    return <SessionProvider>
        <UserKeysProvider>{children}</UserKeysProvider>
    </SessionProvider>;
}