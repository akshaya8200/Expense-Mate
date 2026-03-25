export const apiUrls = {
	user: {
		modify: '/api/user',
		usage: '/api/user/usage',
	},
	auth: {
		signup: '/api/auth/signup',
		signin: '/api/auth/signin',
		signout: '/api/auth/signout',
	},
	expenses: {
		add: '/api/expenses/add',
		modify: '/api/expenses',
		getExpenses: ({ from, to }: { from: string; to: string }) => `/api/expenses?from=${from}&to=${to}`,
	},
	investments: {
		add: '/api/investments/add',
		modify: '/api/investments',
		getInvestments: ({ from, to }: { from: string; to: string }) => `/api/investments?from=${from}&to=${to}`,
	},
	income: {
		add: '/api/income/add',
		modify: '/api/income',
		getIncome: ({ from, to }: { from: string; to: string }) => `/api/income?from=${from}&to=${to}`,
	},
	ai: {
		insights: '/api/ai/insights',
	},
};
