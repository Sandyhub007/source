const { google } = require('googleapis');
const moment = require('moment');

class CalendarService {
    constructor() {
        this.oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
        );

        this.oauth2Client.setCredentials({
            refresh_token: process.env.GOOGLE_REFRESH_TOKEN
        });

        this.calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
    }

    async createEvent(booking) {
        const startTime = moment(booking.dateTime);
        const endTime = moment(booking.dateTime).add(45, 'minutes');

        const event = {
            summary: 'Soul Connect Session',
            description: `Session with ${booking.email}`,
            start: {
                dateTime: startTime.toISOString(),
                timeZone: 'UTC'
            },
            end: {
                dateTime: endTime.toISOString(),
                timeZone: 'UTC'
            },
            attendees: [
                { email: booking.email },
                { email: process.env.EMAIL_USER }
            ],
            reminders: {
                useDefault: false,
                overrides: [
                    { method: 'email', minutes: 60 },
                    { method: 'popup', minutes: 10 }
                ]
            },
            conferenceData: {
                createRequest: {
                    requestId: booking._id,
                    conferenceSolutionKey: { type: 'hangoutsMeet' }
                }
            }
        };

        try {
            const response = await this.calendar.events.insert({
                calendarId: 'primary',
                resource: event,
                conferenceDataVersion: 1
            });

            return response.data;
        } catch (error) {
            console.error('Error creating calendar event:', error);
            throw error;
        }
    }

    async getAvailableSlots(startDate, endDate) {
        try {
            const response = await this.calendar.events.list({
                calendarId: 'primary',
                timeMin: startDate.toISOString(),
                timeMax: endDate.toISOString(),
                singleEvents: true,
                orderBy: 'startTime'
            });

            const events = response.data.items;
            const busySlots = events.map(event => ({
                start: moment(event.start.dateTime || event.start.date),
                end: moment(event.end.dateTime || event.end.date)
            }));

            // Generate all possible 30-minute slots
            const availableSlots = [];
            let currentSlot = moment(startDate).startOf('day').add(9, 'hours'); // Start at 9 AM
            const dayEnd = moment(startDate).startOf('day').add(17, 'hours'); // End at 5 PM

            while (currentSlot.isBefore(dayEnd)) {
                const slotEnd = moment(currentSlot).add(45, 'minutes');
                const isSlotAvailable = !busySlots.some(busy => 
                    (currentSlot.isBetween(busy.start, busy.end, null, '[]') ||
                    slotEnd.isBetween(busy.start, busy.end, null, '[]'))
                );

                if (isSlotAvailable) {
                    availableSlots.push(currentSlot.toDate());
                }

                currentSlot.add(30, 'minutes');
            }

            return availableSlots;
        } catch (error) {
            console.error('Error fetching calendar events:', error);
            throw error;
        }
    }
}

module.exports = new CalendarService(); 