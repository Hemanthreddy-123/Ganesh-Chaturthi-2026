import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// read .env
const env = fs.readFileSync(path.resolve('./.env'), 'utf-8');
const supabaseUrl = env.match(/VITE_SUPABASE_URL="(.*?)"/)[1];
const supabaseKey = env.match(/VITE_SUPABASE_PUBLISHABLE_KEY="(.*?)"/)[1];

const supabase = createClient(supabaseUrl, supabaseKey);

const users = [
    { name: 'ముక్కమల్ల వంశీకృష్ణ రెడ్డి', email: 'vamsikrishna.reddy@depur-ganesh.com', password: 'Vamsi@2026' },
    { name: 'చాగం మధు రెడ్డి', email: 'madhu.reddy@depur-ganesh.com', password: 'Madhu@2026' },
    { name: 'రావిల్ల బాలాజీ', email: 'balaji.ravilla@depur-ganesh.com', password: 'BalajiR@2026' },
    { name: 'కుక్కపల్లి బాలాజీ', email: 'balaji.kukkapalli@depur-ganesh.com', password: 'BalajiK@2026' }
];

async function run() {
    for (const u of users) {
        console.log(`Creating user ${u.email}...`);
        const { data, error } = await supabase.auth.signUp({
            email: u.email,
            password: u.password,
            options: {
                data: {
                    name: u.name,
                }
            }
        });
        if (error) {
            console.error(`Error creating ${u.email}:`, error.message);
        } else {
            console.log(`Successfully created ${u.email}. User ID: ${data.user?.id}`);

            // we might need to insert into admin_credentials_reference if that's a thing
            const { error: insErr } = await supabase.from('admin_credentials_reference').insert({
                name: u.name,
                email: u.email,
                temp_password: u.password
            });
            if (insErr) {
                console.warn(`Could not insert into admin_credentials_reference:`, insErr.message);
            }

            // also create profile if it doesn't auto trigger
            const { error: profErr } = await supabase.from('profiles').upsert({
                user_id: data.user?.id,
                name: u.name,
                email: u.email,
                role: 'admin',
                status: 'active'
            });
            if (profErr) {
                console.warn(`Could not insert into profiles:`, profErr.message);
            }
        }
    }
}

run();
