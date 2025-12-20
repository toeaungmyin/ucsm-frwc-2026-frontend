import type { Request, Response, NextFunction } from "express";
import { prisma } from "@/config/index.js";
import { sendSuccess, sendCreated } from "@/utils/index.js";
import { AppError } from "@/middleware/index.js";
import type { GenerateTicketsInput } from "./tickets.schema.js";

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

	show: async (
		req: Request<{ serial: string }>,
		res: Response,
		next: NextFunction
	): Promise<void> => {
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

	destroy: async (
		req: Request<{ serial: string }>,
		res: Response,
		next: NextFunction
	): Promise<void> => {
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
};

export default ticketsController;
