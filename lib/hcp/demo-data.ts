/**
 * HCP Demo Data
 * 
 * Provides comprehensive demo data for showcasing the Human Context Protocol
 * This includes realistic user preferences, context, and authority configurations
 */

import type { HCPContext, HCPAuthority, HCPClient } from './types'

// ============================================================================
// Demo Preferences (Legacy Format)
// ============================================================================

export const DEMO_PREFERENCES = {
  communication_style: {
    formality: "casual" as const,
    directness: "balanced" as const,
    tone: "friendly" as const
  },
  decision_making: {
    risk_tolerance: "moderate" as const,
    information_needs: "standard" as const,
    consultation_style: "collaborative" as const
  },
  values: {
    sustainability: "high" as const,
    innovation: "proven" as const,
    transparency: "full" as const
  },
  negotiation_priorities: {
    price_sensitivity: "medium" as const,
    timeline_flexibility: "flexible" as const,
    quality_importance: "important" as const,
    relationship_focus: "partnership" as const
  },
  domains: {
    furniture: {
      style_preferences: ["modern", "minimalist", "sustainable"],
      material_preferences: ["natural wood", "recycled materials"],
      color_preferences: ["earthy tones", "greens", "natural wood finishes"],
      functionality_priorities: ["durability", "comfort", "eco-friendly"],
      quality_vs_price: "balanced",
      sustainability_importance: "high"
    },
    housing: {
      type: "small San Francisco apartment",
      location: "San Francisco, CA",
      neighborhood: "Mission District",
      living_situation: "rental",
      square_footage: "650 sq ft",
      residents: "2 adults",
      space_constraints: "limited storage, small rooms"
    },
    personal: {
      occupation: "software developer",
      income_level: "$95,000/year",
      age_range: "28-35",
      lifestyle: "urban professional",
      hobbies: ["hiking", "cooking", "reading"],
      shopping_style: "research-driven, value-conscious"
    },
    appliances: {
      space_constraints: "27 inches wide x 30 inches deep laundry closet",
      noise_sensitivity: "high - thin apartment walls",
      energy_priorities: "high - looking for Energy Star certified",
      budget_range: "$800-1200",
      preferred_type: "front-loading",
      household_size: "2 people",
      usage_frequency: "weekly loads"
    }
  },
  conversation_patterns: {
    topics_of_interest: ["sustainability", "technology", "home improvement"],
    frequently_mentioned_brands: ["IKEA", "West Elm", "CB2"],
    decision_triggers: ["good value", "environmental impact", "quality reviews"],
    pain_points: ["limited space", "high cost of living", "finding sustainable options"],
    goals_mentioned: ["reduce environmental footprint", "maximize small space", "build long-term value"]
  },
  constraints: {
    budget_range: "$800-1200 for appliances, flexible for furniture",
    timeline: "2 weeks for urgent needs, flexible for planned purchases",
    technical_requirements: ["Energy Star certified", "space-efficient", "quiet operation"],
    compliance_needs: ["apartment-friendly", "no permanent modifications"]
  }
}

// ============================================================================
// Demo Human Context (Full HCP Format)
// ============================================================================

export const DEMO_CONTEXT: Partial<HCPContext> = {
  identity: {
    name: "Alex Chen",
    role: "Software Developer",
    organization: "Tech Startup",
    location: "San Francisco, CA",
    timezone: "America/Los_Angeles",
    language_preferences: ["English", "Mandarin"]
  },
  preferences: {
    communication: {
      formality: "casual",
      directness: "balanced",
      tone: "friendly",
      response_length: "balanced"
    },
    decision_making: {
      risk_tolerance: "moderate",
      information_needs: "standard",
      consultation_style: "collaborative",
      planning_horizon: "medium_term"
    },
    values: {
      sustainability: "high",
      innovation: "proven",
      transparency: "full"
    },
    domains: DEMO_PREFERENCES.domains
  },
  behavioral: {
    patterns: {
      interaction_style: {
        preferred_greeting: "Hey there",
        response_length: "balanced",
        humor_appreciation: "moderate",
        formality_level: 4
      },
      learning_style: {
        visual_preference: true,
        examples_needed: "some",
        abstraction_level: "mixed"
      },
      work_patterns: {
        peak_hours: ["9am-12pm", "2pm-5pm"],
        break_frequency: "moderate",
        multitasking_preference: true
      }
    },
    cognitive: {
      problem_solving_approach: "systematic",
      detail_orientation: "medium",
      uncertainty_tolerance: "moderate"
    },
    interaction: {
      topics_discussed: [
        { topic: "sustainability", frequency: 8, last_discussed: new Date().toISOString(), sentiment: "positive" },
        { topic: "technology", frequency: 12, last_discussed: new Date().toISOString(), sentiment: "positive" },
        { topic: "home improvement", frequency: 6, last_discussed: new Date().toISOString(), sentiment: "neutral" },
        { topic: "furniture shopping", frequency: 4, last_discussed: new Date().toISOString(), sentiment: "positive" }
      ],
      common_questions: [
        "What's the most sustainable option?",
        "How does this fit in small spaces?",
        "What's the warranty like?"
      ],
      preferred_examples: ["real-world scenarios", "cost comparisons", "environmental impact"],
      avoided_topics: ["politics", "controversial brands"]
    }
  },
  capabilities: {
    technical: {
      domains: [
        { domain: "web development", proficiency: "expert", years_experience: 8 },
        { domain: "AI/ML", proficiency: "intermediate", years_experience: 3 },
        { domain: "cloud infrastructure", proficiency: "intermediate", years_experience: 5 }
      ],
      tools: ["React", "Python", "TypeScript", "AWS", "Docker"],
      certifications: ["AWS Solutions Architect", "Google Cloud Professional"]
    },
    domain_expertise: {
      software_development: "expert",
      sustainable_living: "enthusiast",
      smart_home: "intermediate"
    },
    tools: {
      preferred_ide: "VS Code",
      communication: ["Slack", "Email", "Video calls"],
      project_management: ["Jira", "Notion", "GitHub"]
    }
  },
  constraints: {
    hard: {
      budget_max: "$5000 for major purchases",
      space_max: "650 sq ft apartment",
      legal: "No permanent modifications to rental"
    },
    soft: {
      preferred_budget: "$800-1200 for appliances",
      timeline_preference: "2 weeks for urgent, flexible otherwise",
      brand_preferences: ["sustainable brands", "local manufacturers"]
    },
    ethical: {
      no_child_labor: true,
      environmental_standards: "high",
      fair_trade_preferred: true
    }
  }
}

// ============================================================================
// Demo Authority Configuration
// ============================================================================

export const DEMO_AUTHORITY: Partial<HCPAuthority> = {
  settings: {
    autonomy_level: "balanced",
    require_approval: {
      financial: true,
      legal: true,
      medical: true,
      personal_data: false,
      threshold_amount: 500
    },
    notification_preferences: {
      before_action: false,
      after_action: true,
      summary_frequency: "daily"
    }
  }
}

// ============================================================================
// Demo Clients
// ============================================================================

export const DEMO_CLIENTS: HCPClient[] = [
  {
    id: "claude-assistant",
    name: "Claude AI Assistant",
    type: "ai_assistant",
    description: "Primary AI assistant for general tasks",
    capabilities: ["read", "write", "execute"],
    status: "active",
    metadata: {
      created_at: new Date().toISOString(),
      trusted: true
    }
  },
  {
    id: "shopping-agent",
    name: "Shopping Agent",
    type: "agent",
    description: "Specialized agent for e-commerce negotiations",
    capabilities: ["read", "execute"],
    status: "active",
    metadata: {
      created_at: new Date().toISOString(),
      trusted: true
    }
  },
  {
    id: "calendar-service",
    name: "Calendar Service",
    type: "service",
    description: "Calendar and scheduling management",
    capabilities: ["read", "write"],
    status: "active",
    metadata: {
      created_at: new Date().toISOString(),
      trusted: false
    }
  }
]

// ============================================================================
// Demo Grants (Client Permissions)
// ============================================================================

export const DEMO_GRANTS = [
  {
    client_id: "claude-assistant",
    allowed_sections: [
      "preferences.communication",
      "preferences.decision_making",
      "preferences.values",
      "preferences.domains",
      "behavioral.interaction",
      "capabilities.domain_expertise"
    ],
    allowed_actions: ["read", "write", "execute"] as const,
    restrictions: []
  },
  {
    client_id: "shopping-agent",
    allowed_sections: [
      "preferences.values",
      "preferences.domains.furniture",
      "preferences.domains.appliances",
      "constraints",
      "behavioral.cognitive"
    ],
    allowed_actions: ["read", "execute"] as const,
    restrictions: ["Cannot access personal identity information"]
  },
  {
    client_id: "calendar-service",
    allowed_sections: [
      "identity.timezone",
      "behavioral.patterns.work_patterns",
      "capabilities.tools"
    ],
    allowed_actions: ["read", "write"] as const,
    restrictions: ["Limited to scheduling-related data only"]
  }
]

// ============================================================================
// Demo Scenarios
// ============================================================================

export const DEMO_SCENARIOS = {
  washingMachine: {
    preferences: {
      domains: {
        appliances: {
          space_constraints: "27 inches wide x 30 inches deep laundry closet",
          noise_sensitivity: "high - thin apartment walls",
          energy_priorities: "high - looking for Energy Star certified",
          budget_range: "$800-1200",
          preferred_type: "front-loading",
          household_size: "2 people",
          usage_frequency: "weekly loads"
        }
      }
    },
    authority: {
      clientId: "shopping-agent",
      grant: {
        allowed_sections: ["preferences.domains.appliances", "constraints"],
        allowed_actions: ["read", "execute"],
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      }
    }
  },
  furnitureShopping: {
    preferences: {
      domains: {
        furniture: {
          style_preferences: ["modern", "minimalist", "sustainable"],
          material_preferences: ["natural wood", "recycled materials"],
          color_preferences: ["earthy tones", "greens", "natural wood finishes"],
          functionality_priorities: ["durability", "comfort", "eco-friendly"],
          room_types: ["living room", "bedroom"],
          budget_range: "$500-2000 per piece"
        }
      }
    },
    authority: {
      clientId: "shopping-agent",
      grant: {
        allowed_sections: ["preferences.domains.furniture", "preferences.values", "constraints"],
        allowed_actions: ["read", "execute"],
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      }
    }
  }
}

// ============================================================================
// Demo Loader Functions
// ============================================================================

/**
 * Load demo data into HCP
 */
export async function loadDemoData(hcp: any, scenario?: keyof typeof DEMO_SCENARIOS) {
  // Reset to clean state
  hcp.reset()
  
  // Load base demo context
  hcp.updateContext(DEMO_CONTEXT, 'demo-loader')
  
  // Register demo clients
  DEMO_CLIENTS.forEach(client => {
    hcp.registerClient(client)
  })
  
  // Grant demo authorities
  DEMO_GRANTS.forEach(grant => {
    hcp.grantAuthority(grant.client_id, grant)
  })
  
  // Load scenario-specific data if provided
  if (scenario && DEMO_SCENARIOS[scenario]) {
    const scenarioData = DEMO_SCENARIOS[scenario]
    
    // Update preferences for scenario
    if (scenarioData.preferences) {
      hcp.updateContext({
        preferences: scenarioData.preferences
      }, 'demo-scenario')
    }
    
    // Grant scenario-specific authority
    if (scenarioData.authority) {
      hcp.grantAuthority(
        scenarioData.authority.clientId,
        scenarioData.authority.grant
      )
    }
  }
  
  return {
    success: true,
    message: `Demo data loaded${scenario ? ` with ${scenario} scenario` : ''}`,
    stats: {
      clients: DEMO_CLIENTS.length,
      grants: DEMO_GRANTS.length,
      scenario: scenario || 'none'
    }
  }
}

/**
 * Get demo state summary
 */
export function getDemoSummary() {
  return {
    user: {
      name: DEMO_CONTEXT.identity?.name,
      role: DEMO_CONTEXT.identity?.role,
      location: DEMO_CONTEXT.identity?.location
    },
    preferences: {
      communication: DEMO_PREFERENCES.communication_style,
      values: DEMO_PREFERENCES.values,
      domains: Object.keys(DEMO_PREFERENCES.domains)
    },
    clients: DEMO_CLIENTS.map(c => ({
      id: c.id,
      name: c.name,
      type: c.type,
      status: c.status
    })),
    scenarios: Object.keys(DEMO_SCENARIOS)
  }
}

/**
 * Export individual preference domains for selective loading
 */
export const DEMO_DOMAINS = {
  furniture: DEMO_PREFERENCES.domains.furniture,
  housing: DEMO_PREFERENCES.domains.housing,
  personal: DEMO_PREFERENCES.domains.personal,
  appliances: DEMO_PREFERENCES.domains.appliances
}

/**
 * Export conversation patterns for chat UI initialization
 */
export const DEMO_CONVERSATION = DEMO_PREFERENCES.conversation_patterns

/**
 * Export default autonomy settings
 */
export const DEFAULT_AUTONOMY = DEMO_AUTHORITY.settings