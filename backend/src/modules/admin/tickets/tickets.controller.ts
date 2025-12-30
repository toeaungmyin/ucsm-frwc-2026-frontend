import type { Request, Response, NextFunction } from "express";
import { prisma } from "@/config/index.js";
import { sendSuccess, sendCreated } from "@/utils/index.js";
import { AppError } from "@/middleware/index.js";
import type { GenerateTicketsInput, ImportTicketsInput } from "./tickets.schema.js";

// Helper to pad number with leading zeros (e.g., 1 -> "001")
const padSerial = (num: number, length: number = 3): string => {
	return num.toString().padStart(length, "0");
};

const ticketsController = {
	generate: async (
		req: Request<object, object, GenerateTicketsInput>,
		res: Response,
		next: NextFunction
	): Promise<void> => {
		try {
			const { quantity } = req.body;

			if (!quantity || quantity < 1) {
				throw new AppError("Quantity is required and must be greater than 0", 400);
			}

			// Get the highest existing serial number
			const lastTicket = await prisma.ticket.findFirst({
				orderBy: { serial: "desc" },
				select: { serial: true },
			});

			// Parse the last serial number or start from 0
			let lastNumber = 0;
			if (lastTicket?.serial) {
				const parsed = parseInt(lastTicket.serial, 10);
				if (!isNaN(parsed)) {
					lastNumber = parsed;
				}
			}

			// Generate sequential serial numbers
			const serials: string[] = [];
			for (let i = 1; i <= quantity; i++) {
				serials.push(padSerial(lastNumber + i));
			}

			await prisma.ticket.createMany({
				data: serials.map((serial) => ({ serial })),
				skipDuplicates: true,
			});

			// Fetch the created tickets with full data
			const createdTickets = await prisma.ticket.findMany({
				where: { serial: { in: serials } },
				orderBy: { serial: "asc" },
			});

			sendCreated(res, createdTickets, `${quantity} tickets generated successfully`);
		} catch (error) {
			console.log("Tickets generation error", error);
			next(error);
		}
	},

	show: async (req: Request<{ serial: string }>, res: Response, next: NextFunction): Promise<void> => {
		try {
			const { serial } = req.params;

			if (!serial) {
				throw new AppError("Serial is required", 400);
			}

			const ticket = await prisma.ticket.findUnique({
				where: { serial },
			});

			if (!ticket) {
				throw new AppError("Ticket not found", 404);
			}

			sendSuccess(res, ticket, "Ticket found successfully!");
		} catch (error) {
			console.log("Tickets getting error", error);
			next(error);
		}
	},

	index: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const tickets = await prisma.ticket.findMany({
				orderBy: { serial: "asc" },
			});

			sendSuccess(res, tickets, "Tickets fetched successfully!");
		} catch (error) {
			console.log("Tickets getting error", error);
			next(error);
		}
	},

	destroy: async (req: Request<{ serial: string }>, res: Response, next: NextFunction): Promise<void> => {
		try {
			const { serial } = req.params;

			const ticket = await prisma.ticket.findUnique({
				where: { serial },
			});

			if (!ticket) {
				throw new AppError("Ticket not found", 404);
			}

			await prisma.ticket.delete({
				where: { serial },
			});

			sendSuccess(res, null, "Ticket deleted successfully");
		} catch (error) {
			console.log("Ticket deletion error", error);
			next(error);
		}
	},

	destroyAll: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const result = await prisma.ticket.deleteMany();

			sendSuccess(res, { count: result.count }, "All tickets deleted successfully");
		} catch (error) {
			console.log("Bulk tickets deletion error", error);
			next(error);
		}
	},

	export: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const tickets = await prisma.ticket.findMany({
				orderBy: { serial: "asc" },
				select: {
					id: true,
					serial: true,
					createdAt: true,
				},
			});

			const exportData = {
				exportedAt: new Date().toISOString(),
				totalCount: tickets.length,
				tickets: tickets.map((t) => ({
					id: t.id,
					serial: t.serial,
					createdAt: t.createdAt.toISOString(),
				})),
			};

			sendSuccess(res, exportData, "Tickets exported successfully");
		} catch (error) {
			console.log("Tickets export error", error);
			next(error);
		}
	},

	import: async (
		req: Request<object, object, ImportTicketsInput>,
		res: Response,
		next: NextFunction
	): Promise<void> => {
		try {
			const { tickets, skipDuplicates = true } = req.body;

			if (!tickets || !Array.isArray(tickets) || tickets.length === 0) {
				throw new AppError("No tickets provided for import", 400);
			}

			// Validate serial format for all tickets
			const invalidSerials = tickets.filter((t) => !/^\d+$/.test(t.serial));
			if (invalidSerials.length > 0) {
				throw new AppError(
					`Invalid serial format for tickets: ${invalidSerials.map((t) => t.serial).join(", ")}`,
					400
				);
			}

			// Check for existing tickets by both id and serial
			const existingTickets = await prisma.ticket.findMany({
				where: {
					OR: [{ id: { in: tickets.map((t) => t.id) } }, { serial: { in: tickets.map((t) => t.serial) } }],
				},
				select: { id: true, serial: true },
			});
			const existingIds = new Set(existingTickets.map((t) => t.id));
			const existingSerials = new Set(existingTickets.map((t) => t.serial));

			// Filter out duplicates if skipDuplicates is true (check both id and serial)
			const ticketsToImport = skipDuplicates
				? tickets.filter((t) => !existingIds.has(t.id) && !existingSerials.has(t.serial))
				: tickets;

			if (!skipDuplicates && (existingIds.size > 0 || existingSerials.size > 0)) {
				throw new AppError(`Duplicate tickets found: ${Array.from(existingSerials).join(", ")}`, 400);
			}

			if (ticketsToImport.length === 0) {
				sendSuccess(
					res,
					{ imported: 0, skipped: tickets.length, total: tickets.length },
					"All tickets already exist, nothing to import"
				);
				return;
			}

			// Import tickets with their original IDs
			await prisma.ticket.createMany({
				data: ticketsToImport.map((t) => ({ id: t.id, serial: t.serial })),
				skipDuplicates: true,
			});

			const imported = ticketsToImport.length;
			const skipped = tickets.length - imported;

			sendCreated(
				res,
				{ imported, skipped, total: tickets.length },
				`${imported} tickets imported successfully${skipped > 0 ? `, ${skipped} duplicates skipped` : ""}`
			);
		} catch (error) {
			console.log("Tickets import error", error);
			next(error);
		}
	},
};

export default ticketsController;
