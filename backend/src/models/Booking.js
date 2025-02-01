const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    dateTime: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled'],
        default: 'pending'
    },
    googleEventId: {
        type: String,
        sparse: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for querying bookings by date range
bookingSchema.index({ dateTime: 1 });

// Method to check if a time slot is available
bookingSchema.statics.isTimeSlotAvailable = async function(dateTime) {
    const existingBooking = await this.findOne({
        dateTime: dateTime,
        status: { $ne: 'cancelled' }
    });
    return !existingBooking;
};

module.exports = mongoose.model('Booking', bookingSchema); 