const Ticket = require("../models/ticket.model");
const User = require("../models/user.model");
const Counter=require("../models/counter.model")

// Create a ticket for the logged-in user
// Create a ticket for the logged-in user
const createTicket = async (req, res) => {
  try {
    const {title,description,category,
      department,location} = req.body;

    if (!title ||!description || !category 
      ||!department ||!location) {
      return res.status(400).json({
        message: "All ticket fields are required."
      });
    }

    // Atomically generate the next sequential ticket number
    const counter = await Counter.findByIdAndUpdate(
      "ticketId",
      { $inc: { sequence: 1 } },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true
      }
    );

    const ticket = await Ticket.create({
      ticketId: String(counter.sequence),
      title, 
      description,
      category,
      email: req.user.email,
      department,
      location});

    return res.status(201).json({
      message: "Ticket saved successfully!",
      ticket
    });

  } catch (error) {
    console.error("Create ticket error:", error);

    return res.status(500).json({
      message: "Failed to save ticket."
    });
  }
};

// Recent tickets: admins see all; regular users see their own
// Recent tickets: admins see all; regular users see their own

const getRecentTickets = async (req, res) => {
  try {
    const userEmail = req.user.email.trim().toLowerCase();

    // Match tickets by normalized email, including older records
    const query = req.user.role === "admin"
      ? {}
      : {
          $expr: {
            $eq: [
              { $toLower: { $trim: { input: "$email" } } },
              userEmail
            ]
          }
        };

    const tickets = await Ticket.find(query)
      .sort({ createdAt: -1 })
  //Ticket Limite is 50 showing on dashoard
      // .limit(50)
      .lean();

    // Normalize ticket emails for user lookup
    const emails = [
      ...new Set(
        tickets
          .map(ticket =>
            ticket.email?.trim().toLowerCase()
          )
          .filter(Boolean)
      )
    ];

    // Find users with matching normalized email addresses
    const users = await User.find({
      $expr: {
        $in: [
          { $toLower: { $trim: { input: "$email" } } },
          emails
        ]
      }
    })
      .select("username email")
      .lean();

    console.log("Ticket emails:", emails);
    console.log(
      "Matched users:",
      users.map(user => ({
        username: user.username,
        email: user.email
      }))
    );

    // Map normalized email to username
    const userMap = new Map(
      users.map(user => [
        user.email.trim().toLowerCase(),
        user.username
      ])
    );

    const ticketsWithUsername = tickets.map(ticket => ({
      ...ticket,
      username:
        userMap.get(ticket.email?.trim().toLowerCase()) ||
        "Unknown User"
    }));

    return res.status(200).json(ticketsWithUsername);

  } catch (error) {
    console.error("Get recent tickets error:", error);

    return res.status(500).json({
      message: "Failed to fetch recent tickets."
    });
  }
};


// Get every ticket belonging to the logged-in user

const getMyTickets = async (req, res) => {
  try {
    const userEmail = req.user.email.toLowerCase();

    const tickets = await Ticket.find({
      email: userEmail
    }).sort({ createdAt: -1 });

    return res.status(200).json(tickets);
  } catch (error) {
    console.error("Get My Tickets Error:", error);
    return res.status(500).json({
      message: "Failed to fetch your tickets."
    });
  }
};

// View one ticket; users can view only their own
const getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        message: "Ticket not found."
      });
    }

    if (
      req.user.role !== "admin" &&
      ticket.email.toLowerCase() !== req.user.email.toLowerCase()
    ) {
      return res.status(403).json({
        message: "You cannot view another user's ticket."
      });
    }

    return res.status(200).json(ticket);
  } catch (error) {
    console.error("Get ticket error:", error);

    return res.status(400).json({
      message: "Unable to fetch ticket."
    });
  }
};

// Admin-only route: the route middleware enforces the role
const updateTicket = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      priority,
      status
    } = req.body;

    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        category,
        priority,
        status
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!ticket) {
      return res.status(404).json({
        message: "Ticket not found."
      });
    }

    return res.status(200).json({
      message: "Ticket updated successfully.",
      ticket
    });
  } catch (error) {
    console.error("Update ticket error:", error);

    return res.status(400).json({
      message: "Failed to update ticket.",
      error: error.message
    });
  }
};

module.exports = {
  createTicket,
  getRecentTickets,
  getMyTickets,
  getTicketById,
  updateTicket
};
