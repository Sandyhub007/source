require('dotenv').config();
const supabase = require('./src/services/supabaseClient');

async function testSupabase() {
    try {
        console.log('Testing Supabase connection...');

        // Test database connection
        const { data, error } = await supabase
            .from('bookings')
            .select('*')
            .limit(1);

        if (error) throw error;

        console.log('✅ Successfully connected to Supabase!');
        console.log('Data:', data);

        // Test slot availability function
        const { data: availabilityCheck, error: availabilityError } = await supabase
            .rpc('is_slot_available', {
                check_time: new Date().toISOString()
            });

        if (availabilityError) throw availabilityError;

        console.log('✅ Slot availability function working!');
        console.log('Current slot available:', availabilityCheck);

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testSupabase(); 