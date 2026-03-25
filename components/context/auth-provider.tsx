'use client';

import { createContext, useContext, useMemo } from 'react';
import { SWRConfig } from 'swr';

import fetcher from 'lib/fetcher';

interface User {
	currency: string;
	locale: string;
	billing_start_date: string;
	trial_start_date: string;
	order_status: string;
	usage: number;
	email: string;
	isPremium: boolean;
	isPremiumPlanEnded: boolean;
}

const AuthContext = createContext(null);

export const AuthProvider = (props: any) => {
	const { user, children, ...others } = props;

	const value = useMemo(() => {
		return {
			initial: false,
			session: { user: { id: user?.id } },
			user,
			signOut: async () => {
				await fetch('/api/auth/signout', { method: 'POST' });
				window.location.href = '/signin';
			},
		};
	}, [user]);

	return (
		<AuthContext.Provider value={value} {...others}>
			<SWRConfig value={{ fetcher }}>{children}</SWRConfig>
		</AuthContext.Provider>
	);
};

export const useUser = () => {
	const context = useContext<any>(AuthContext);
	if (context === undefined) {
		throw new Error(`useUser must be used within a AuthContext.`);
	}
	return context?.user ?? null;
};
