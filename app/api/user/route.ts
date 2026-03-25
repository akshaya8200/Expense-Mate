import { NextRequest, NextResponse } from 'next/server';

import { checkAuth, clearAuthCookie } from 'lib/auth';
import prisma from 'lib/prisma';

import messages from 'constants/messages';

export async function GET() {
	return await checkAuth(async (user: any) => {
		try {
			const data = await prisma.users.findUnique({
				where: { id: user.id },
				select: {
					id: true,
					currency: true,
					locale: true,
					usage: true,
					email: true,
				},
			});
			return NextResponse.json({ ...data, isPremium: false, isPremiumPlanEnded: false }, { status: 200 });
		} catch (error) {
			return NextResponse.json({ error, message: messages.request.failed }, { status: 500 });
		}
	});
}

export async function PATCH(request: NextRequest) {
	const { currency, locale } = await request.json();
	return await checkAuth(async (user: any) => {
		try {
			await prisma.users.update({ data: { currency, locale }, where: { id: user.id } });
			return NextResponse.json('Updated');
		} catch (error) {
			return NextResponse.json({ error, message: messages.request.failed }, { status: 500 });
		}
	});
}

export async function POST(request: NextRequest) {
	return await checkAuth(async (user: any) => {
		try {
			await prisma.users.delete({ where: { id: user.id } });
			const response = NextResponse.json('Deleted');
			return clearAuthCookie(response);
		} catch (error) {
			return NextResponse.json({ error, message: messages.request.failed }, { status: 500 });
		}
	});
}
