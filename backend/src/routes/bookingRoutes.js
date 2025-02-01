const express = require('express');
const { body } = require('express-validator');
const bookingController = require('../controllers/bookingController');

const router = express.Router();

// Validation middleware
const validateBooking = [
    body('email').isEmail().normalizeEmail(),
    body('dateTime').isISO8601().toDate()
];

// Get available time slots
router.get('/slots', bookingController.getAvailableSlots);

// Create a new booking
router.post('/', validateBooking, bookingController.createBooking);

// Get bookings for a user
router.get('/', bookingController.getBookings);

// Cancel a booking
router.put('/:id/cancel', bookingController.cancelBooking);

module.exports = router; 