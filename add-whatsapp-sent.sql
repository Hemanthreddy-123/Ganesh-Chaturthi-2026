-- Add whatsapp_sent column to persons table
ALTER TABLE persons ADD COLUMN IF NOT EXISTS whatsapp_sent BOOLEAN DEFAULT FALSE;
ALTER TABLE persons ADD COLUMN IF NOT EXISTS whatsapp_sent_at TIMESTAMP;
