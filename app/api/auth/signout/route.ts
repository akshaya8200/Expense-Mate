import { NextResponse } from 'next/server';

import { clearAuthCookie } from 'lib/auth';

export async function POST() {
	const response = NextResponse.json({ message: 'Signed out.' }, { status: 200 });
	return clearAuthCookie(response);
}
