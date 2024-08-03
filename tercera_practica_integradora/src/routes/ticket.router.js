import { Router } from "express";
import { getTickets, getTicketById, renderTicket } from '../controllers/ticket.controller.js'

const router = Router()

router.get('/ticket', getTickets)
router.get('/ticket/:tid', getTicketById)
router.get('/ticket/view/:tid', renderTicket);

export default router;