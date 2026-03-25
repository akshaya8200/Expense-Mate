import { NextResponse } from 'next/server';

import { checkAuth } from 'lib/auth';
import prisma from 'lib/prisma';

type Expense = { date: string; name: string; category: string; price: string };
type Income = { date: string; category: string; price: string };
type Investment = { date: string; price: string; units: string };

const getTotals = (list: Array<{ price: string; units?: string }>, hasUnits = false) => {
	return list.reduce((acc, item) => {
		if (hasUnits) {
			return acc + Number(item.price || 0) * Number(item.units || 0);
		}
		return acc + Number(item.price || 0);
	}, 0);
};

const topExpenseCategories = (expenses: Array<{ category: string; price: string }>) => {
	const map = expenses.reduce<Record<string, number>>((acc, item) => {
		acc[item.category] = (acc[item.category] || 0) + Number(item.price || 0);
		return acc;
	}, {});

	return Object.entries(map)
		.sort((a, b) => b[1] - a[1])
		.slice(0, 5)
		.map(([category, amount]) => ({ category, amount }));
};

const parseDate = (value: string) => {
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? null : date;
};

const isWithinDays = (value: string, days: number) => {
	const date = parseDate(value);
	if (!date) return false;
	const now = new Date();
	const start = new Date(now);
	start.setDate(now.getDate() - days);
	return date >= start && date <= now;
};

const isCurrentMonth = (value: string) => {
	const date = parseDate(value);
	if (!date) return false;
	const now = new Date();
	return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
};

const mean = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);
const stdDev = (arr: number[]) => {
	if (!arr.length) return 0;
	const m = mean(arr);
	const variance = mean(arr.map((value) => (value - m) ** 2));
	return Math.sqrt(variance);
};

const buildBudgetGoals = (expenses: Expense[]) => {
	const currentMonth = expenses.filter((expense) => isCurrentMonth(expense.date));
	const byCategory = currentMonth.reduce<Record<string, number>>((acc, item) => {
		acc[item.category] = (acc[item.category] || 0) + Number(item.price || 0);
		return acc;
	}, {});

	return Object.entries(byCategory)
		.sort((a, b) => b[1] - a[1])
		.slice(0, 5)
		.map(([category, spent]) => {
			const target = Math.max(0, Math.round(spent * 0.9));
			const overBy = spent - target;
			return {
				category,
				spent,
				target,
				status: overBy > 0 ? 'over' : 'within',
				overBy: overBy > 0 ? overBy : 0,
			};
		});
};

const buildAnomalies = (expenses: Expense[]) => {
	const values = expenses.map((item) => Number(item.price || 0));
	const m = mean(values);
	const s = stdDev(values);
	const threshold = m + 2 * s;

	return expenses
		.map((item) => {
			const amount = Number(item.price || 0);
			return {
				...item,
				amount,
				zScore: s > 0 ? (amount - m) / s : 0,
			};
		})
		.filter((item) => item.amount >= Math.max(threshold, 1000))
		.sort((a, b) => b.amount - a.amount)
		.slice(0, 5)
		.map((item) => ({
			name: item.name,
			category: item.category,
			date: item.date,
			amount: item.amount,
			zScore: Number(item.zScore.toFixed(2)),
		}));
};

const buildForecast = (income: Income[], expenses: Expense[], investments: Investment[], currentBalance: number) => {
	const income30 = income
		.filter((item) => isWithinDays(item.date, 30))
		.reduce((acc, item) => acc + Number(item.price || 0), 0);
	const expenses30 = expenses
		.filter((item) => isWithinDays(item.date, 30))
		.reduce((acc, item) => acc + Number(item.price || 0), 0);
	const investments30 = investments
		.filter((item) => isWithinDays(item.date, 30))
		.reduce((acc, item) => acc + Number(item.price || 0) * Number(item.units || 0), 0);

	const net30 = income30 - expenses30 - investments30;
	const dailyNet = net30 / 30;

	return {
		next30Days: Math.round(currentBalance + dailyNet * 30),
		next90Days: Math.round(currentBalance + dailyNet * 90),
		dailyNet: Math.round(dailyNet),
		assumption: 'Based on trailing 30-day net cashflow.',
	};
};

const buildWeeklyDigest = (income: Income[], expenses: Expense[], investments: Investment[]) => {
	const weeklyIncome = income
		.filter((item) => isWithinDays(item.date, 7))
		.reduce((acc, item) => acc + Number(item.price || 0), 0);
	const weeklyExpenses = expenses
		.filter((item) => isWithinDays(item.date, 7))
		.reduce((acc, item) => acc + Number(item.price || 0), 0);
	const weeklyInvestments = investments
		.filter((item) => isWithinDays(item.date, 7))
		.reduce((acc, item) => acc + Number(item.price || 0) * Number(item.units || 0), 0);

	const weeklyNet = weeklyIncome - weeklyExpenses - weeklyInvestments;
	return {
		weeklyIncome,
		weeklyExpenses,
		weeklyInvestments,
		weeklyNet,
		summary:
			weeklyNet >= 0
				? 'You stayed cashflow-positive this week.'
				: 'You were cashflow-negative this week. Review non-essential spending.',
	};
};

const promptTemplate = (input: {
	currency: string;
	totalIncome: number;
	totalExpenses: number;
	totalInvestments: number;
	balance: number;
	topCategories: Array<{ category: string; amount: number }>;
	forecast: { next30Days: number; next90Days: number; dailyNet: number };
	budgetAlerts: Array<{ category: string; spent: number; target: number; overBy: number }>;
	anomalies: Array<{ name: string; category: string; amount: number; date: string }>;
}) => {
	return [
		'You are a personal finance analyst.',
		'Return ONLY valid JSON. Do not include any conversational text, explanations, or markdown formatting (like ```json).',
		'Provide output in English only.',
		'Return exactly 6 concise, practical insights based on the provided metrics.',
		'Each insight must be concise, practical, and action-oriented.',
		`Currency: ${input.currency}`,
		`Total income: ${input.totalIncome}`,
		`Total expenses: ${input.totalExpenses}`,
		`Total investments: ${input.totalInvestments}`,
		`Net balance: ${input.balance}`,
		`Forecast 30 days: ${input.forecast.next30Days}`,
		`Forecast 90 days: ${input.forecast.next90Days}`,
		`Daily net estimate: ${input.forecast.dailyNet}`,
		`Budget alerts: ${JSON.stringify(input.budgetAlerts)}`,
		`Anomalies: ${JSON.stringify(input.anomalies)}`,
		`Top expense categories: ${JSON.stringify(input.topCategories)}`,
	].join('\n');
};

const insightsResponseSchema = {
	type: 'object',
	properties: {
		insights: {
			type: 'array',
			items: { type: 'string' },
		},
	},
	required: ['insights'],
};

export async function POST() {
	return await checkAuth(async (user: any) => {
		const apiKey = process.env.GEMINI_API_KEY;
		const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

		const [expenses, income, investments] = await Promise.all([
			prisma.expenses.findMany({
				where: { user_id: user.id },
				select: { price: true, category: true, date: true, name: true },
			}),
			prisma.income.findMany({ where: { user_id: user.id }, select: { price: true, date: true, category: true } }),
			prisma.investments.findMany({ where: { user_id: user.id }, select: { price: true, units: true, date: true } }),
		]);

		const totalIncome = getTotals(income);
		const totalExpenses = getTotals(expenses);
		const totalInvestments = getTotals(investments, true);
		const balance = totalIncome - totalExpenses - totalInvestments;
		const topCategories = topExpenseCategories(expenses);
		const budgetGoals = buildBudgetGoals(expenses);
		const budgetAlerts = budgetGoals
			.filter((item) => item.status === 'over')
			.map((item) => ({ category: item.category, spent: item.spent, target: item.target, overBy: item.overBy }));
		const anomalies = buildAnomalies(expenses);
		const forecast = buildForecast(income, expenses, investments, balance);
		const weeklyDigest = buildWeeklyDigest(income, expenses, investments);
		const salaryIncome = income
			.filter((item: { category: string | null }) => String(item.category).toLowerCase() === 'salary')
			.reduce((acc: number, item: { price: number | null }) => acc + Number(item.price || 0), 0);
		const rentExpense = expenses
			.filter((item: { category: string | null }) => String(item.category).toLowerCase() === 'rent')
			.reduce((acc: number, item: { price: number | null }) => acc + Number(item.price || 0), 0);

		if (!apiKey) {
			return NextResponse.json({
				message: 'GEMINI_API_KEY is required for AI insights.',
			}, { status: 400 });
		}

		const body = {
			contents: [
				{
					role: 'user',
					parts: [
						{
							text: promptTemplate({
								currency: user.currency,
								totalIncome,
								totalExpenses,
								totalInvestments,
								balance,
								topCategories,
								forecast,
								budgetAlerts,
								anomalies,
							}),
						},
					],
				},
			],
			generationConfig: {
				responseMimeType: 'application/json',
				responseSchema: insightsResponseSchema,
				maxOutputTokens: 2000,
			},
		};

		const response = await fetch(
			`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body),
			}
		);

		if (!response.ok) {
			const errorText = await response.text();
			return NextResponse.json(
				{ message: 'Gemini API call failed.', details: errorText },
				{ status: 502 }
			);
		}

		const data = await response.json();
		const candidate = data?.candidates?.[0];
		let raw =
			candidate?.content?.parts
				?.map((part: { text?: string }) => part.text || '')
				.join('\n')
				.trim() || '';

		// Extract strictly the JSON object from potential conversational text/markdown wrappers
		const firstBrace = raw.indexOf('{');
		const lastBrace = raw.lastIndexOf('}');
		if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
			raw = raw.substring(firstBrace, lastBrace + 1);
		}

		if (!raw) {
			return NextResponse.json(
				{ message: `Gemini returned an empty response. Finish reason: ${candidate?.finishReason || 'unknown'}.` },
				{ status: 502 }
			);
		}

		let parsed: any;
		try {
			parsed = JSON.parse(raw);
		} catch {
			return NextResponse.json(
				{ message: 'Gemini returned non-JSON output despite JSON mode.', details: raw.slice(0, 500) },
				{ status: 502 }
			);
		}

		const parsedInsights = Array.isArray(parsed?.insights)
			? parsed.insights.map((item: any) => String(item).trim()).filter(Boolean)
			: [];

		if (parsedInsights.length !== 6) {
			return NextResponse.json(
				{ message: 'Gemini returned an invalid insights payload.', details: parsed },
				{ status: 502 }
			);
		}

		return NextResponse.json({
			insights: parsedInsights,
			source: 'gemini',
			analytics: {
				budgetGoals,
				budgetAlerts,
				anomalies,
				forecast,
				weeklyDigest,
				whatIfBase: { salaryIncome, rentExpense, totalIncome, totalExpenses, totalInvestments, balance },
			},
			totals: { totalIncome, totalExpenses, totalInvestments, balance },
		});
	});
}
