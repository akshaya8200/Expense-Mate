const Footer = ({ className }: { className?: String }) => {
	return (
		<footer className={`className flex h-14 w-full items-center border-t pl-6 pr-6 font-medium ${className}`}>
			<div className="xs:mb-0 flex w-full justify-center">
				<div className="flex flex-row items-center justify-between gap-6 border-t border-white/5">
					<p className="text-xs text-gray-600">&copy; Copyright {new Date().getFullYear()}, Expense Mate</p>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
