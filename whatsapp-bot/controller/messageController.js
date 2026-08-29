require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const ws = require('ws');
const fs = require('fs');
const path = require('path');

// ── Supabase setup ────────────────────────────────────────────────────────────
// Node 20 has no native WebSocket — must pass ws transport explicitly
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  {
    realtime: {
      transport: ws,
    },
  }
);

// ── Sent tracking file ────────────────────────────────────────────────────────
const SENT_FILE = path.join(__dirname, 'sent_numbers.json');

const loadSentNumbers = () => {
  try {
    if (fs.existsSync(SENT_FILE)) {
      return JSON.parse(fs.readFileSync(SENT_FILE, 'utf8'));
    }
  } catch (_) { }
  return [];
};

const saveSentNumber = (phone) => {
  const list = loadSentNumbers();
  if (!list.includes(phone)) {
    list.push(phone);
    fs.writeFileSync(SENT_FILE, JSON.stringify(list, null, 2));
  }
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Normalise phone → WhatsApp ID
 * Strips spaces/dashes/+, prepends 91 (India) if 10-digit number
 */
const formatPhone = (raw) => {
  let num = String(raw).replace(/[\s\-\+\(\)]/g, '');
  if (num.length === 10) num = '91' + num;
  return num + '@c.us';
};

/** Format date nicely: "19 Aug 2026" */
const formatDate = (isoString) => {
  const d = new Date(isoString);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

/** Payment method label */
const paymentLabel = (method) => {
  if (!method) return 'Cash';
  if (method.toLowerCase().includes('phone') || method.toLowerCase().includes('upi')) return 'UPI/PhonePe';
  if (method.toLowerCase().includes('hand') || method.toLowerCase().includes('cash')) return 'Hand Cash';
  return method;
};

// ── Message for persons table (payment receipt) — Telugu ─────────────────────

const buildMessage = (donor) => {
  const name = donor.donor_name || 'భక్తుడు';
  const amount = donor.amount ? `రూ. ${donor.amount}` : 'వర్తించదు';
  const method = paymentLabel(donor.payment_method);
  const date = formatDate(donor.created_at);
  const forWhom = donor.person_name || '';
  const receiptNo = donor.receipt_number || 'వర్తించదు';

  return (
    `🙏 *నమస్కారం ${name} గారూ!*

*గణేష్ చతుర్థి 2026 - దేపూర్ గ్రామం* కోసం మీరు చేసిన విరాళానికి హృదయపూర్వక ధన్యవాదాలు.

మీ చెల్లింపు వివరాలు:

━━━━━━━━━━━━━━━━━━━━
🧾 *రసీదు నంబర్   :* ${receiptNo}
💰 *చెల్లించిన మొత్తం :* ${amount}
💳 *చెల్లింపు విధానం :* ${method}
📅 *తేదీ           :* ${date}${forWhom ? `\n👤 *పేరు           :* ${forWhom}` : ''}
━━━━━━━━━━━━━━━━━━━━

మీ సహకారంతో మన పండుగ మరింత వైభవంగా జరుగుతుంది! 🌸

🌐 *వెబ్‌సైట్ కై ఇక్కడ క్లిక్ చేయండి:*
https://depuru-ganesh-chaturthi-2k26.netlify.app/

*గణపతి బప్పా మోర్యా!* 🎉
_దేపూర్ గ్రామ గణేష్ చతుర్థి కమిటీ-2026_

_⚠️ Disclaimer: This is an auto-generated message. Please do not reply to this message._`
  );
};

// ── Message for donations table (donor receipt) — Telugu ─────────────────────

const buildDonorMessage = (donor) => {
  const name = donor.donor_name || 'భక్తుడు';
  const items = donor.items_donated || 'వర్తించదు';
  const estValue = donor.amount && donor.amount > 0 ? `రూ. ${donor.amount}` : null;
  const date = formatDate(donor.created_at);
  const receiptNo = donor.receipt_number || 'వర్తించదు';

  return (
    `🙏 *నమస్కారం ${name} గారూ!*

*గణేష్ చతుర్థి 2026 - దేపూర్ గ్రామం* కోసం మీరు అందించిన వస్తు విరాళానికి హృదయపూర్వక ధన్యవాదాలు.

మీ విరాళం వివరాలు:

━━━━━━━━━━━━━━━━━━━━
🧾 *రసీదు నంబర్      :* ${receiptNo}
🎁 *అందించిన వస్తువులు :* ${items}${estValue ? `\n� *అంచనా విలువ      :* ${estValue}` : ''}
📅 *తేదీ              :* ${date}
━━━━━━━━━━━━━━━━━━━━

మీ దాతృత్వంతో మన గ్రామ పండుగ మరింత వైభవంగా జరుగుతుంది! 🌸

🌐 *వెబ్‌సైట్ కై ఇక్కడ క్లిక్ చేయండి:*
https://depuru-ganesh-chaturthi-2k26.netlify.app/

*గణపతి బప్పా మోర్యా!* 🎉
_దేపూర్ గ్రామ గణేష్ చతుర్థి కమిటీ-2026_

_⚠️ Disclaimer: This is an auto-generated message. Please do not reply to this message._`
  );
};
// ── Fetch all recipients with phone numbers (persons + donations tables) ──────

const fetchDonorsWithPhone = async () => {
  const results = [];

  // 1. persons table — payment receipts
  const { data: personsData, error: personsError } = await supabase
    .from('persons')
    .select('name, phone_number, amount_paid, payment_method, created_at, receipt_number')
    .not('phone_number', 'is', null)
    .neq('phone_number', '');

  if (personsError) {
    console.warn('⚠️  persons table error:', personsError.message);
  } else if (personsData && personsData.length > 0) {
    console.log(`📋 Found ${personsData.length} records in persons table`);
    personsData.forEach(u => results.push({
      donor_name: u.name,
      donor_phone: u.phone_number,
      amount: u.amount_paid,
      payment_method: u.payment_method,
      person_name: u.name,
      created_at: u.created_at,
      receipt_number: u.receipt_number,
      _source: 'persons',   // used to pick the right message template
    }));
  }

  // 2. donations table — donor receipts (always fetched, not a fallback)
  const { data: donationData, error: donationError } = await supabase
    .from('donations')
    .select('donor_name, donor_phone, items_donated, amount, created_at, receipt_number')
    .not('donor_phone', 'is', null)
    .neq('donor_phone', '');

  if (donationError) {
    console.warn('⚠️  donations table error:', donationError.message);
  } else if (donationData && donationData.length > 0) {
    console.log(`📋 Found ${donationData.length} records in donations table`);
    donationData.forEach(u => results.push({ ...u, _source: 'donations' }));
  }

  if (results.length === 0) {
    console.log('⚠️  No phone numbers found in any table');
  }

  return results;
};

// ── Controller ────────────────────────────────────────────────────────────────

/**
 * POST /api/send-bulk-message
 * Sends each donor their own payment receipt via WhatsApp
 */
const sendBulkMessages = async (req, res) => {
  const client = req.whatsappClient;

  // Wait up to 15s for client.info to be available
  let retries = 0;
  while ((!client || !client.info) && retries < 15) {
    await new Promise(r => setTimeout(r, 1000));
    retries++;
  }

  if (!client || !client.info) {
    return res.status(503).json({
      success: false,
      error: 'WhatsApp is not ready yet. Wait for "WhatsApp Ready" message in terminal, then try again.',
    });
  }

  let donors = [];
  try {
    donors = await fetchDonorsWithPhone();
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }

  if (donors.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'No phone numbers found in database. Please add phone numbers in Supabase persons table.',
    });
  }

  console.log(`\n📨 Starting personalized payment messages to ${donors.length} donors...\n`);

  // Respond immediately — sending runs in background
  res.json({
    success: true,
    message: `Bulk send started. Already sent numbers will be skipped.`,
    total: donors.length,
  });

  // ── Send loop ─────────────────────────────────────────────────────────────
  const results = { sent: 0, failed: 0, skipped: 0, errors: [] };
  const alreadySent = loadSentNumbers();

  for (let i = 0; i < donors.length; i++) {
    const donor = donors[i];
    const rawPhone = donor.donor_phone;

    if (!rawPhone) {
      console.warn(`⚠️  Skipping ${donor.donor_name} — no phone`);
      results.failed++;
      continue;
    }

    // Skip if already sent
    if (alreadySent.includes(rawPhone)) {
      console.log(`⏭️  Already sent → ${donor.donor_name} (${rawPhone}) — skipping`);
      results.skipped++;
      continue;
    }

    const whatsappId = formatPhone(rawPhone);
    // Use donor-specific template for donations table, payment template for persons
    const message = donor._source === 'donations'
      ? buildDonorMessage(donor)
      : buildMessage(donor);

    try {
      await client.sendMessage(whatsappId, message);
      // Mark as sent in DB — only update persons table for persons records
      if (donor._source === 'persons') {
        const { data: updateData, error: dbError } = await supabase
          .from('persons')
          .update({
            whatsapp_sent: true,
            whatsapp_sent_at: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
          })
          .eq('phone_number', rawPhone)
          .select();
        if (dbError) {
          console.warn(`⚠️  DB update failed for ${rawPhone}: ${dbError.message}`);
        } else {
          console.log(`💾 DB updated for ${rawPhone} — rows affected: ${updateData?.length}`);
        }
      } else if (donor._source === 'donations') {
        const { data: updateData, error: dbError } = await supabase
          .from('donations')
          .update({
            whatsapp_sent: true,
            whatsapp_sent_at: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
          })
          .eq('donor_phone', rawPhone)
          .select();
        if (dbError) {
          console.warn(`⚠️  DB update failed for ${rawPhone}: ${dbError.message}`);
        } else {
          console.log(`💾 DB updated for ${rawPhone} — rows affected: ${updateData?.length}`);
        }
      }
      saveSentNumber(rawPhone);
      results.sent++;
      console.log(`✅ Message Sent [${donor._source}] → ${donor.donor_name} (${rawPhone})`);
    } catch (err) {
      results.failed++;
      results.errors.push({ name: donor.donor_name, phone: rawPhone, error: err.message });
      console.error(`❌ Failed → ${donor.donor_name} (${rawPhone}): ${err.message}`);
    }

    // 5-second delay between messages (skip after last one)
    if (i < donors.length - 1) {
      await delay(5000);
    }
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log('\n📊 Bulk Send Complete:');
  console.log(`   ✅ Sent    : ${results.sent}`);
  console.log(`   ⏭️  Skipped : ${results.skipped} (already sent)`);
  console.log(`   ❌ Failed  : ${results.failed}`);
  if (results.errors.length > 0) {
    console.log('   Failed list:');
    results.errors.forEach((e) =>
      console.log(`     - ${e.name} (${e.phone}): ${e.error}`)
    );
  }
  console.log('');
};

module.exports = { sendBulkMessages };
