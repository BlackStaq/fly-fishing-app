import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hhmnavnuzelffxituglm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhobW5hdm51emVsZmZ4aXR1Z2xtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxOTcwNzEsImV4cCI6MjA4ODc3MzA3MX0.PGnR3oBM8-iG9iham_2b98bdFsPOC2Bbm1Nib966J34';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
