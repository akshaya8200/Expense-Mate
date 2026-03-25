import Image from 'next/image';
import Link from 'next/link';

import logo from 'public/icons/logo.svg';

import Footer from 'components/footer';
import Features from 'components/home/features';

import url from 'constants/url';

export default function Home() {
	return (
		<div className="relative h-full bg-gradient-to-br from-sky-100 via-white to-sky-100 pl-2 pr-2 text-gray-800">
			<header className="relative m-auto h-[56px] max-w-4xl pt-3">
				<div className="absolute left-0 right-0 top-3 z-20 flex items-center justify-between">
					<Link href={'/'} className="flex max-w-[280px] items-center p-3 text-2xl">
						<Image src={logo} width={30} height={30} alt="Expense Mate logo" className="mr-2" />
						<span className="font-black tracking-[-0.03em] text-gray-900">Expense Mate</span>
					</Link>
					<Link
						href={url.app.signin}
						className="leading-2 mr-4 inline-flex h-[34px] items-center overflow-hidden rounded-full bg-gray-900 px-4 py-1 text-sm font-medium text-white transition hover:bg-primary/90"
					>
						Sign in
					</Link>
				</div>
			</header>
			<main>
				<div className="absolute inset-x-0 top-[-55px] z-10 h-96 overflow-hidden text-gray-900/40 opacity-10 [mask-image:linear-gradient(to_top,transparent,white)]">
					<svg className="absolute inset-0 top-0 h-full w-full text-gray-900" xmlns="http://www.w3.org/2000/svg">
						<defs>
							<pattern
								id="pattern"
								width="32"
								height="32"
								patternUnits="userSpaceOnUse"
								x="50%"
								y="100%"
								patternTransform="translate(0 -1)"
							>
								<path d="M0 32V.5H32" fill="none" stroke="currentColor"></path>
							</pattern>
						</defs>
						<rect width="100%" height="100%" fill="url(#pattern)"></rect>
					</svg>
				</div>
				<div className="mx-auto mb-16 mt-16 max-w-md px-3 text-center sm:max-w-lg sm:px-0">
					<h1 className="mt-4	text-4xl font-black leading-[1.15] tracking-[-0.03em] text-black sm:text-5xl sm:leading-[1.15]">
						Effortlessly Track and Manage{' '}
						<span className="bg-gradient-to-r from-amber-400 to-orange-600 bg-clip-text text-transparent">
							Expenses.
						</span>
					</h1>
					<p className="mt-5 text-base font-normal leading-6 tracking-tight sm:text-lg">
						Our easy-to-use platform allows you to track and categorize your spending, giving you a clear picture of
						your financials.
					</p>
					<div className="mt-10 flex justify-center">
						<Link
							href={url.app.signup}
							className="inline-flex h-[34px] items-center justify-center rounded-full bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90 hover:shadow"
						>
							Try it for Free
						</Link>
						<Link
							href={url.app.signin}
							className="ml-6 inline-flex h-[34px] items-center justify-center  rounded-full bg-white/0 px-4 py-2.5 text-sm font-medium text-slate-900 ring-1 ring-slate-900/10 hover:bg-gray-100 hover:shadow"
						>
							See Dashboard
						</Link>
					</div>
				</div>
				<div className="mx-auto mb-16 mt-16 max-w-md px-3 text-center sm:max-w-lg sm:px-0">
					<h2 className="mt-4 text-3xl font-extrabold tracking-[-0.03em] text-black sm:text-4xl">
						<span className="bg-gradient-to-r from-amber-400 to-orange-600 bg-clip-text text-transparent">
							Why to use
						</span>{' '}
						Expense Mate?
					</h2>
					<ul className="mt-6 list-decimal px-4 text-left leading-6 [counter-reset:section] sm:px-2">
						<li className="before::h-2 mt-4 text-base tracking-tight sm:text-lg">
							<b className="font-sans font-bold text-black">Easy to use:</b> Track expenses on-the-go with
							categorization and logging.
						</li>
						<li className="before::h-2 mt-4 text-base tracking-tight sm:text-lg">
							<b className="font-sans font-bold text-black">Data-driven insights:</b> Expense tracker can provide
							valuable insights into your spending habits, allowing you to make more informed decisions.
						</li>
						<li className="before::h-2 mt-4 text-base tracking-tight sm:text-lg">
							<b className="font-sans font-bold text-black">Identify overspending:</b> Take control of your finances by
							identifying and reducing overspending with an expense tracker.
						</li>
						<li className="before::h-2 mt-4 text-base tracking-tight sm:text-lg">
							<b className="font-sans font-bold text-black">Real-time visibility:</b> Monitor your expenses in
							real-time, whether you are at home or on-the-go, with a user-friendly interface
						</li>
					</ul>
				</div>
				<div className="mx-auto mb-16 mt-16 max-w-2xl">
					<h2 className="mb-12 mt-8 text-center text-3xl font-extrabold tracking-[-0.03em] text-black sm:text-4xl">
						Simple yet,{' '}
						<span className="bg-gradient-to-r from-amber-400 to-orange-600 bg-clip-text text-transparent">
							Powerful
						</span>{' '}
						Features.
					</h2>
					<div className="mt-10 grid grid-cols-1 justify-center gap-10 p-5 lg:grid-cols-2 lg:gap-20">
						<Features />
					</div>
				</div>

				<div className="mx-auto mb-16 mt-16 max-w-md px-3 text-center sm:max-w-lg sm:px-0">
					<h2 className="mt-4 text-3xl font-extrabold tracking-[-0.03em] text-black sm:text-4xl sm:leading-[3.5rem]">
						Ready to{' '}
						<span className="bg-gradient-to-r from-blue-400 to-sky-600 bg-clip-text text-transparent">
							Track Better?
						</span>
					</h2>
					<p className="mt-3 text-base leading-7 sm:text-lg">
						Start with your own account and get instant visibility into your expenses, income, and investments.
					</p>
					<Link
						href={url.app.signup}
						className="mt-6 inline-flex h-[36px] items-center justify-center  rounded-full bg-white/0 px-4 py-2.5 text-sm font-medium text-slate-900 ring-1 ring-slate-900/10 hover:bg-gray-100 hover:shadow"
					>
						Create Account
					</Link>
				</div>
			</main>
			<Footer />
		</div>
	);
}
