import type { ClientCategory } from "../../api/client";

interface CategoryHeaderProps {
	categoryName?: string;
	categoryId: string;
	categories?: ClientCategory[];
	onBack: () => void;
	onCategoryChange: (categoryId: string) => void;
}

export function CategoryHeader({
	categoryName,
	categoryId,
	categories,
	onBack,
	onCategoryChange,
}: CategoryHeaderProps) {
	const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		onCategoryChange(e.target.value);
	};

	return (
		<header className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg shadow-purple-100/40 p-3 mb-5">
			<div className="flex items-center gap-3">
				{/* Back button */}
				<button
					onClick={onBack}
					className="w-9 h-9 flex items-center justify-center rounded-xl bg-purple-50 text-purple-600 hover:bg-purple-100 hover:text-purple-800 transition-all shrink-0"
				>
					<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
						<path d="M19 12H5M12 19l-7-7 7-7" />
					</svg>
				</button>
				
				{/* Title */}
				<div className="flex-1 min-w-0">
					<p className="text-[10px] text-purple-400 uppercase tracking-wider font-medium">Category</p>
					<h1 className="text-sm font-bold text-purple-900 truncate">
						{categoryName || "Loading..."}
					</h1>
				</div>

				{/* Category selector dropdown */}
				{categories && categories.length > 1 && (
					<div className="relative shrink-0">
						<select
							value={categoryId}
							onChange={handleCategoryChange}
							className="appearance-none bg-purple-50 border-0 rounded-xl pl-3 pr-8 py-2 text-xs font-medium text-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-300 cursor-pointer hover:bg-purple-100 transition-colors"
						>
							{categories.map((cat) => (
								<option key={cat.id} value={cat.id}>
									{cat.name}
								</option>
							))}
						</select>
						<div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-purple-400">
							<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
								<path d="M6 9l6 6 6-6" />
							</svg>
						</div>
					</div>
				)}
			</div>
		</header>
	);
}

