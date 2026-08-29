import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const env = fs.readFileSync(path.resolve('./.env'), 'utf-8');
const supabaseUrl = env.match(/VITE_SUPABASE_URL="(.*?)"/)[1];
const supabaseKey = env.match(/VITE_SUPABASE_PUBLISHABLE_KEY="(.*?)"/)[1];
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    const { data, error } = await supabase.from('admin_credentials_reference').select('*');
    if (error) {
        console.error(error);
    } else {
        console.log(JSON.stringify(data, null, 2));
    }
}

run();
