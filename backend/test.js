require('dotenv').config();
const supabase = require('./src/services/supabaseClient');
const emailService = require('./src/services/emailService');
const calendarService = require('./src/services/calendarService');

async function testIntegrations() {
    console.log('Testing all integrations...\n');

    try {
        // 1. Test Supabase Connection
        console.log('Testing Supabase connection...');
        const { data, error } = await supabase
            .from('bookings')
            .select('count')
            .limit(1);
        
        if (error) throw error;
        console.log('✅ Supabase connection successful\n');

        // 2. Test Google Calendar
        console.log('Testing Google Calendar API...');
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 1);
        
        const slots = await calendarService.getAvailableSlots(startDate, endDate);
        console.log(`✅ Google Calendar API working (found ${slots.length} available slots)\n`);

        // 3. Test Email Service
        console.log('Testing email service...');
        const testBooking = {
            email: process.env.EMAIL_USER,
            dateTime: new Date(),
            status: 'test'
        };
        
        await emailService.sendAdminNotification(testBooking);
        console.log('✅ Email service working\n');

        console.log('All integrations are working correctly! 🎉');
        process.exit(0);
    } catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    }
}

testIntegrations(); 