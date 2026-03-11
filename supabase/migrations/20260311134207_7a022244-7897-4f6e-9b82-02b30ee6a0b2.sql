-- Create pets table
CREATE TABLE public.pets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  nome text NOT NULL,
  especie text NOT NULL DEFAULT 'Cão',
  raca text,
  idade text,
  peso text,
  observacoes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own pets" ON public.pets FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own pets" ON public.pets FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own pets" ON public.pets FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own pets" ON public.pets FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all pets" ON public.pets FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update all pets" ON public.pets FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Create servicos table
CREATE TABLE public.servicos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  descricao text,
  preco numeric NOT NULL DEFAULT 0,
  duracao text DEFAULT '1h',
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.servicos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read active servicos" ON public.servicos FOR SELECT TO anon, authenticated USING (ativo = true);
CREATE POLICY "Admins can manage servicos" ON public.servicos FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create agendamentos table
CREATE TABLE public.agendamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  pet_id uuid NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  servico_id uuid REFERENCES public.servicos(id),
  data date NOT NULL,
  horario text NOT NULL,
  status text NOT NULL DEFAULT 'pendente',
  observacoes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own agendamentos" ON public.agendamentos FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own agendamentos" ON public.agendamentos FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all agendamentos" ON public.agendamentos FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update agendamentos" ON public.agendamentos FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete agendamentos" ON public.agendamentos FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Create acomodacoes_hotel table
CREATE TABLE public.acomodacoes_hotel (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  descricao text,
  preco_diaria numeric NOT NULL DEFAULT 0,
  capacidade integer NOT NULL DEFAULT 1,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.acomodacoes_hotel ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read active acomodacoes" ON public.acomodacoes_hotel FOR SELECT TO anon, authenticated USING (ativo = true);
CREATE POLICY "Admins can manage acomodacoes" ON public.acomodacoes_hotel FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create reservas_hotel table
CREATE TABLE public.reservas_hotel (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  pet_id uuid NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  acomodacao_id uuid NOT NULL REFERENCES public.acomodacoes_hotel(id),
  checkin date NOT NULL,
  checkout date NOT NULL,
  servicos_extras text[] DEFAULT '{}',
  observacoes text,
  valor_total numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pendente',
  forma_pagamento text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.reservas_hotel ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own reservas" ON public.reservas_hotel FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own reservas" ON public.reservas_hotel FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all reservas" ON public.reservas_hotel FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update reservas" ON public.reservas_hotel FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete reservas" ON public.reservas_hotel FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));