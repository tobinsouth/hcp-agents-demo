/**
 * Unified HCP API Route
 * 
 * This is the new unified API endpoint for all HCP operations.
 * It provides a single, consistent interface for accessing human context
 * and managing authority grants.
 */

import { createHCPRoute } from '@/services/hcp/api/handlers'

// Export the unified HCP route handlers
export const { GET, POST } = createHCPRoute()