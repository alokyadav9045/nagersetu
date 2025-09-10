#!/bin/bash
# Terminal Error Fix Script for NagarSetu

echo "=== Fixing Terminal Errors ==="

echo "1. Updating Supabase dependencies..."
npm uninstall @supabase/auth-helpers-nextjs @supabase/auth-helpers-shared
npm install @supabase/ssr

echo "2. Removing Jest dependencies..."
npm uninstall jest @types/jest jest-environment-jsdom @testing-library/jest-dom @testing-library/react @testing-library/user-event

echo "3. Installing missing UI dependencies..."
npm install @radix-ui/react-textarea

echo "4. Critical file fixes needed:"
echo "   - Replace 'createClientComponentClient' with 'createClient' in all files"
echo "   - Replace 'createMiddlewareClient' with 'createServerClient' in middleware"
echo "   - Fix all 'error: any' to 'error: unknown'"
echo "   - Fix HTML entities: Don't -> Don&apos;t, \"text\" -> &quot;text&quot;"
echo "   - Add missing imports for Lucide icons and UI components"

echo "5. Files requiring manual fixes:"
echo "   src/app/admin/diagnostic/page.tsx"
echo "   src/app/admin/issues/page.tsx"
echo "   src/app/admin/users/page.tsx"
echo "   src/app/admin/page.tsx"
echo "   src/app/diagnostic/page.tsx"
echo "   src/app/issue/[id]/page.tsx"
echo "   src/app/page.tsx"
echo "   src/app/profile/page.tsx"
echo "   src/app/report/page.tsx"
echo "   src/app/test-supabase/page.tsx"
echo "   src/app/forgot-password/page.tsx"
echo "   src/components/ErrorBoundary.tsx"
echo "   src/components/auth/AuthModal.tsx"
echo "   src/components/layout/Navbar.tsx"
echo "   src/components/layout/Footer.tsx"
echo "   src/lib/database.types.ts"

echo "=== Error Fix Complete ==="
echo "Manual fixes still required for TypeScript errors and HTML entities"