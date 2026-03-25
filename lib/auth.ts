import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import jwt from 'jsonwebtoken';

import messages from 'constants/messages';

import prisma from './prisma';

const AUTH_COOKIE_NAME = 'expense_fyi_auth';
const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

type AuthPayload = {
	userId: string;
};

const getAuthSecret = () => process.env.AUTH_SECRET || 'expense-fyi-local-dev-secret';

export const createAuthToken = (userId: string) => {
	return jwt.sign({ userId }, getAuthSecret(), { expiresIn: '7d' });
};

export const setAuthCookie = (response: NextResponse, userId: string) => {
	const token = createAuthToken(userId);
	response.cookies.set(AUTH_COOKIE_NAME, token, {
		httpOnly: true,
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production',
		path: '/',
		maxAge: AUTH_COOKIE_MAX_AGE,
	});
	return response;
};

export const clearAuthCookie = (response: NextResponse) => {
	response.cookies.set(AUTH_COOKIE_NAME, '', {
		httpOnly: true,
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production',
		path: '/',
		maxAge: 0,
	});
	return response;
};

const getAuthPayload = (): AuthPayload | null => {
	const token = cookies().get(AUTH_COOKIE_NAME)?.value;
	if (!token) {
		return null;
	}

	try {
		return jwt.verify(token, getAuthSecret()) as AuthPayload;
	} catch {
		return null;
	}
};

export const getCurrentUser = async () => {
	const payload = getAuthPayload();
	if (!payload?.userId) {
		return null;
	}

	return await prisma.users.findUnique({
		where: { id: payload.userId },
		select: {
			id: true,
			email: true,
			currency: true,
			locale: true,
			usage: true,
			created_at: true,
			updated_at: true,
		},
	});
};

export const checkAuth = async (callback: Function) => {
	const user = await getCurrentUser();

	if (!user) {
		return NextResponse.json({ message: messages.account.unauthorized }, { status: 401 });
	}

	return callback(user);
};
