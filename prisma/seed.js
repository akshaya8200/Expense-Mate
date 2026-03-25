const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const toDate = (daysAgo) => {
	const date = new Date();
	date.setDate(date.getDate() - daysAgo);
	return date.toISOString().slice(0, 10);
};

async function main() {
	const passwordHash = await bcrypt.hash('demo1234', 10);

	const user = await prisma.users.upsert({
		where: { email: 'demo@expense.local' },
		update: {
			password_hash: passwordHash,
			currency: 'INR',
			locale: 'en-IN',
		},
		create: {
			email: 'demo@expense.local',
			password_hash: passwordHash,
			currency: 'INR',
			locale: 'en-IN',
		},
		select: { id: true },
	});

	await prisma.expenses.deleteMany({ where: { user_id: user.id } });
	await prisma.income.deleteMany({ where: { user_id: user.id } });
	await prisma.investments.deleteMany({ where: { user_id: user.id } });

	await prisma.income.createMany({
		data: [
			{ user_id: user.id, name: 'Salary', notes: 'Main job', price: '85000', category: 'salary', date: toDate(22) },
			{ user_id: user.id, name: 'Freelance', notes: 'Side project', price: '12000', category: 'other', date: toDate(12) },
			{ user_id: user.id, name: 'Ads', notes: 'Blog ads', price: '4000', category: 'ads', date: toDate(6) },
		],
	});

	await prisma.expenses.createMany({
		data: [
			{
				user_id: user.id,
				name: 'Groceries',
				notes: 'Weekly groceries',
				price: '3200',
				category: 'grocery',
				paid_via: 'upi',
				date: toDate(21),
			},
			{
				user_id: user.id,
				name: 'Rent',
				notes: 'Monthly rent',
				price: '22000',
				category: 'rent',
				paid_via: 'netbanking',
				date: toDate(20),
			},
			{
				user_id: user.id,
				name: 'Dinner',
				notes: 'Friends outing',
				price: '1800',
				category: 'food',
				paid_via: 'creditcard',
				date: toDate(10),
			},
			{
				user_id: user.id,
				name: 'Internet Bill',
				notes: 'Fiber plan',
				price: '999',
				category: 'bills',
				paid_via: 'upi',
				date: toDate(7),
			},
			{
				user_id: user.id,
				name: 'Medical',
				notes: 'Pharmacy',
				price: '1450',
				category: 'medical',
				paid_via: 'debitcard',
				date: toDate(3),
			},
		],
	});

	await prisma.investments.createMany({
		data: [
			{
				user_id: user.id,
				name: 'Nifty 50 Index Fund',
				notes: 'SIP purchase',
				price: '240',
				units: '20',
				category: 'mutualfunds',
				date: toDate(16),
			},
			{
				user_id: user.id,
				name: 'Indian Stock Basket',
				notes: 'Monthly buy',
				price: '1200',
				units: '5',
				category: 'indianstock',
				date: toDate(8),
			},
		],
	});

	console.log('Seed completed. Demo account: demo@expense.local / demo1234');
}

main()
	.catch((error) => {
		console.error(error);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
