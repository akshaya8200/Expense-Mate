import { NextRequest, NextResponse } from 'next/server';

import bcrypt from 'bcryptjs';

import { setAuthCookie } from 'lib/auth';
import prisma from 'lib/prisma';

import messages from 'constants/messages';

type UserData = {
	email: string;
	id: string;
	password_hash: string;
};

export async function POST(request: NextRequest) {
	const { email, password } = await request.json();

	if (!email || !password) {
		return NextResponse.json({ message: 'Email and password are required.' }, { status: 400 });
	}

	const user = (await prisma.users.findFirst({
		where: { email },
		select: { email: true, id: true, password_hash: true },
	})) as UserData;
	if (!user || !user.id) {
		return NextResponse.json({ message: messages.account.doesntexist }, { status: 404 });
	}

	try {
		const isMatch = await bcrypt.compare(String(password), user.password_hash);
		if (!isMatch) {
			return NextResponse.json({ message: 'Invalid email or password.' }, { status: 401 });
		}

		const response = NextResponse.json({ message: 'Signed in successfully.' }, { status: 200 });
		return setAuthCookie(response, user.id);
	} catch (error: any) {
		return NextResponse.json({ message: String(error) || messages.error }, { status: 500 });
	}
}
