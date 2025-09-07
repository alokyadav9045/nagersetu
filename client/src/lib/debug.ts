import { supabase } from './supabase'

export async function debugConnection() {
  try {
    // Test basic connection
    const { data: categories, error: categoryError } = await supabase
      .from('issue_categories')
      .select('*')
      .limit(1)
    
    console.log('✅ Categories fetch:', categories)
    
    // Test auth
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    console.log('✅ Current user:', user)
    
    // Test user profiles (if user exists)
    if (user) {
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      console.log('✅ User profile:', profile)
      if (profileError) console.error('❌ Profile error:', profileError)
    }
    
  } catch (error) {
    console.error('❌ Debug error:', error)
  }
}
