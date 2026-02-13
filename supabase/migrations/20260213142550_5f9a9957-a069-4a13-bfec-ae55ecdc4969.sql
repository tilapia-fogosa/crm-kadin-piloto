
CREATE OR REPLACE FUNCTION public.create_pos_venda_activity()
RETURNS TRIGGER AS $$
BEGIN
  -- Só cria registro pós-venda quando a atividade é do tipo 'Matrícula'
  IF NEW.tipo_atividade = 'Matrícula' THEN
    INSERT INTO public.atividade_pos_venda (
      client_id,
      client_activity_id,
      client_name,
      full_name,
      created_by,
      unit_id
    ) VALUES (
      NEW.client_id,
      NEW.id,
      (SELECT name FROM public.clients WHERE id = NEW.client_id),
      NEW.notes,
      NEW.created_by,
      NEW.unit_id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
