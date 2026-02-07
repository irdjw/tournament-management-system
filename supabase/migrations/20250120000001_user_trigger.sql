-- ============================================
-- AUTO-CREATE USER RECORD ON AUTH SIGNUP
-- ============================================

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'player')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call function on auth.users insert
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- ADDITIONAL RLS POLICIES
-- ============================================

-- Players policies
CREATE POLICY "Anyone can view players" ON players FOR SELECT USING (true);
CREATE POLICY "Admins can create players" ON players FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role IN ('system_admin', 'venue_admin', 'tournament_admin')
  )
);
CREATE POLICY "Admins can update players" ON players FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role IN ('system_admin', 'venue_admin', 'tournament_admin')
  )
);
CREATE POLICY "Admins can delete players" ON players FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role IN ('system_admin', 'venue_admin', 'tournament_admin')
  )
);

-- Tournament players policies
CREATE POLICY "Anyone can view tournament players" ON tournament_players FOR SELECT USING (true);
CREATE POLICY "Admins can manage tournament players" ON tournament_players FOR ALL USING (
  EXISTS (
    SELECT 1 FROM tournaments t
    WHERE t.id = tournament_players.tournament_id
    AND (
      t.managed_by = auth.uid() OR
      t.created_by = auth.uid() OR
      EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'system_admin')
    )
  )
);

-- Venues policies
CREATE POLICY "Anyone can view venues" ON venues FOR SELECT USING (true);
CREATE POLICY "Admins can manage venues" ON venues FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role IN ('system_admin', 'venue_admin')
  )
);
