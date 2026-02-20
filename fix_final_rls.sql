-- DEFINITIVE FIX (v3): Force Onboarding Flow
-- Run this in Supabase SQL Editor

-- 1. TRIGGER: Auto-create profile on signup (Keep this)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (user_id, email, full_name, user_type)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), 'client');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. UPDATED APPROVAL: Set role ONLY. Do NOT create barber profile yet.
-- This forces the Dashboard to redirect the user to /onboarding to fill in their logo/details.
CREATE OR REPLACE FUNCTION public.approve_access_request(
  p_request_id UUID, p_user_id UUID, p_shop_name TEXT, 
  p_owner_name TEXT, p_phone TEXT, p_location TEXT DEFAULT ''
) RETURNS JSON AS $$
DECLARE
  caller_role TEXT;
  target_email TEXT;
BEGIN
  -- Verify Admin
  SELECT role INTO caller_role FROM public.users WHERE user_id = auth.uid();
  IF caller_role != 'admin' THEN RAISE EXCEPTION 'Not admin'; END IF;
  
  -- Get user email
  SELECT email INTO target_email FROM auth.users WHERE id = p_user_id;

  -- Update request status
  UPDATE public.access_requests SET status = 'approved' WHERE id = p_request_id;

  -- Approve Role (Upsert user record if missing)
  INSERT INTO public.users (user_id, email, full_name, role, user_type)
  VALUES (p_user_id, target_email, p_owner_name, 'barber', 'barber')
  ON CONFLICT (user_id) DO UPDATE SET role = 'barber', user_type = 'barber';

  -- NOTE: We intentionally do NOT create the 'barbers' record here anymore.
  -- This ensures the user is redirected to /onboarding when they first login.

  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Get my request (Keep this)
CREATE OR REPLACE FUNCTION public.get_my_access_request()
RETURNS JSON AS $$
BEGIN
  RETURN (SELECT row_to_json(t) FROM (
    SELECT * FROM public.access_requests WHERE user_id = auth.uid() 
    ORDER BY created_at DESC LIMIT 1
  ) t);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Reject request (Keep this)
CREATE OR REPLACE FUNCTION public.reject_access_request(p_request_id UUID)
RETURNS VOID AS $$
DECLARE
  caller_role TEXT;
BEGIN
  SELECT role INTO caller_role FROM public.users WHERE user_id = auth.uid();
  IF caller_role != 'admin' THEN RAISE EXCEPTION 'Not admin'; END IF;
  UPDATE public.access_requests SET status = 'rejected' WHERE id = p_request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
