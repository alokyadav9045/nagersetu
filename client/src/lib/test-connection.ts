import { supabase } from './supabase'

export async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('issue_categories')
      .select('*')
      .limit(1)
    
    if (error) throw error
    console.log('✅ Database connection successful:', data)
    return true
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    return false
  }
}
