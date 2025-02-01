const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ovfhlfuyigreshxzplea.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase; 