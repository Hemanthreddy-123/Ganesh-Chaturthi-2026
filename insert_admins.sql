DO $$
DECLARE
  uuid1 UUID := gen_random_uuid();
  uuid2 UUID := gen_random_uuid();
  uuid3 UUID := gen_random_uuid();
  uuid4 UUID := gen_random_uuid();
BEGIN

  -- 1. Insert into auth.users (Authentication)
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES
  (uuid1, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'vamsikrishna.reddy@depur-ganesh.com', crypt('Vamsi@2026', gen_salt('bf')), now(), '{"provider": "email", "providers": ["email"]}', '{"name": "ముక్కమల్ల వంశీకృష్ణ రెడ్డి"}', now(), now()),
  (uuid2, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'madhu.reddy@depur-ganesh.com', crypt('Madhu@2026', gen_salt('bf')), now(), '{"provider": "email", "providers": ["email"]}', '{"name": "చాగం మధు రెడ్డి"}', now(), now()),
  (uuid3, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'balaji.ravilla@depur-ganesh.com', crypt('BalajiR@2026', gen_salt('bf')), now(), '{"provider": "email", "providers": ["email"]}', '{"name": "రావిల్ల బాలాజీ"}', now(), now()),
  (uuid4, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'balaji.kukkapalli@depur-ganesh.com', crypt('BalajiK@2026', gen_salt('bf')), now(), '{"provider": "email", "providers": ["email"]}', '{"name": "కుక్కపల్లి బాలాజీ"}', now(), now());

  -- 2. Insert into auth.identities
  INSERT INTO auth.identities (provider_id, id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  VALUES
  (uuid1::text, uuid1, uuid1, format('{"sub":"%s","email":"%s"}', uuid1::text, 'vamsikrishna.reddy@depur-ganesh.com')::jsonb, 'email', now(), now(), now()),
  (uuid2::text, uuid2, uuid2, format('{"sub":"%s","email":"%s"}', uuid2::text, 'madhu.reddy@depur-ganesh.com')::jsonb, 'email', now(), now(), now()),
  (uuid3::text, uuid3, uuid3, format('{"sub":"%s","email":"%s"}', uuid3::text, 'balaji.ravilla@depur-ganesh.com')::jsonb, 'email', now(), now(), now()),
  (uuid4::text, uuid4, uuid4, format('{"sub":"%s","email":"%s"}', uuid4::text, 'balaji.kukkapalli@depur-ganesh.com')::jsonb, 'email', now(), now(), now());

  -- 3. Upsert into public.profiles (to handle trigger auto-creates)
  INSERT INTO public.profiles (user_id, email, name, phone_number, role, status, created_at, updated_at)
  VALUES
  (uuid1, 'vamsikrishna.reddy@depur-ganesh.com', 'ముక్కమల్ల వంశీకృష్ణ రెడ్డి', '7901264866', 'admin', 'approved', now(), now()),
  (uuid2, 'madhu.reddy@depur-ganesh.com', 'చాగం మధు రెడ్డి', '7901282647', 'admin', 'approved', now(), now()),
  (uuid3, 'balaji.ravilla@depur-ganesh.com', 'రావిల్ల బాలాజీ', '8179914192', 'admin', 'approved', now(), now()),
  (uuid4, 'balaji.kukkapalli@depur-ganesh.com', 'కుక్కపల్లి బాలాజీ', '8317644166', 'admin', 'approved', now(), now())
  ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    phone_number = EXCLUDED.phone_number,
    role = EXCLUDED.role,
    status = EXCLUDED.status,
    updated_at = EXCLUDED.updated_at;

END $$;
