import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://supabaeyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvdG1hbGVpdWRoc3lkdHFpbGNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc0MDA1MTQsImV4cCI6MjEwMjk3NjUxNH0.7B5NW3flq2iumtV2C8a3BwEvOfxCvaZ0CRushbXiUVsse.com/dashboard/project/hotmaleiudhsydtqilch/settings/api-keys/legacy'
const supabaseAnonKey = ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)