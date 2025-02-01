const supabase = require('../services/supabaseClient');
const emailService = require('../services/emailService');
const calendlyService = require('../services/calendlyService');
const { validationResult } = require('express-validator');
const moment = require('moment');

exports.getAvailableSlots = async (req, res) => {
    try {
        const startDate = new Date(req.query.startDate);
        const endDate = new Date(req.query.endDate);

        // Get available slots from Calendly
        const availableSlots = await calendlyService.getAvailableSlots(startDate, endDate);
        
        // Get booked slots from Supabase
        const { data: bookedSlots, error } = await supabase
            .from('bookings')
            .select('dateTime')
            .gte('dateTime', startDate.toISOString())
            .lte('dateTime', endDate.toISOString())
            .neq('status', 'cancelled');

        if (error) throw error;

        // Filter out booked slots
        const finalAvailableSlots = availableSlots.filter(slot => 
            !bookedSlots.some(booking => 
                new Date(booking.dateTime).getTime() === new Date(slot.start_time).getTime()
            )
        );

        res.json(finalAvailableSlots);
    } catch (error) {
        console.error('Error getting available slots:', error);
        res.status(500).json({ message: 'Error fetching available slots' });
    }
};

exports.createBooking = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, dateTime } = req.body;

        // Check if slot is available
        const { data: existingBooking } = await supabase
            .from('bookings')
            .select()
            .eq('dateTime', new Date(dateTime).toISOString())
            .neq('status', 'cancelled')
            .single();

        if (existingBooking) {
            return res.status(400).json({ message: 'This time slot is no longer available' });
        }

        // Create Calendly event
        const calendlyEvent = await calendlyService.createBooking(email, dateTime);

        // Create booking in Supabase
        const { data: booking, error } = await supabase
            .from('bookings')
            .insert([{
                email,
                dateTime: new Date(dateTime).toISOString(),
                status: 'confirmed',
                calendlyEventId: calendlyEvent.id
            }])
            .select()
            .single();

        if (error) throw error;

        // Send confirmation emails
        await Promise.all([
            emailService.sendBookingConfirmation({
                ...booking,
                joinUrl: calendlyEvent.joinUrl
            }),
            emailService.sendAdminNotification(booking)
        ]);

        res.status(201).json({
            message: 'Booking confirmed successfully',
            booking,
            joinUrl: calendlyEvent.joinUrl
        });
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({ message: 'Error creating booking' });
    }
};

exports.getBookings = async (req, res) => {
    try {
        const { email } = req.query;
        const { data: bookings, error } = await supabase
            .from('bookings')
            .select()
            .eq('email', email)
            .order('dateTime', { ascending: false })
            .limit(10);

        if (error) throw error;
        
        res.json(bookings);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ message: 'Error fetching bookings' });
    }
};

exports.cancelBooking = async (req, res) => {
    try {
        const { id } = req.params;

        // Get booking details
        const { data: booking, error: fetchError } = await supabase
            .from('bookings')
            .select()
            .eq('id', id)
            .single();

        if (fetchError || !booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Check if cancellation is allowed (24 hours before)
        const now = new Date();
        const bookingTime = new Date(booking.dateTime);
        const hoursDifference = (bookingTime - now) / (1000 * 60 * 60);

        if (hoursDifference < 24) {
            return res.status(400).json({ 
                message: 'Cancellations must be made at least 24 hours before the session' 
            });
        }

        // Cancel Calendly event
        if (booking.calendlyEventId) {
            await calendlyService.cancelBooking(booking.calendlyEventId);
        }

        // Update booking status
        const { error: updateError } = await supabase
            .from('bookings')
            .update({ status: 'cancelled' })
            .eq('id', id);

        if (updateError) throw updateError;

        res.json({ message: 'Booking cancelled successfully' });
    } catch (error) {
        console.error('Error cancelling booking:', error);
        res.status(500).json({ message: 'Error cancelling booking' });
    }
}; 