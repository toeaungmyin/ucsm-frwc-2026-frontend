import type { Request, Response, NextFunction } from "express";
import { prisma } from "@/config/index.js";
import { sendSuccess } from "@/utils/index.js";
import { AppError } from "@/middleware/index.js";
import { generateVoterToken } from "@/utils/jwt.js";
import type { AuthenticateTicketInput } from "./tickets.schema.js";

const clientTicketsController = {
	/**
	 * Authenticate a ticket by its UUID
	 * This endpoint is called when a voter scans the QR code on their ticket
	 * URL format: base-url?ticket=uuid
	 */
	authenticate: async (
		req: Request<object, object, AuthenticateTicketInput>,
		res: Response,
		next: NextFunction
	): Promise<void> => {
		try {
			const { ticketId } = req.body;

			// Find the ticket by ID (UUID)
			const ticket = await prisma.ticket.findUnique({
				where: { id: ticketId },
				include: {
					votes: {
						select: {
							categoryId: true,
						},
					},
				},
			});

			if (!ticket) {
				throw new AppError("Invalid ticket. Please check your ticket and try again.", 404);
			}

			// Generate a voter token
			const token = generateVoterToken({
				ticketId: ticket.id,
				serial: ticket.serial,
			});

			// Return the token and ticket info
			sendSuccess(res, {
				token,
				ticket: {
					id: ticket.id,
					serial: ticket.serial,
					votedCategories: ticket.votes.map(v => v.categoryId),
				},
			}, "Ticket authenticated successfully");
		} catch (error) {
			next(error);
		}
	},

	/**
	 * Verify the current voter token and return ticket status
	 */
	verify: async (
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<void> => {
		try {
			const ticketId = (req as Request & { voter?: { ticketId: string } }).voter?.ticketId;

			if (!ticketId) {
				throw new AppError("Invalid token", 401);
			}

			const ticket = await prisma.ticket.findUnique({
				where: { id: ticketId },
				include: {
					votes: {
						select: {
							categoryId: true,
						},
					},
				},
			});

			if (!ticket) {
				throw new AppError("Ticket not found", 404);
			}

			sendSuccess(res, {
				ticket: {
					id: ticket.id,
					serial: ticket.serial,
					votedCategories: ticket.votes.map(v => v.categoryId),
				},
			}, "Ticket verified successfully");
		} catch (error) {
			next(error);
		}
	},
};

export default clientTicketsController;

