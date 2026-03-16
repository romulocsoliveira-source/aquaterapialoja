
ALTER TABLE public.profiles ADD COLUMN first_login boolean NOT NULL DEFAULT false;

-- Set first_login = true for the aquaterapia admin user
UPDATE public.profiles SET first_login = true WHERE user_id = (SELECT id FROM auth.users WHERE email = 'aquaterapia.e.v@gmail.com');
