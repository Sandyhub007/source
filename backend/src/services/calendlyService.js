const axios = require('axios');

class CalendlyService {
    constructor() {
        this.api = axios.create({
            baseURL: 'https://api.calendly.com',
            headers: {
                'Authorization': `Bearer ${process.env.CALENDLY_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
    }

    async getAvailableSlots(startTime, endTime) {
        try {
            const response = await this.api.get('/scheduling_links', {
                params: {
                    organization: process.env.CALENDLY_USER_URI,
                    count: 100
                }
            });

            return response.data.collection;
        } catch (error) {
            console.error('Error fetching Calendly slots:', error);
            throw error;
        }
    }

    async createBooking(email, dateTime) {
        try {
            // Create an invitee for the event
            const response = await this.api.post('/scheduled_events', {
                event_type: `${process.env.CALENDLY_USER_URI}/45min`,
                start_time: dateTime,
                email,
                name: email.split('@')[0], // Use part of email as name
                timezone: "UTC"
            });

            return {
                id: response.data.resource.id,
                joinUrl: response.data.resource.location?.join_url,
                startTime: response.data.resource.start_time,
                endTime: response.data.resource.end_time
            };
        } catch (error) {
            console.error('Error creating Calendly booking:', error);
            throw error;
        }
    }

    async cancelBooking(eventId) {
        try {
            await this.api.delete(`/scheduled_events/${eventId}`);
            return true;
        } catch (error) {
            console.error('Error cancelling Calendly event:', error);
            throw error;
        }
    }
}

module.exports = new CalendlyService(); 