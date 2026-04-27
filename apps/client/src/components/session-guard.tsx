/**
 * Session Guard Component
 * 
 * This component checks session status on every page load
 * and enforces single-device login by making an API call
 * that triggers the session middleware.
 */

'use client';

import { useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { useRouter, usePathname } from 'next/navigation';

export function SessionGuard() {
    const { getToken, isSignedIn, isLoaded } = useAuth();
    const { user } = useUser();
    const router = useRouter();
    const pathname = usePathname();
    const [hasChecked, setHasChecked] = useState(false);

    useEffect(() => {
        const checkSession = async () => {
            // Skip if not loaded, not signed in, or already checked
            if (!isLoaded || !isSignedIn || !user || hasChecked) {
                return;
            }

            // Skip check on public routes
            const publicRoutes = ['/auth/sign-in', '/auth/sign-up', '/onboarding'];
            if (publicRoutes.some(route => pathname?.startsWith(route))) {
                return;
            }

            try {
                const token = await getToken();

                if (!token) {
                    console.warn('No token available for session check');
                    return;
                }

                console.log('Checking session status...');

                // Make a request to trigger session middleware
                const apiUrl = process.env.NEXT_PUBLIC_API_URL;
                const response = await fetch(`${apiUrl}/users/${user.id}/session-info`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (response.status === 403) {
                    const error = await response.json();

                    if (error.code === 'SINGLE_DEVICE_VIOLATION') {
                        console.warn('Session violation detected - user logged in elsewhere');

                        // User is already logged in on another device
                        alert(
                            'Already Logged In\n\n' +
                            'You are already logged in on another device.\n\n' +
                            `Last login: ${new Date(error.lastLoginAt).toLocaleString()}\n\n` +
                            'This session will be terminated.'
                        );

                        // Redirect to login
                        router.push('/auth/sign-in');
                        return;
                    }
                }

                if (response.ok) {
                    const data = await response.json();
                }

                setHasChecked(true);
            } catch (error) {
                console.error('Session check failed:', error);
                // Don't block user on error, just log it
                setHasChecked(true);
            }
        };

        // Check session when component mounts and dependencies change
        checkSession();
    }, [isLoaded, isSignedIn, user, hasChecked, getToken, router, pathname]);

    // Reset check when user changes
    useEffect(() => {
        setHasChecked(false);
    }, [user?.id]);

    // This component doesn't render anything
    return null;
}
