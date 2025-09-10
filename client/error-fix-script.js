// Comprehensive Error Fix Script for NagarSetu
// Run this after fixing the patterns below

const errorFixes = {
  // 1. TypeScript any type fixes
  "Fix any types": {
    "pattern": "error: any",
    "replacement": "error: unknown",
    "action": "Replace all catch blocks and add proper error handling"
  },

  // 2. HTML Entity fixes  
  "Fix HTML entities": {
    "patterns": [
      { "find": "Don't", "replace": "Don&apos;t" },
      { "find": "Can't", "replace": "Can&apos;t" },
      { "find": '"', "replace": "&quot;" },
      { "find": "'", "replace": "&apos;" }
    ]
  },

  // 3. Missing imports
  "Add missing imports": {
    "patterns": [
      "import { useCallback } from 'react'",
      "import Image from 'next/image'", 
      "import { Textarea } from '@/components/ui/textarea'",
      "import { Clock, Activity, CheckCircle, XCircle } from 'lucide-react'"
    ]
  },

  // 4. useEffect dependency fixes
  "Fix useEffect dependencies": {
    "pattern": "useEffect(() => { functionName(); }, [])",
    "replacement": "const functionName = useCallback(() => { ... }, []); useEffect(() => { functionName(); }, [functionName])"
  },

  // 5. Image component fixes
  "Fix img elements": {
    "pattern": "<img src=\"...\" alt=\"...\" />",
    "replacement": "<Image src=\"...\" alt=\"...\" width={500} height={300} />"
  },

  // 6. Supabase auth helper migration
  "Update Supabase": {
    "remove": ["@supabase/auth-helpers-nextjs", "@supabase/auth-helpers-shared"],
    "add": "@supabase/ssr",
    "updateImports": "createClientComponentClient -> createClient"
  }
};

// Files that need fixes based on build errors:
const filesToFix = [
  "src/app/admin/diagnostic/page.tsx",
  "src/app/admin/issues/page.tsx", 
  "src/app/admin/users/page.tsx",
  "src/app/admin/page.tsx",
  "src/app/diagnostic/page.tsx",
  "src/app/issue/[id]/page.tsx",
  "src/app/page.tsx",
  "src/app/profile/page.tsx", 
  "src/app/report/page.tsx",
  "src/app/test-supabase/page.tsx",
  "src/components/ErrorBoundary.tsx",
  "src/components/auth/AuthModal.tsx",
  "src/components/layout/Navbar.tsx",
  "src/lib/database.types.ts"
];

console.log("Error fix patterns defined. Apply these manually to fix all build errors.");
module.exports = { errorFixes, filesToFix };