import { NextFunction , Request, Response } from "express";
import { v4 as uuidv4} from "uuid";
import { CheckTicketInput, GenerateTicketsInput } from "./tickets.schema.js";
import { sendSuccess } from "../../utils/response.js";
import { AppError } from "../../middleware/error.middleware.js";
import { prisma } from "../../config/database.js";
const ticketsGenerateController = {
    generateTickets : async (
        req :Request<object,object,GenerateTicketsInput>,
        res : Response ,
        next : NextFunction)
        :Promise<void> => {
        try {
            const { quantity } = req.body;

            if( !quantity || quantity < 1 ){
                throw new AppError("Quantity is required and must be greater than 0", 400);
            }

            const tickets = Array.from({ length: quantity }, () =>`UCSM-${uuidv4()}`);

            await prisma.voter.createMany({
                data : tickets.map((ticket) => ({serial : ticket})),
                skipDuplicates :true
            })
            
            sendSuccess(
                res,
                tickets,
                "Tickets generated successfully"
            );
        } catch (error) {
            console.log("Tickets generation error" , error);
            next(error);
        }
    },
    getTickets : async(
        req : Request<{uuid : string}>,
        res : Response,
        next : NextFunction
    ) : Promise<void> => {
        try{
            const {uuid} = req.params;
            console.log("Request params" , req.params);
            console.log("UUID" , uuid);
            if( !uuid ){
                throw new AppError("UUID is required", 400);
            };

            const ticket = await prisma.voter.findUnique({
                where : {serial : uuid}
            });
            if( !ticket ){
                throw new AppError("Ticket not found", 404);
            };
            sendSuccess(
                res,
                ticket,
                "Ticket found successfully!"
            )
        }catch(error){
            console.log("Tickets getting error" , error);
            next(error);
        }
    },
    getAllTickets : async(
        req : Request,
        res : Response,
        next : NextFunction
    ) : Promise<void> => {
        try{
            const tickets = await prisma.voter.findMany();
            sendSuccess(
                res,
                tickets,
                "Tickets found successfully!"
            )
        }catch(error){
            console.log("Tickets getting error" , error);
            next(error);
        }
    }
};

export default ticketsGenerateController;