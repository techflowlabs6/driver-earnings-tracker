import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://jtsnflwjbpmexclyejcq.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0c25mbHdqYnBtZXhjbHllamNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU0MDE3MDIsImV4cCI6MjEwMDk3NzcwMn0.EH_1Q1PB3pnkB8CUIyuCFmhPBO5RIRu90moOL0kDnUU';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  db: {
    schema: 'driver_tracker',
  },
});
