# Post-Migration Validation Checklist

## ✅ Pre-Migration Backup
- [ ] Create git branch: `git checkout -b pre-migration-backup`  
- [ ] Commit current state: `git add . && git commit -m "Backup before migration"`
- [ ] Create migration branch: `git checkout -b migration-restructure`

## 🚀 Migration Execution  
- [ ] Run migration script: `./migrate.sh`
- [ ] Update `tsconfig.json` with new path mappings
- [ ] Update import statements in key files

## 🔍 Critical Files to Update

### 1. Update `tsconfig.json`
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./app/*", "./src/*"],
      "@/services/*": ["./src/services/*"], 
      "@/frontend/*": ["./src/frontend/*"],
      "@/demo/*": ["./src/demo/*"],
      "@/shared/*": ["./src/shared/*"],
      "@/gateway/*": ["./src/gateway/*"]
    }
  }
}
```

### 2. Update `app/page.tsx` imports
- [ ] `@/components/*` → `@/frontend/components/*` or `@/demo/components/*`
- [ ] `@/lib/hcp/*` → `@/services/hcp/*`
- [ ] `@/lib/utils` → `@/shared/utils`

### 3. Update `app/layout.tsx` imports  
- [ ] `@/components/theme-provider` → `@/frontend/components/core/theme-provider`
- [ ] `@/styles/*` → `@/frontend/styles/*` 

### 4. Update API Routes (`app/api/*/route.ts`)
- [ ] `@/lib/hcp/*` → `@/services/hcp/*`
- [ ] `@/lib/negotiation/*` → `@/services/agents/*`

### 5. Update Component Imports
- [ ] All component files: Update `@/components/ui/*` → `@/frontend/components/core/*`
- [ ] All component files: Update `@/lib/utils` → `@/shared/utils`

## 🧪 Testing & Validation

### Build & Development
- [ ] `npm run dev` - starts without errors
- [ ] No TypeScript errors: `npm run build`  
- [ ] No linting errors: `npm run lint`

### Functional Testing
- [ ] **Home page loads** - Main demo interface appears
- [ ] **HCP functionality** - Human Context Protocol works
  - [ ] Preferences can be updated
  - [ ] Authority grants work
  - [ ] Context is preserved
- [ ] **Agent negotiation** - AI agent communication works
  - [ ] Can start negotiation
  - [ ] Messages flow properly  
  - [ ] Context is passed to agents
- [ ] **Chat functionality** - Chat interface works
  - [ ] Can send/receive messages
  - [ ] HCP context is used
- [ ] **MCP integration** - Model Context Protocol works
  - [ ] MCP connections established
  - [ ] Protocol messages work
- [ ] **Demo flows** - All demo scenarios work
  - [ ] Onboarding modal
  - [ ] Demo loader
  - [ ] All demo scenarios complete

### File Structure Validation
- [ ] **No broken imports** - All files import correctly
- [ ] **No duplicate code** - Old files can be safely removed
- [ ] **Service boundaries** - Each service is self-contained
- [ ] **Demo separation** - Demo code is isolated from core logic

## 🧹 Cleanup (Only after everything works!)
- [ ] Remove old `lib/` directory
- [ ] Remove old `components/` directory (except `components/ui` if needed)
- [ ] Remove old `hooks/` directory  
- [ ] Remove old `styles/` directory
- [ ] Update `.gitignore` if needed
- [ ] Commit final migration: `git add . && git commit -m "Complete migration to new structure"`

## 🐛 Common Issues & Fixes

### Issue: Import errors after migration
**Fix**: Update the specific import paths in the error files

### Issue: "Module not found" errors
**Fix**: Check `tsconfig.json` paths and make sure directories exist

### Issue: Components not rendering
**Fix**: Check that component exports are properly structured in new locations

### Issue: API routes broken
**Fix**: Ensure API files still import from correct service locations

## 🎯 Success Criteria
- [ ] ✅ App runs without errors (`npm run dev`)
- [ ] ✅ All existing functionality works
- [ ] ✅ Clean, organized file structure
- [ ] ✅ Clear service boundaries
- [ ] ✅ Demo code separated from core logic
- [ ] ✅ Ready for multi-person development
- [ ] ✅ AI tool changes will be easier to track

---
**Next Steps After Migration:**
1. Update documentation to reflect new structure
2. Create service-specific README files
3. Set up service-specific testing
4. Consider service-specific package.json files for future microservice migration