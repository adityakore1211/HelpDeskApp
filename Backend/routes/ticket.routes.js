
const express = require("express");
const router = express.Router();

const {createTicket,getRecentTickets,
  getMyTickets,getTicketById,
  updateTicket} = require("../controllers/ticket.controller");

const {protect,adminOnly} = require("../middleware/auth.middleware");

// All ticket routes require login
router.use(protect);

// Create a ticket for the logged-in user
router.post("/", createTicket);

// Get ALL tickets created by the logged-in user
router.get("/my", getMyTickets);

// Get recent tickets for the dashboard
router.get("/recent", getRecentTickets);

// Only admins can update tickets
router.put("/:id", adminOnly, updateTicket);

// View one ticket (ownership checked in controller)
router.get("/:id", getTicketById);

module.exports = router;
