/**
 * Human Context Protocol (HCP) Library
 * 
 * Main entry point for the HCP system
 */

// Export core functionality
export { hcp, getHCP, HCPManager } from './core'

// Export all types
export * from './types'

// Export adapters for backward compatibility
export {
  // Preferences adapter
  getPreferences,
  updatePreferences,
  subscribeToPreferences,
  clearPreferences,
  
  // Human context adapter
  getHumanContext,
  getFilteredHumanContext,
  updateHumanContext,
  getAccessLog,
  clearHumanContext,
  getContextCompleteness,
  subscribeToHumanContext,
  
  // Grant authority adapter
  getGrantAuthority,
  updateGrantAuthority,
  addAuthorizedClient,
  removeAuthorizedClient,
  updateAutonomySettings,
  checkClientAccess,
  getFilteredPreferences,
  resetGrantAuthority,
  subscribeToGrantAuthority
} from './adapters'

// Export plugin system
export { createPlugin, createMiddleware } from './plugins'

// Export API handlers
export { createHCPAPIHandler, createHCPWebSocketHandler } from './api'

// Export demo data utilities
export { 
  loadDemoData, 
  getDemoSummary, 
  DEMO_PREFERENCES,
  DEMO_CONTEXT,
  DEMO_CLIENTS,
  DEMO_SCENARIOS,
  DEMO_DOMAINS,
  DEFAULT_AUTONOMY 
} from './demo-data'

// Default export
import { hcp } from './core'
export default hcp