'use client';

import { useState } from 'react';

import { AreaChart, BarList, DonutChart } from '@tremor/react';
import { ArrowDownRight, ArrowUpRight, CalendarDays, Sparkles, TrendingUp, WalletCards, Lightbulb } from 'lucide-react';

import { useUser } from 'components/context/auth-provider';
import { Button } from 'components/ui/button';
import { Card, CardContent, CardHeader } from 'components/ui/card';
import { Slider } from 'components/ui/slider';
import { Skeleton } from 'components/ui/skeleton';

import { formatCurrency } from 'lib/formatter';

type Analytics = {
	budgetAlerts: Array<{ category: string; spent: number; target: number; overBy: number }>;
	anomalies: Array<{ name: string; category: string; date: string; amount: number; zScore: number }>;
	forecast: { next30Days: number; next90Days: number; dailyNet: number; assumption: string };
	weeklyDigest: {
		weeklyIncome: number;
		weeklyExpenses: number;
		weeklyInvestments: number;
		weeklyNet: number;
		summary: string;
	};
	whatIfBase: {
		salaryIncome: number;
		rentExpense: number;
		totalIncome: number;
		totalExpenses: number;
		totalInvestments: number;
		balance: number;
	};
};

type InsightsResponse = {
	insights: string[];
	analytics: Analytics;
};

export default function AIInsights() {
	const user = useUser();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [data, setData] = useState<InsightsResponse | null>(null);
	const [salaryChangePct, setSalaryChangePct] = useState(-5);
	const [rentChangePct, setRentChangePct] = useState(10);

	const generate = async () => {
		setLoading(true);
		setError('');
		try {
			const response = await fetch('/api/ai/insights', { method: 'POST' });
			const data = await response.json();
			if (!response.ok) {
				const details = data?.details
					? typeof data.details === 'string'
						? data.details
						: JSON.stringify(data.details)
					: '';
				throw new Error([data?.message || 'Failed to generate insights', details].filter(Boolean).join(' - '));
			}
			setData(data);
		} catch (err: any) {
			setError(err?.message || 'Failed to generate insights');
		} finally {
			setLoading(false);
		}
	};

	const whatIf = (() => {
		if (!data?.analytics?.whatIfBase) return null;
		const base = data.analytics.whatIfBase;
		const salaryDelta = (base.salaryIncome * salaryChangePct) / 100;
		const rentDelta = (base.rentExpense * rentChangePct) / 100;
		const projectedBalance = Math.round(base.balance + salaryDelta - rentDelta);
		return {
			salaryDelta: Math.round(salaryDelta),
			rentDelta: Math.round(rentDelta),
			projectedBalance,
		};
	})();

	const money = (value: number) => {
		return formatCurrency({ value, currency: user?.currency || 'INR', locale: user?.locale || 'en-IN' });
	};

	const balancePath = data?.analytics
		? [
				{ name: 'Now', Balance: data.analytics.whatIfBase.balance },
				{ name: '30 Days', Balance: data.analytics.forecast.next30Days },
				{ name: '90 Days', Balance: data.analytics.forecast.next90Days },
		  ]
		: [];

	const weeklySplit = data?.analytics
		? [
				{ name: 'Income', amount: data.analytics.weeklyDigest.weeklyIncome },
				{ name: 'Spent', amount: data.analytics.weeklyDigest.weeklyExpenses },
				{ name: 'Invested', amount: data.analytics.weeklyDigest.weeklyInvestments },
		  ].filter((item) => item.amount > 0)
		: [];

	const budgetBars =
		data?.analytics?.budgetAlerts
			?.map((item) => ({ name: item.category, value: item.overBy }))
			?.sort((a, b) => b.value - a.value) || [];

	return (
		<Card className="mb-8 overflow-hidden border-0 bg-background shadow-none">
			<CardHeader>
				<div className="flex flex-wrap items-start justify-between gap-3">
					<div>
						<h3 className="text-xl font-semibold tracking-tight">AI Financial Insights</h3>
						<p className="mt-1 text-sm text-muted-foreground">A smarter snapshot of trends, risks, and what-if planning.</p>
					</div>
					<Button
						onClick={generate}
						disabled={loading}
						size="sm"
						variant="outline"
						className="h-9 border-border bg-background px-4 hover:bg-muted"
					>
						<Sparkles className="mr-2 h-4 w-4" />
						{loading ? 'Analyzing Data...' : 'Generate Insights'}
					</Button>
				</div>
			</CardHeader>
			<CardContent>
				{error ? <p className="mb-4 rounded-md border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-500">{error}</p> : null}

				{loading ? (
					<div className="flex flex-col gap-6">
						<div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
							<Skeleton className="h-[88px] w-full rounded-xl" />
							<Skeleton className="h-[88px] w-full rounded-xl" />
							<Skeleton className="h-[88px] w-full rounded-xl" />
							<Skeleton className="h-[88px] w-full rounded-xl" />
						</div>
						<Skeleton className="h-[215px] w-full rounded-xl" />
						<div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
							<Skeleton className="h-[300px] w-full rounded-xl" />
							<Skeleton className="h-[300px] w-full rounded-xl" />
						</div>
					</div>
				) : null}

				{!loading && data?.analytics ? (
					<div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
						<div className="rounded-xl border bg-background/70 p-4">
							<div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
								<WalletCards className="h-3.5 w-3.5" />
								Current Balance
							</div>
							<p className="text-lg font-semibold">{money(data.analytics.whatIfBase.balance)}</p>
						</div>

						<div className="rounded-xl border bg-background/70 p-4">
							<div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
								<CalendarDays className="h-3.5 w-3.5" />
								30 Day Forecast
							</div>
							<p className="text-lg font-semibold">{money(data.analytics.forecast.next30Days)}</p>
						</div>

						<div className="rounded-xl border bg-background/70 p-4">
							<div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
								<TrendingUp className="h-3.5 w-3.5" />
								90 Day Forecast
							</div>
							<p className="text-lg font-semibold">{money(data.analytics.forecast.next90Days)}</p>
						</div>

						<div className="rounded-xl border bg-background/70 p-4">
							<div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
								{data.analytics.weeklyDigest.weeklyNet >= 0 ? (
									<ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
								) : (
									<ArrowDownRight className="h-3.5 w-3.5 text-red-500" />
								)}
								Weekly Net
							</div>
							<p className="text-lg font-semibold">{money(data.analytics.weeklyDigest.weeklyNet)}</p>
						</div>
					</div>
				) : null}

				{!loading && data?.insights?.length ? (
					<div className="mb-6 overflow-hidden rounded-xl border bg-background/50 shadow-sm">
						<div className="flex items-center gap-2 border-b bg-muted/20 px-6 py-4">
							<Lightbulb className="h-5 w-5 text-amber-500" />
							<h3 className="font-medium text-foreground">Actionable AI Insights</h3>
						</div>
						<div className="grid grid-cols-1 divide-y md:grid-cols-2 md:divide-x md:divide-y-0">
							<div className="flex flex-col divide-y">
								{data.insights.slice(0, 3).map((item, index) => (
									<div key={`insight-l-${index}`} className="flex items-start gap-4 p-5 transition-colors hover:bg-muted/10">
										<div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
											{index + 1}
										</div>
										<p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{item}</p>
									</div>
								))}
							</div>
							<div className="flex flex-col divide-y">
								{data.insights.slice(3, 6).map((item, index) => (
									<div key={`insight-r-${index}`} className="flex items-start gap-4 p-5 transition-colors hover:bg-muted/10">
										<div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
											{index + 4}
										</div>
										<p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{item}</p>
									</div>
								))}
							</div>
						</div>
					</div>
				) : null}

				{!loading && data?.analytics ? (
					<div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
						<div className="rounded-xl border bg-background/70 p-4">
							<h4 className="mb-2 text-sm font-semibold">Balance Projection</h4>
							<AreaChart
								className="h-52"
								data={balancePath}
								index="name"
								categories={['Balance']}
								showLegend={false}
								showGridLines={false}
								valueFormatter={(value: number) => money(value)}
							/>
							<p className="mt-2 text-xs text-muted-foreground">{data.analytics.forecast.assumption}</p>
						</div>

						<div className="rounded-xl border bg-background/70 p-4">
							<h4 className="mb-2 text-sm font-semibold">Weekly Cashflow Split</h4>
							{weeklySplit.length ? (
								<DonutChart
									className="h-52"
									data={weeklySplit}
									index="name"
									category="amount"
									showAnimation={false}
									valueFormatter={(value: number) => money(value)}
								/>
							) : (
								<p className="flex h-52 items-center justify-center text-sm text-muted-foreground">No weekly split data yet.</p>
							)}
						</div>

						<div className="rounded-xl border bg-background/70 p-4">
							<h4 className="mb-2 text-sm font-semibold">Budget Overrun</h4>
							{budgetBars.length ? (
								<BarList data={budgetBars} className="mt-2" valueFormatter={(value: number) => money(value)} color="rose" />
							) : (
								<p className="text-sm text-muted-foreground">No major over-budget category this month.</p>
							)}
						</div>

						<div className="rounded-xl border bg-background/70 p-4">
							<h4 className="mb-2 text-sm font-semibold">Anomaly Detection</h4>
							{data.analytics.anomalies.length ? (
								<div className="space-y-2">
									{data.analytics.anomalies.slice(0, 4).map((item, index) => (
										<div key={`${item.name}-${index}`} className="rounded-md border p-2">
											<p className="text-sm font-medium">{item.name}</p>
											<p className="text-xs text-muted-foreground">
												{item.category} • {money(item.amount)} • z {item.zScore}
											</p>
										</div>
									))}
								</div>
							) : (
								<p className="text-sm text-muted-foreground">No unusual spikes detected.</p>
							)}
						</div>

						<div className="rounded-xl border bg-background/70 p-4 xl:col-span-2">
							<h4 className="mb-4 text-sm font-semibold">What-If Simulator</h4>
							<div className="mb-6 grid grid-cols-1 gap-8 md:grid-cols-2">
								<div className="space-y-4">
									<div className="flex items-center justify-between">
										<label className="text-sm font-medium text-foreground">Salary change</label>
										<span className="text-sm text-muted-foreground">{salaryChangePct > 0 ? '+' : ''}{salaryChangePct}%</span>
									</div>
									<Slider
										min={-30}
										max={30}
										step={1}
										value={[salaryChangePct]}
										onValueChange={(val) => setSalaryChangePct(val[0])}
									/>
								</div>

								<div className="space-y-4">
									<div className="flex items-center justify-between">
										<label className="text-sm font-medium text-foreground">Rent/Housing change</label>
										<span className="text-sm text-muted-foreground">{rentChangePct > 0 ? '+' : ''}{rentChangePct}%</span>
									</div>
									<Slider
										min={-30}
										max={40}
										step={1}
										value={[rentChangePct]}
										onValueChange={(val) => setRentChangePct(val[0])}
									/>
								</div>
							</div>

							{whatIf ? (
								<div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
									<div className="rounded-md border p-3">
										<p className="text-xs text-muted-foreground">Projected Balance</p>
										<p className="text-base font-semibold">{money(whatIf.projectedBalance)}</p>
									</div>
									<div className="rounded-md border p-3">
										<p className="text-xs text-muted-foreground">Salary Delta</p>
										<p className="text-base font-semibold">{money(whatIf.salaryDelta)}</p>
									</div>
									<div className="rounded-md border p-3">
										<p className="text-xs text-muted-foreground">Rent Delta</p>
										<p className="text-base font-semibold">{money(whatIf.rentDelta)}</p>
									</div>
								</div>
							) : null}
						</div>
					</div>
				) : null}
			</CardContent>
		</Card>
	);
}
