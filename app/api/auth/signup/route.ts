import { NextRequest, NextResponse } from 'next/server';

import bcrypt from 'bcryptjs';

import prisma from 'lib/prisma';

import messages from 'constants/messages';

export async function POST(request: NextRequest) {
	const { email, password } = await request.json();

	if (!email || !password || String(password).length < 6) {
		return NextResponse.json({ message: 'Email and password (min 6 chars) are required.' }, { status: 400 });
	}

	const user = await prisma.users.findFirst({ where: { email }, select: { email: true } });
	if (user) {
		return NextResponse.json({ message: messages.account.exist }, { status: 409 });
	}

	try {
		const password_hash = await bcrypt.hash(String(password), 10);
		const created = await prisma.users.create({
			data: {
				email,
				password_hash,
			},
			select: { id: true, email: true },
		});

		return NextResponse.json({ message: 'Account created.', email: created.email }, { status: 201 });
	} catch (error: any) {
		return NextResponse.json({ message: String(error) || messages.error }, { status: 500 });
	}
}
