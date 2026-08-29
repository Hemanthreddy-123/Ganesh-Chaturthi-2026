import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const env = fs.readFileSync(path.resolve('./.env'), 'utf-8');
const supabaseUrl = env.match(/VITE_SUPABASE_URL="(.*?)"/)[1];
const supabaseKey = env.match(/VITE_SUPABASE_PUBLISHABLE_KEY="(.*?)"/)[1];
const supabase = createClient(supabaseUrl, supabaseKey);

const users = [
    { email: 'vamsikrishna.reddy@depur-ganesh.com', password: 'Vamsi@2026' },
    { email: 'madhu.reddy@depur-ganesh.com', password: 'Madhu@2026' },
    { email: 'balaji.ravilla@depur-ganesh.com', password: 'BalajiR@2026' },
    { email: 'balaji.kukkapalli@depur-ganesh.com', password: 'BalajiK@2026' }
];

async function run() {
    for (const u of users) {
        console.log(`Checking ${u.email}...`);
        const { data, error } = await supabase.auth.signInWithPassword({
            email: u.email,
            password: u.password
        });
        if (error) {
            console.log(`Error for ${u.email}:`, error.message);
        } else {
            console.log(`Success for ${u.email}:`, data.user.id);
        }
    }
}

run();
