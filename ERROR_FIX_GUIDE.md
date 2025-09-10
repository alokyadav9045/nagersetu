# NagarSetu Error Fix Guide

## Critical Errors Found and Fixes Needed:

### 1. TypeScript Errors (50+ instances)
**Problem**: `@typescript-eslint/no-explicit-any` errors
**Files affected**: Almost all .tsx files

**Fix Pattern**:
```typescript
// BEFORE:
} catch (error: any) {
  console.log(error.message);
}

// AFTER:  
} catch (error: unknown) {
  const errorMessage = error instanceof Error ? error.message : 'An error occurred';
  console.log(errorMessage);
}
```

### 2. HTML Entity Errors (6 files)
**Problem**: `react/no-unescaped-entities` errors
**Files affected**: diagnostic, forgot-password, issue/[id], test-supabase

**Fix Pattern**:
```tsx
// BEFORE:
<p>Don't worry about it</p>
<p>The "quoted" text</p>

// AFTER:
<p>Don&apos;t worry about it</p>  
<p>The &quot;quoted&quot; text</p>
```

### 3. React Hooks Dependency Errors (8 files)
**Problem**: `react-hooks/exhaustive-deps` warnings

**Fix Pattern**:
```typescript
// BEFORE:
const fetchData = async () => { /* ... */ };
useEffect(() => {
  fetchData();
}, []); // Missing dependency

// AFTER:
const fetchData = useCallback(async () => { /* ... */ }, []);
useEffect(() => {
  fetchData();
}, [fetchData]); // Dependency added
```

### 4. Image Optimization Warnings (4 files)
**Problem**: `@next/next/no-img-element` warnings

**Fix Pattern**:
```tsx
// BEFORE:
<img src="/image.jpg" alt="description" />

// AFTER:
import Image from 'next/image';
<Image src="/image.jpg" alt="description" width={500} height={300} />
```

### 5. Unused Variables (30+ instances)
**Problem**: `@typescript-eslint/no-unused-vars` warnings

**Fix**: Remove unused imports and variables

### 6. Deprecated Supabase Packages
**Problem**: Using deprecated auth helpers

**Fix**:
```bash
npm uninstall @supabase/auth-helpers-nextjs @supabase/auth-helpers-shared
npm install @supabase/ssr
```

## Manual Fix Instructions:

1. **Search and replace across project**:
   - `error: any` → `error: unknown`
   - `Don't` → `Don&apos;t`
   - `"text"` → `&quot;text&quot;`
   - `<img` → `<Image` (add proper props)

2. **Add missing imports**:
   - `import { useCallback } from 'react'`
   - `import Image from 'next/image'`
   - Missing Lucide icons
   - Missing UI components

3. **Fix useEffect patterns**:
   - Wrap functions in useCallback
   - Add dependencies to dependency arrays

4. **Update Supabase imports**:
   - Replace `createClientComponentClient` with `createClient`
   - Update auth patterns

## Files Requiring Manual Fixes:
- src/app/admin/* (all files)
- src/app/diagnostic/page.tsx
- src/app/issue/[id]/page.tsx  
- src/app/page.tsx
- src/app/profile/page.tsx
- src/app/report/page.tsx
- src/components/layout/*
- src/lib/database.types.ts

After applying these fixes, the build should pass successfully.