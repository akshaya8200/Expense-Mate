import { apiUrls } from 'lib/apiUrls';

export const incrementUsage = async () => {
	const res = await fetch(apiUrls.user.usage, { method: 'POST' });
	if (!res.ok) {
		return 'Failed';
	}
	return await res.json();
};
