CREATE TABLE public.profile (
    id bigint primary key generated always as identity,
    user_id uuid NOT NULL,
    data jsonb,
    CONSTRAINT profile_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX ON public.profile (user_id);

-- Add RLS policies
CREATE POLICY "Users can read their own profiles" 
ON public.profile 
FOR SELECT 
TO authenticated 
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert their own profiles" 
ON public.profile 
FOR INSERT 
TO authenticated 
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update their own profiles" 
ON public.profile 
FOR UPDATE 
TO authenticated 
USING ((SELECT auth.uid()) = user_id) 
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete their own profiles" 
ON public.profile 
FOR DELETE 
TO authenticated 
USING ((SELECT auth.uid()) = user_id);