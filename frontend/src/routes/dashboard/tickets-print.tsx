import { createRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useRef, useCallback } from "react";
import { HiArrowLeft, HiDownload, HiChevronLeft, HiChevronRight } from "react-icons/hi";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { Route as dashboardRoute } from "../dashboard";
import { ticketsApi } from "../../api/tickets.api";
import { TicketCard } from "../../components/tickets/ticket-card";
import type { Ticket } from "../../types";

const TICKETS_PER_PAGE = 20; // 4x5 grid

// Component to render a single page of tickets
// Using inline styles with hex colors to avoid oklch color function issues with html2canvas
function TicketPage({
	tickets,
	pageNumber,
	totalPages,
}: {
	tickets: Ticket[];
	pageNumber: number;
	totalPages: number;
}) {
	return (
		<div
			style={{
				width: "210mm",
				height: "297mm",
				padding: "10mm",
				boxSizing: "border-box",
				backgroundColor: "#ffffff",
			}}
		>
			{/* Grid: 4 columns x 5 rows = 20 tickets */}
			<div
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(4, 1fr)",
					gridTemplateRows: "repeat(5, 1fr)",
					gap: "8px",
					height: "calc(297mm - 25mm)",
				}}
			>
				{tickets.map((ticket) => (
					<TicketCard key={ticket.id} id={ticket.id} serial={ticket.serial} />
				))}
				{/* Fill empty slots if less than 20 tickets */}
				{tickets.length < TICKETS_PER_PAGE &&
					Array.from({ length: TICKETS_PER_PAGE - tickets.length }).map((_, index) => (
						<div
							key={`empty-${index}`}
							style={{
								border: "2px dashed #e5e7eb",
								borderRadius: "8px",
								backgroundColor: "#f9fafb",
							}}
						/>
					))}
			</div>

			{/* Page Footer */}
			<div style={{ marginTop: "8px", textAlign: "center" }}>
				<p style={{ fontSize: "8px", color: "#9ca3af", margin: 0 }}>
					UCSM FRWC 2026 • Page {pageNumber} of {totalPages} • Generated:{" "}
					{new Date().toLocaleDateString()}
				</p>
			</div>
		</div>
	);
}

function TicketsPrintPage() {
	const navigate = useNavigate();
	const printRef = useRef<HTMLDivElement>(null);
	const exportContainerRef = useRef<HTMLDivElement>(null);
	const [currentPage, setCurrentPage] = useState(1);
	const [isExporting, setIsExporting] = useState(false);
	const [exportProgress, setExportProgress] = useState(0);

	// Fetch tickets
	const { data: ticketsData, isLoading, isError } = useQuery({
		queryKey: ["tickets"],
		queryFn: ticketsApi.getAll,
	});

	const tickets = ticketsData?.data ?? [];
	const totalPages = Math.ceil(tickets.length / TICKETS_PER_PAGE);
	const startIndex = (currentPage - 1) * TICKETS_PER_PAGE;
	const currentTickets = tickets.slice(startIndex, startIndex + TICKETS_PER_PAGE);

	// Split tickets into pages
	const getTicketsForPage = useCallback(
		(pageNum: number) => {
			const start = (pageNum - 1) * TICKETS_PER_PAGE;
			return tickets.slice(start, start + TICKETS_PER_PAGE);
		},
		[tickets]
	);

	const handleExportPDF = useCallback(async () => {
		if (!exportContainerRef.current || tickets.length === 0) return;

		setIsExporting(true);
		setExportProgress(0);

		try {
			// A4 dimensions at 300 DPI for print quality
			const pdf = new jsPDF({
				orientation: "portrait",
				unit: "mm",
				format: "a4",
				compress: true,
			});

			const pageWidth = 210;
			const pageHeight = 297;

			// Get all page elements from the hidden container
			const pageElements = exportContainerRef.current.querySelectorAll(".pdf-page");

			for (let i = 0; i < pageElements.length; i++) {
				const element = pageElements[i] as HTMLElement;

				if (i > 0) {
					pdf.addPage();
				}

				// Update progress
				setExportProgress(Math.round(((i + 1) / pageElements.length) * 100));

				// Higher scale for better quality (4x = ~300 DPI for print)
				const canvas = await html2canvas(element, {
					scale: 4,
					useCORS: true,
					backgroundColor: "#ffffff",
					logging: false,
					allowTaint: true,
					imageTimeout: 0,
					// Better text rendering options
					onclone: (clonedDoc) => {
						// Add CSS to fix vertical alignment in cloned document
						const style = clonedDoc.createElement("style");
						style.textContent = `
							* {
								-webkit-font-smoothing: antialiased;
								-moz-osx-font-smoothing: grayscale;
							}
							span, p, h1, h2, h3, h4, h5, h6 {
								line-height: 1 !important;
								vertical-align: top !important;
								padding-bottom: 8px !important;
							}
						`;
						clonedDoc.head.appendChild(style);
					},
				});

				// Use JPEG with high quality for smaller file size while maintaining quality
				const imgData = canvas.toDataURL("image/jpeg", 1.0);
				const imgWidth = pageWidth;
				const imgHeight = (canvas.height * pageWidth) / canvas.width;

				pdf.addImage(
					imgData,
					"JPEG",
					0,
					0,
					imgWidth,
					Math.min(imgHeight, pageHeight),
					undefined,
					"FAST"
				);
			}

			pdf.save(`tickets-${new Date().toISOString().split("T")[0]}.pdf`);
		} catch (error) {
			console.error("PDF export failed:", error);
			alert("Failed to export PDF. Please try again.");
		} finally {
			setIsExporting(false);
			setExportProgress(0);
		}
	}, [tickets.length]);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-96">
				<div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
			</div>
		);
	}

	if (isError || tickets.length === 0) {
		return (
			<div className="space-y-6">
				<button
					onClick={() => navigate({ to: "/dashboard/tickets" })}
					className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
				>
					<HiArrowLeft className="h-5 w-5" />
					Back to Tickets
				</button>
				<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
					<p className="text-gray-500">No tickets available to print. Generate some tickets first.</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header - Hidden when printing */}
			<div className="print:hidden flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div className="flex items-center gap-4">
					<button
						onClick={() => navigate({ to: "/dashboard/tickets" })}
						className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
					>
						<HiArrowLeft className="h-5 w-5" />
					</button>
					<div>
						<h1 className="text-2xl font-bold text-gray-900">Print Tickets</h1>
						<p className="text-gray-500 mt-1">
							Preview and export {tickets.length} tickets ({totalPages} pages) to PDF
						</p>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<button
						onClick={handleExportPDF}
						disabled={isExporting}
						className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors shadow-sm disabled:bg-indigo-400 min-w-[160px]"
					>
						<HiDownload className="h-5 w-5" />
						{isExporting ? `Exporting ${exportProgress}%` : "Export PDF"}
					</button>
				</div>
			</div>

			{/* Export Progress Bar */}
			{isExporting && (
				<div className="print:hidden bg-white p-4 rounded-xl shadow-sm border border-gray-200">
					<div className="flex items-center gap-4">
						<div className="flex-1">
							<div className="h-2 bg-gray-200 rounded-full overflow-hidden">
								<div
									className="h-full bg-indigo-600 transition-all duration-300"
									style={{ width: `${exportProgress}%` }}
								/>
							</div>
						</div>
						<span className="text-sm font-medium text-gray-600">{exportProgress}%</span>
					</div>
					<p className="text-sm text-gray-500 mt-2">
						Generating PDF... Please wait while all {totalPages} pages are rendered.
					</p>
				</div>
			)}

			{/* Pagination Controls - Hidden when printing */}
			{totalPages > 1 && !isExporting && (
				<div className="print:hidden flex items-center justify-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
					<button
						onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
						disabled={currentPage === 1}
						className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
					>
						<HiChevronLeft className="h-5 w-5" />
					</button>
					<div className="text-sm text-gray-600">
						Page <span className="font-semibold">{currentPage}</span> of{" "}
						<span className="font-semibold">{totalPages}</span>
						<span className="text-gray-400 ml-2">
							(Tickets {startIndex + 1}-{Math.min(startIndex + TICKETS_PER_PAGE, tickets.length)})
						</span>
					</div>
					<button
						onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
						disabled={currentPage === totalPages}
						className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
					>
						<HiChevronRight className="h-5 w-5" />
					</button>
				</div>
			)}

			{/* Print Preview - A4 Layout (Current Page) */}
			<div className="flex justify-center print:block">
				<div ref={printRef} className="shadow-xl print:shadow-none">
					<TicketPage
						tickets={currentTickets}
						pageNumber={currentPage}
						totalPages={totalPages}
					/>
				</div>
			</div>

			{/* Hidden container for PDF export - renders ALL pages */}
			<div
				ref={exportContainerRef}
				style={{
					position: "absolute",
					left: "-9999px",
					top: 0,
					width: "210mm",
					overflow: "hidden",
				}}
			>
				{Array.from({ length: totalPages }).map((_, pageIndex) => (
					<div key={pageIndex} className="pdf-page">
						<TicketPage
							tickets={getTicketsForPage(pageIndex + 1)}
							pageNumber={pageIndex + 1}
							totalPages={totalPages}
						/>
					</div>
				))}
			</div>

			{/* Print Styles */}
			<style>{`
				@media print {
					@page {
						size: A4 portrait;
						margin: 0;
					}
					body {
						-webkit-print-color-adjust: exact;
						print-color-adjust: exact;
					}
					.print\\:hidden {
						display: none !important;
					}
					.print\\:shadow-none {
						box-shadow: none !important;
					}
					.print\\:block {
						display: block !important;
					}
				}
			`}</style>
		</div>
	);
}

export const Route = createRoute({
	getParentRoute: () => dashboardRoute,
	path: "/tickets/print",
	component: TicketsPrintPage,
});
