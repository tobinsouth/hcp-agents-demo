# Human Context Protocol (HCP) Architecture

## Overview

The HCP library provides a unified, extensible system for managing human context and authority grants. It features strong gatekeeping, standardized APIs, and comprehensive demo data for showcasing capabilities.

## Core Architecture

### 1. Central Gatekeeper (`lib/hcp/core.ts`)

The `HCPManager` singleton enforces all access control through a single `accessContext()` method:

```typescript
// All context access MUST go through this gatekeeper
const response = await hcp.accessContext({
  clientId: 'shopping-agent',
  action: 'read',
  sections: ['preferences.domains.furniture'],
  timestamp: new Date().toISOString()
})
```

**Key Features:**
- Multi-layer validation (client status, middleware, grants, rate limits)
- Automatic audit logging
- Event-driven architecture
- Plugin system for extensibility
- Session caching for performance

### 2. Type System (`lib/hcp/types.ts`)

Comprehensive TypeScript definitions for:
- **HCPContext**: User identity, preferences, behavioral patterns, capabilities, constraints
- **HCPAuthority**: Policies, grants, autonomy settings
- **HCPClient**: Client registration and capabilities
- **HCPAccessRequest/Response**: Standardized access control

### 3. Backward Compatibility (`lib/hcp/adapters.ts`)

Maintains existing API signatures while using the new core:
- `getPreferences()` / `updatePreferences()`
- `getHumanContext()` / `updateHumanContext()`
- `getGrantAuthority()` / `updateGrantAuthority()`

### 4. Demo System (`lib/hcp/demo-data.ts`)

Rich demo data including:
- **Alex Chen Profile**: SF-based software developer with sustainability focus
- **3 Demo Clients**: AI assistant, shopping agent, calendar service
- **2 Scenarios**: Washing machine purchase, furniture shopping
- **Automatic Loading**: Demo data loads on first access

## API Design

### Unified HTTP Endpoint

```typescript
// Single endpoint for all HCP operations
/api/hcp

// Specialized endpoints
/api/demo        // Demo data management
/api/preferences // Legacy preference access
/api/human-context // Legacy context access
/api/grant-authority // Legacy authority management
```

### WebSocket Support

Real-time subscriptions for:
- Context updates
- Authority changes
- Access events
- Client registration

## Plugin System

### Built-in Plugins

```typescript
import { rateLimitPlugin, cachingPlugin, encryptionPlugin } from '@/lib/hcp/plugins'

// Register plugins
hcp.registerPlugin(rateLimitPlugin)
hcp.registerPlugin(cachingPlugin)
```

### Custom Plugin Creation

```typescript
const customPlugin = createPlugin({
  id: 'custom',
  name: 'Custom Plugin',
  version: '1.0.0',
  capabilities: {
    'custom-action': async (request, context, client) => {
      // Custom logic
      return result
    }
  }
})
```

## Demo Data Structure

### Default Preferences

The system initializes with comprehensive preferences for Alex Chen:

```json
{
  "identity": {
    "name": "Alex Chen",
    "role": "Software Developer",
    "location": "San Francisco, CA"
  },
  "preferences": {
    "communication": {
      "formality": "casual",
      "directness": "balanced",
      "tone": "friendly"
    },
    "values": {
      "sustainability": "high",
      "innovation": "proven",
      "transparency": "full"
    },
    "domains": {
      "furniture": {
        "style_preferences": ["modern", "minimalist", "sustainable"],
        "material_preferences": ["natural wood", "recycled materials"]
      },
      "housing": {
        "type": "small San Francisco apartment",
        "square_footage": "650 sq ft"
      }
    }
  }
}
```

### Authority Configuration

Three pre-configured clients with different access levels:

1. **Claude Assistant**: Full read/write access to preferences and context
2. **Shopping Agent**: Limited to specific domains (furniture, appliances)
3. **Calendar Service**: Access only to scheduling-related data

## Usage Examples

### Loading Demo Data

```typescript
// Automatic loading (happens on first access)
const preferences = getPreferences() // Auto-loads demo if empty

// Manual loading via API
await fetch('/api/demo', {
  method: 'POST',
  body: JSON.stringify({ 
    scenario: 'washingMachine' // Optional scenario
  })
})
```

### Accessing Context with Gatekeeping

```typescript
// Client attempts to access context
const response = await fetch('/api/human-context', {
  headers: { 'x-hcp-client-id': 'shopping-agent' }
})

// HCP enforces grants automatically
// Shopping agent only gets furniture/appliance preferences
```

### Using the Demo Loader Component

```tsx
import { DemoLoader } from '@/components/demo-loader'

<DemoLoader 
  onDataLoaded={() => console.log('Demo ready!')}
  compact={false}
/>
```

### Automatic Initialization Hook

```tsx
import { useDemoInitialization } from '@/hooks/use-demo-initialization'

function MyComponent() {
  const { initialized, loading, error } = useDemoInitialization()
  
  if (!initialized) return <div>Loading demo...</div>
  
  // Demo data is ready
  return <YourApp />
}
```

## Security Features

1. **Strong Gatekeeping**: All access through single enforcement point
2. **Granular Permissions**: Section-level access control
3. **Rate Limiting**: Built-in protection against abuse
4. **Audit Trail**: Complete access logging
5. **Client Validation**: Status checks and expiration
6. **Middleware Chain**: Extensible validation pipeline

## Extensibility

The system is designed for future enhancements:

- **New Context Sections**: Add to `HCPContext` type
- **Custom Policies**: Define in authority configuration
- **Plugin Capabilities**: Register new actions
- **Middleware**: Add validation or transformation logic
- **Event Handlers**: Subscribe to system events

## Migration from Legacy

Existing code continues to work without changes:

```typescript
// Old code (still works)
import { getPreferences } from '@/lib/preferences'
const prefs = getPreferences()

// New code (uses HCP)
import { getPreferences } from '@/lib/hcp'
const prefs = getPreferences() // Same API, new implementation
```

## Best Practices

1. **Always use the gatekeeper** for context access
2. **Register clients** before granting authority
3. **Define granular sections** for fine-grained control
4. **Use plugins** for cross-cutting concerns
5. **Monitor audit logs** for security
6. **Load demo data** for testing and demos

## Future Enhancements

- Database persistence (currently in-memory)
- Distributed caching with Redis
- OAuth integration for client authentication
- GraphQL API support
- Policy engine with complex rules
- Machine learning for anomaly detection

---

The HCP architecture provides a production-ready foundation for managing human context with strong security, extensibility, and excellent developer experience.