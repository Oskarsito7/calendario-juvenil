-- ==========================================================
-- RLS POLICIES PARA CALENDARIO JUVENIL (profiles, events, etc.)
-- Ejecutar en SQL Editor de Supabase
-- ==========================================================

-- 1. HABILITAR RLS EN TODAS LAS TABLAS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.series ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_links ENABLE ROW LEVEL SECURITY;

-- ==========================================================
-- TABLA: profiles
-- ==========================================================

-- Usuarios autenticados pueden leer perfiles (para mostrar nombres)
DROP POLICY IF EXISTS "Allow read profiles" ON public.profiles;
CREATE POLICY "Allow read profiles" ON public.profiles
FOR SELECT TO authenticated USING (true);

-- Usuarios autenticados pueden leer perfiles (anónimo para público)
DROP POLICY IF EXISTS "Allow read profiles public" ON public.profiles;
CREATE POLICY "Allow read profiles public" ON public.profiles
FOR SELECT TO anon USING (true);

-- Cualquier usuario autenticado puede actualizar su propio perfil
DROP POLICY IF EXISTS "Allow update own profile" ON public.profiles;
CREATE POLICY "Allow update own profile" ON public.profiles
FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Para el panel de admin: directores pueden actualizar CUALQUIER perfil (cambiar roles)
-- Esta es la política CRÍTICA que resuelve tu problema
DROP POLICY IF EXISTS "Allow directors to update any profile" ON public.profiles;
CREATE POLICY "Allow directors to update any profile" ON public.profiles
FOR UPDATE TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'director'
  )
) WITH CHECK (true);

-- Insert: solo el propio usuario (trigger handle_new_user también inserta)
DROP POLICY IF EXISTS "Allow insert own profile" ON public.profiles;
CREATE POLICY "Allow insert own profile" ON public.profiles
FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- ==========================================================
-- TABLA: events
-- ==========================================================
DROP POLICY IF EXISTS "Allow read events" ON public.events;
CREATE POLICY "Allow read events" ON public.events
FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow insert events authenticated" ON public.events;
CREATE POLICY "Allow insert events authenticated" ON public.events
FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update events authenticated" ON public.events;
CREATE POLICY "Allow update events authenticated" ON public.events
FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow delete events authenticated" ON public.events;
CREATE POLICY "Allow delete events authenticated" ON public.events
FOR DELETE TO authenticated USING (true);

-- ==========================================================
-- TABLA: event_groups
-- ==========================================================
DROP POLICY IF EXISTS "Allow read event_groups" ON public.event_groups;
CREATE POLICY "Allow read event_groups" ON public.event_groups
FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow write event_groups" ON public.event_groups;
CREATE POLICY "Allow write event_groups" ON public.event_groups
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ==========================================================
-- TABLA: event_images
-- ==========================================================
DROP POLICY IF EXISTS "Allow read event_images" ON public.event_images;
CREATE POLICY "Allow read event_images" ON public.event_images
FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow write event_images" ON public.event_images;
CREATE POLICY "Allow write event_images" ON public.event_images
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ==========================================================
-- TABLA: groups
-- ==========================================================
DROP POLICY IF EXISTS "Allow read groups" ON public.groups;
CREATE POLICY "Allow read groups" ON public.groups
FOR SELECT TO anon, authenticated USING (true);

-- ==========================================================
-- TABLA: calendar_periods
-- ==========================================================
DROP POLICY IF EXISTS "Allow read calendar_periods" ON public.calendar_periods;
CREATE POLICY "Allow read calendar_periods" ON public.calendar_periods
FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow write calendar_periods" ON public.calendar_periods;
CREATE POLICY "Allow write calendar_periods" ON public.calendar_periods
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ==========================================================
-- VERIFICACIÓN: mostrar estado de RLS
-- ==========================================================
SELECT 
  relname AS tabla,
  relrowsecurity AS rls_activado,
  relforcerowsecurity AS rls_forzado
FROM pg_class 
WHERE relname IN (
  'profiles', 'events', 'event_groups', 'event_images', 
  'groups', 'series', 'calendar_periods', 'notifications',
  'activity_logs', 'shared_links'
)
ORDER BY relname;
