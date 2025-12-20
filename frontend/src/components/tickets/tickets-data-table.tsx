import { useState } from "react";
import { HiTrash, HiClipboardCopy, HiCheck, HiChevronLeft, HiChevronRight } from "react-icons/hi";
import type { Ticket } from "../../types";

interface TicketsDataTableProps {
	tickets: Ticket[];
	onDelete: (ticket: Ticket) => void;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export function TicketsDataTable({ tickets, onDelete }: TicketsDataTableProps) {
	const [copiedId, setCopiedId] = useState<string | null>(null);
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(25);

	const handleCopy = async (serial: string) => {
		await navigator.clipboard.writeText(serial);
		setCopiedId(serial);
		setTimeout(() => setCopiedId(null), 2000);
	};

	// Pagination calculations
	const totalPages = Math.ceil(tickets.length / pageSize);
	const startIndex = (currentPage - 1) * pageSize;
	const endIndex = Math.min(startIndex + pageSize, tickets.length);
	const paginatedTickets = tickets.slice(startIndex, endIndex);

	const handlePageSizeChange = (newSize: number) => {
		setPageSize(newSize);
		setCurrentPage(1); // Reset to first page when changing page size
	};

	const goToPage = (page: number) => {
		setCurrentPage(Math.max(1, Math.min(page, totalPages)));
	};

	// Generate page numbers to display
	const getPageNumbers = () => {
		const pages: (number | string)[] = [];
		const maxVisiblePages = 5;

		if (totalPages <= maxVisiblePages) {
			for (let i = 1; i <= totalPages; i++) {
				pages.push(i);
			}
		} else {
			if (currentPage <= 3) {
				for (let i = 1; i <= 4; i++) pages.push(i);
				pages.push("...");
				pages.push(totalPages);
			} else if (currentPage >= totalPages - 2) {
				pages.push(1);
				pages.push("...");
				for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
			} else {
				pages.push(1);
				pages.push("...");
				pages.push(currentPage - 1);
				pages.push(currentPage);
				pages.push(currentPage + 1);
				pages.push("...");
				pages.push(totalPages);
			}
		}

		return pages;
	};

	return (
		<div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
			<div className="overflow-x-auto">
				<table className="w-full">
					<thead>
						<tr className="bg-gray-50 border-b border-gray-200">
							<th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
								#
							</th>
							<th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
								Serial Number
							</th>
							<th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
								Created
							</th>
							<th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
								Actions
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-200">
						{paginatedTickets.map((ticket, index) => (
							<tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
								<td className="px-6 py-4 text-sm text-gray-500">{startIndex + index + 1}</td>
								<td className="px-6 py-4">
									<div className="flex items-center gap-2">
										<code className="px-3 py-1.5 bg-linear-to-r from-indigo-50 to-purple-50 text-indigo-700 font-mono text-sm rounded-lg border border-indigo-200">
											{ticket.serial}
										</code>
										<button
											onClick={() => handleCopy(ticket.serial)}
											className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
											title="Copy to clipboard"
										>
											{copiedId === ticket.serial ? (
												<HiCheck className="h-4 w-4 text-green-500" />
											) : (
												<HiClipboardCopy className="h-4 w-4" />
											)}
										</button>
									</div>
								</td>
								<td className="px-6 py-4 text-sm text-gray-500">
									{new Date(ticket.createdAt).toLocaleString()}
								</td>
								<td className="px-6 py-4">
									<div className="flex items-center justify-end">
										<button
											onClick={() => onDelete(ticket)}
											className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
											title="Delete ticket"
										>
											<HiTrash className="h-5 w-5" />
										</button>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/* Pagination Footer */}
			<div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
				<div className="flex flex-col sm:flex-row items-center justify-between gap-4">
					{/* Info & Page Size */}
					<div className="flex items-center gap-4">
						<p className="text-sm text-gray-600">
							Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
							<span className="font-medium">{endIndex}</span> of{" "}
							<span className="font-medium">{tickets.length}</span> tickets
						</p>
						<div className="flex items-center gap-2">
							<label htmlFor="pageSize" className="text-sm text-gray-600">
								Per page:
							</label>
							<select
								id="pageSize"
								value={pageSize}
								onChange={(e) => handlePageSizeChange(Number(e.target.value))}
								className="px-2 py-1 w-16 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
							>
								{PAGE_SIZE_OPTIONS.map((size) => (
									<option key={size} value={size}>
										{size}
									</option>
								))}
							</select>
						</div>
					</div>

					{/* Pagination Controls */}
					{totalPages > 1 && (
						<div className="flex items-center gap-1">
							<button
								onClick={() => goToPage(currentPage - 1)}
								disabled={currentPage === 1}
								className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
							>
								<HiChevronLeft className="h-5 w-5" />
							</button>

							{getPageNumbers().map((page, index) =>
								page === "..." ? (
									<span key={`ellipsis-${index}`} className="px-2 text-gray-400">
										...
									</span>
								) : (
									<button
										key={page}
										onClick={() => goToPage(page as number)}
										className={`min-w-[36px] h-9 px-3 text-sm font-medium rounded-lg transition-colors ${
											currentPage === page
												? "bg-indigo-600 text-white"
												: "text-gray-600 hover:bg-gray-200"
										}`}
									>
										{page}
									</button>
								)
							)}

							<button
								onClick={() => goToPage(currentPage + 1)}
								disabled={currentPage === totalPages}
								className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
							>
								<HiChevronRight className="h-5 w-5" />
							</button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
