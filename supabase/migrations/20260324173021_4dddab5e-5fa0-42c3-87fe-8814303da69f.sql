UPDATE public.payment_settings 
SET 
  environment = 'production',
  is_active = true,
  sandbox_token = NULL,
  production_token = '907dc600-4844-4a67-9470-52d5ec749b9463d194224099a438464ee6f33edb45d78000-6de5-4829-a335-a6d7a3e6514d',
  webhook_url = 'https://ioalaxycbwlwsjodeyqz.supabase.co/functions/v1/pagbank-webhook',
  last_test_at = NULL,
  last_test_status = NULL,
  updated_at = now()
WHERE id = 'e6bd66c3-f0d4-4586-bc44-1a4f573c85a1';