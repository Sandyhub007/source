require('dotenv').config();
const calendlyService = require('./src/services/calendlyService');

async function testCalendly() {
    try {
        console.log('Testing Calendly integration...\n');

        // Test getting available slots
        console.log('Testing available slots...');
        const startTime = new Date();
        const endTime = new Date();
        endTime.setDate(endTime.getDate() + 7);
        
        const slots = await calendlyService.getAvailableSlots(startTime, endTime);
        console.log('✅ Successfully fetched available slots');
        console.log(`Found ${slots.length} available slots\n`);

        // Test creating a booking (commented out to prevent actual booking)
        /*
        console.log('Testing booking creation...');
        const booking = await calendlyService.createBooking(
            'test@example.com',
            slots[0].start_time
        );
        console.log('✅ Successfully created test booking');
        console.log('Booking details:', booking);
        */

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
}

testCalendly(); 