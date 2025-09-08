#!/bin/bash

# HCP Agents Demo - Migration Script
# Safely migrates current structure to new organized structure

set -e  # Exit on any error

echo "🚀 Starting HCP Agents Demo Migration..."

# Phase 1: Create new directory structure
echo "📁 Creating new directory structure..."

mkdir -p src/{services,frontend,demo,shared,gateway}
mkdir -p src/services/{hcp,agents,mcp,chat}
mkdir -p src/services/hcp/{core,api,auth,types}
mkdir -p src/services/agents/{negotiation,types}
mkdir -p src/services/mcp/{core,types}
mkdir -p src/services/chat/{core,components}
mkdir -p src/frontend/{components,hooks,styles}
mkdir -p src/frontend/components/{core,hcp,agents}
mkdir -p src/demo/{components,data,routes,scenarios}
mkdir -p src/shared/{types,utils,constants,config}
mkdir -p src/gateway/{routes,middleware,validation}

echo "✅ Directory structure created"

# Phase 2: Move files in dependency order
echo "📦 Moving files..."

# 1. Shared utilities first (no dependencies)
if [ -f "lib/utils.ts" ]; then
    cp lib/utils.ts src/shared/utils/index.ts
    echo "   ✅ Moved shared utils"
fi

# 2. HCP service files
if [ -d "lib/hcp" ]; then
    [ -f "lib/hcp/types.ts" ] && cp lib/hcp/types.ts src/services/hcp/types/index.ts
    [ -f "lib/hcp/core.ts" ] && cp lib/hcp/core.ts src/services/hcp/core/core.ts  
    [ -f "lib/hcp/grant-authority.ts" ] && cp lib/hcp/grant-authority.ts src/services/hcp/auth/grant-authority.ts
    [ -f "lib/hcp/agent-context.ts" ] && cp lib/hcp/agent-context.ts src/services/hcp/core/agent-context.ts
    [ -f "lib/hcp/api.ts" ] && cp lib/hcp/api.ts src/services/hcp/api/handlers.ts
    [ -f "lib/hcp/demo-data.ts" ] && cp lib/hcp/demo-data.ts src/demo/data/hcp-demo-data.ts
    [ -f "lib/hcp/index.ts" ] && cp lib/hcp/index.ts src/services/hcp/index.ts
    echo "   ✅ Moved HCP service files"
fi

# 3. Agents service files
if [ -d "lib/negotiation" ]; then
    [ -f "lib/negotiation/negotiation-manager.ts" ] && cp lib/negotiation/negotiation-manager.ts src/services/agents/negotiation/manager.ts
    echo "   ✅ Moved agent service files"
fi

# 4. Hooks
if [ -d "hooks" ]; then
    cp -r hooks/* src/frontend/hooks/ 2>/dev/null || true
    echo "   ✅ Moved hooks"
fi

# 5. Styles  
if [ -d "styles" ]; then
    cp -r styles/* src/frontend/styles/ 2>/dev/null || true
    echo "   ✅ Moved styles"
fi

# 6. Components (in order: core, then specific)
if [ -d "components" ]; then
    # Core UI components
    [ -d "components/ui" ] && cp -r components/ui src/frontend/components/core/
    [ -f "components/theme-provider.tsx" ] && cp components/theme-provider.tsx src/frontend/components/core/
    
    # HCP components
    [ -f "components/grant-authority-ui.tsx" ] && cp components/grant-authority-ui.tsx src/frontend/components/hcp/
    [ -f "components/preference-database-ui.tsx" ] && cp components/preference-database-ui.tsx src/frontend/components/hcp/
    
    # Agent components  
    [ -f "components/agent-negotiation.tsx" ] && cp components/agent-negotiation.tsx src/frontend/components/agents/
    
    # Chat components
    [ -f "components/chat-component.tsx" ] && cp components/chat-component.tsx src/services/chat/components/
    
    # MCP components
    [ -f "components/mcp-component.tsx" ] && cp components/mcp-component.tsx src/services/mcp/core/
    
    # Demo components
    [ -f "components/demo-loader.tsx" ] && cp components/demo-loader.tsx src/demo/components/
    [ -f "components/onboarding-modal.tsx" ] && cp components/onboarding-modal.tsx src/demo/components/
    
    echo "   ✅ Moved components"
fi

# 7. Create service index files
echo "📝 Creating service index files..."

# HCP service index
cat > src/services/hcp/index.ts << 'EOF'
// HCP Service Entry Point
export * from './core/core'
export * from './core/agent-context' 
export * from './auth/grant-authority'
export * from './api/handlers'
export * from './types'
EOF

# Agents service index  
cat > src/services/agents/index.ts << 'EOF'
// Agents Service Entry Point
export * from './negotiation/manager'
export * from './types'
EOF

# Create types barrel files
touch src/services/hcp/types/index.ts
touch src/services/agents/types/index.ts
touch src/services/mcp/types/index.ts
touch src/shared/types/index.ts

echo "   ✅ Created service index files"

# 8. Create gateway route handlers (manual step needed)
echo "🔄 Creating gateway structure..."

cat > src/gateway/routes/index.ts << 'EOF'
// Gateway Route Handlers
// TODO: Convert app/api routes to use this structure

export { default as hcpRoutes } from './hcp'
export { default as chatRoutes } from './chat' 
export { default as negotiateRoutes } from './negotiate'
export { default as mcpRoutes } from './mcp'
EOF

echo "   ✅ Created gateway structure"

echo ""
echo "🎉 Migration Phase 1 Complete!"
echo ""
echo "📋 Next Steps (Manual):"
echo "1. Update tsconfig.json paths (see migration plan)"
echo "2. Update import statements in app/ files to use new paths"
echo "3. Convert app/api routes to use new gateway structure"
echo "4. Test that the app still works"
echo "5. Remove old files once everything is working"
echo ""
echo "⚠️  The app may not work until imports are updated!"
echo "   Run 'npm run dev' to check for import errors"