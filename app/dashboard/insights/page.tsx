import LayoutHeader from 'components/layout/header';

import AIInsights from '../ai-insights';

const title = 'Expense Mate - AI Insights';
const description = 'AI-powered financial analysis and planning.';

export const metadata = {
	title,
	description,
};

export default function Page() {
	return (
		<>
			<LayoutHeader title="insights" />
			<div className="p-4 pt-3">
				<AIInsights />
			</div>
		</>
	);
}
