-- Criar tabela para ocupações da agenda
CREATE TABLE public.schedule_occupations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  unit_id UUID NOT NULL REFERENCES units(id),
  title TEXT NOT NULL,
  description TEXT,
  start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  active BOOLEAN NOT NULL DEFAULT true
);

-- Habilitar RLS
ALTER TABLE public.schedule_occupations ENABLE ROW LEVEL SECURITY;

-- Política para usuários poderem ver ocupações de suas unidades
CREATE POLICY "Users can view occupations from their units" 
ON public.schedule_occupations 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM unit_users 
    WHERE unit_users.unit_id = schedule_occupations.unit_id 
    AND unit_users.user_id = auth.uid() 
    AND unit_users.active = true
  )
);

-- Política para usuários poderem criar ocupações em suas unidades
CREATE POLICY "Users can create occupations in their units" 
ON public.schedule_occupations 
FOR INSERT 
WITH CHECK (
  auth.uid() = created_by
  AND EXISTS (
    SELECT 1 FROM unit_users 
    WHERE unit_users.unit_id = schedule_occupations.unit_id 
    AND unit_users.user_id = auth.uid() 
    AND unit_users.active = true
  )
);

-- Política para usuários poderem atualizar ocupações que criaram
CREATE POLICY "Users can update their own occupations" 
ON public.schedule_occupations 
FOR UPDATE 
USING (
  auth.uid() = created_by
  AND EXISTS (
    SELECT 1 FROM unit_users 
    WHERE unit_users.unit_id = schedule_occupations.unit_id 
    AND unit_users.user_id = auth.uid() 
    AND unit_users.active = true
  )
);

-- Política para usuários poderem deletar ocupações que criaram
CREATE POLICY "Users can delete their own occupations" 
ON public.schedule_occupations 
FOR DELETE 
USING (
  auth.uid() = created_by
  AND EXISTS (
    SELECT 1 FROM unit_users 
    WHERE unit_users.unit_id = schedule_occupations.unit_id 
    AND unit_users.user_id = auth.uid() 
    AND unit_users.active = true
  )
);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION public.update_schedule_occupations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_schedule_occupations_updated_at
BEFORE UPDATE ON public.schedule_occupations
FOR EACH ROW
EXECUTE FUNCTION public.update_schedule_occupations_updated_at();

-- Índices para performance
CREATE INDEX idx_schedule_occupations_unit_id ON public.schedule_occupations(unit_id);
CREATE INDEX idx_schedule_occupations_start_datetime ON public.schedule_occupations(start_datetime);
CREATE INDEX idx_schedule_occupations_active ON public.schedule_occupations(active);