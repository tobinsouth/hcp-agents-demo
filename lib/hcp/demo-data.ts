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
    
    // Approval requirements - what needs human confirmation
    require_approval: {
      financial: true,  // Any financial transaction
      legal: true,  // Legal documents or commitments
      medical: true,  // Medical decisions or data
      personal_data: false,  // Basic personal data (already consented)
      location_tracking: true,  // Real-time location access
      third_party_sharing: true,  // Sharing with external services
      ai_training: true,  // Using data for AI model training
      advertising: true,  // Using data for advertising
      threshold_amount: 500  // Dollar amount requiring approval
    },
    
    // How and when to notify the user
    notification_preferences: {
      before_action: false,  // Don't notify before every action
      after_action: true,  // Notify after actions are taken
      on_grant_expiry: true,  // Notify when grants are expiring
      on_suspicious_activity: true,  // Alert on anomalies
      on_threshold_reached: true,  // Alert when limits are hit
      summary_frequency: "daily",
      notification_channels: ["email", "in_app"]
    },
    
    // Global system limits
    global_limits: {
      max_clients: 50,  // Maximum number of authorized clients
      max_grants_per_client: 5,  // Maximum grants per client
      max_daily_spend: 1000,  // Maximum daily spend across all clients
      max_monthly_spend: 10000,  // Maximum monthly spend
      blacklisted_domains: [  // Never share data with these
        "*.doubleclick.net",
        "*.facebook.com",
        "*.tiktok.com"
      ],
      whitelisted_domains: [  // Trusted domains
        "*.anthropic.com",
        "*.openai.com",
        "*.google.com",
        "*.microsoft.com"
      ]
    },
    
    // Privacy and compliance settings
    privacy_settings: {
      data_minimization: true,  // Only share minimum required data
      purpose_limitation: true,  // Enforce stated purposes
      consent_required: true,  // Require explicit consent
      right_to_deletion: true,  // Support GDPR deletion
      data_portability: true  // Support data export
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
  },
  {
    id: "healthcare-coordinator",
    name: "Healthcare Appointment Coordinator",
    type: "service",
    description: "Medical appointment scheduling and healthcare coordination",
    capabilities: ["read", "execute"],
    status: "active",
    metadata: {
      created_at: new Date().toISOString(),
      trusted: false,
      compliance: ["HIPAA"],
      certification: "HIPAA-compliant-service"
    }
  }
]

// ============================================================================
// Demo Grants (Client Permissions)
// ============================================================================

export const DEMO_GRANTS = [
  {
    // Claude Assistant - Broad access with safety constraints
    grant_id: "grant-claude-001",
    client_id: "claude-assistant",
    granted_by: "user",
    purpose: "General AI assistance and daily task automation",
    
    granted_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days
    
    valid_times: {
      // Available 24/7 for general assistance
      days: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
      timezone: "America/Los_Angeles"
    },
    
    allowed_sections: [
      "preferences.communication",
      "preferences.decision_making",
      "preferences.values",
      "preferences.domains",
      "behavioral.interaction",
      "capabilities.domain_expertise",
      "identity.timezone",
      "identity.language_preferences"
    ],
    
    allowed_actions: ["read", "write", "execute"] as const,
    
    financial_limits: {
      per_transaction: 100,
      daily_limit: 500,
      monthly_limit: 2000,
      currency: "USD",
      payment_methods: ["digital_wallet"],
      require_2fa_above: 50
    },
    
    operation_limits: {
      max_requests_per_hour: 100,
      max_requests_per_day: 1000,
      max_data_size_mb: 10
    },
    
    data_handling: {
      retention_days: 30,
      deletion_required: false,
      aggregation_allowed: true,
      sharing_allowed: false,
      encryption_required: true,
      anonymization_required: false
    },
    
    approval_requirements: {
      pre_approval: false,
      post_notification: true,
      approval_threshold: 100,
      auto_approve_below: 50
    },
    
    audit_requirements: {
      log_all_access: true,
      log_data_accessed: false,
      compliance_frameworks: ["CCPA"],
      audit_retention_days: 90,
      real_time_monitoring: false
    },
    
    revocation_conditions: {
      on_breach: true,
      on_suspicious_activity: true,
      on_data_leak: true,
      on_third_party_sharing: true,
      max_violations: 3
    },
    
    restrictions: [
      "Cannot access financial account credentials",
      "Cannot make purchases above daily limit without approval",
      "Cannot share personal data with third parties"
    ],
    
    metadata: {
      grant_type: "permanent" as const,
      risk_level: "medium" as const,
      trust_score: 85,
      review_required: true,
      next_review: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ["ai-assistant", "daily-use", "trusted"]
    }
  },
  
  {
    // Shopping Agent - Transactional with strict limits
    grant_id: "grant-shop-001",
    client_id: "shopping-agent",
    granted_by: "user",
    purpose: "E-commerce price negotiation and purchase assistance",
    
    granted_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
    
    valid_times: {
      // Only during business hours for shopping
      days: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
      hours: { start: "08:00", end: "20:00" },
      timezone: "America/Los_Angeles"
    },
    
    allowed_sections: [
      "preferences.values",
      "preferences.domains.furniture",
      "preferences.domains.appliances",
      "preferences.domains.personal.shopping_style",
      "constraints.soft",
      "constraints.hard.budget_max",
      "behavioral.cognitive.problem_solving_approach"
    ],
    
    allowed_actions: ["read", "execute"] as const,
    
    financial_limits: {
      per_transaction: 1500,  // Can negotiate for appliances up to $1500
      daily_limit: 2000,
      monthly_limit: 5000,
      total_limit: 10000,  // Total grant limit
      currency: "USD",
      payment_methods: ["credit_card", "digital_wallet"],
      require_2fa_above: 500
    },
    
    operation_limits: {
      max_requests_per_hour: 20,
      max_requests_per_day: 50,
      allowed_operations: [
        "price_comparison",
        "negotiate_price",
        "check_availability",
        "calculate_shipping",
        "apply_coupons",
        "initiate_purchase"  // But not complete without approval
      ],
      denied_operations: [
        "complete_purchase",  // Requires separate approval
        "save_payment_method",
        "auto_reorder"
      ]
    },
    
    geographic_limits: {
      allowed_countries: ["US"],
      allowed_regions: ["California", "Nevada", "Oregon"],
      denied_countries: ["CN", "RU"]  // Sanctions compliance
    },
    
    data_handling: {
      retention_days: 7,  // Only keep shopping data for a week
      deletion_required: true,
      aggregation_allowed: false,
      sharing_allowed: false,
      third_party_whitelist: ["stripe.com", "paypal.com"],  // Payment processors only
      encryption_required: true,
      anonymization_required: true
    },
    
    approval_requirements: {
      pre_approval: true,  // Need approval before completing purchase
      post_notification: true,
      approval_threshold: 200,
      approvers: ["user"],
      auto_approve_below: 50
    },
    
    audit_requirements: {
      log_all_access: true,
      log_data_accessed: true,  // Log what products were viewed
      compliance_frameworks: ["CCPA", "PCI-DSS"],
      audit_retention_days: 365,  // Keep shopping history for a year
      real_time_monitoring: true  // Monitor for fraud
    },
    
    conditions: [
      {
        type: "amount" as const,
        operator: "gt" as const,
        value: 1000,
        description: "Purchases over $1000 require additional verification"
      },
      {
        type: "frequency" as const,
        operator: "gt" as const,
        value: 5,
        field: "daily_purchases",
        description: "More than 5 purchases per day triggers review"
      }
    ],
    
    revocation_conditions: {
      on_breach: true,
      on_suspicious_activity: true,
      on_data_leak: true,
      on_third_party_sharing: true,
      max_violations: 1  // Zero tolerance for shopping agent
    },
    
    restrictions: [
      "Cannot access personal identity information",
      "Cannot save payment methods permanently",
      "Cannot make purchases without explicit approval above threshold",
      "Limited to approved merchant categories",
      "Cannot access purchase history older than 30 days"
    ],
    
    metadata: {
      grant_type: "temporary" as const,
      risk_level: "high" as const,  // Financial transactions = high risk
      trust_score: 70,
      review_required: true,
      last_reviewed: new Date().toISOString(),
      next_review: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ["shopping", "e-commerce", "financial", "monitored"]
    }
  },
  
  {
    // Calendar Service - Minimal access
    grant_id: "grant-cal-001",
    client_id: "calendar-service",
    granted_by: "user",
    purpose: "Calendar synchronization and meeting scheduling",
    
    granted_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
    
    allowed_sections: [
      "identity.timezone",
      "identity.name",  // For meeting invites
      "behavioral.patterns.work_patterns",
      "capabilities.tools.communication",
      "preferences.communication.formality"  // For meeting invite tone
    ],
    
    allowed_actions: ["read", "write"] as const,
    
    operation_limits: {
      max_requests_per_hour: 10,
      max_requests_per_day: 100,
      allowed_operations: [
        "read_availability",
        "suggest_meeting_times",
        "send_invites",
        "update_calendar",
        "set_reminders"
      ],
      denied_operations: [
        "access_meeting_content",
        "record_meetings",
        "share_calendar_publicly"
      ]
    },
    
    data_handling: {
      retention_days: 90,
      deletion_required: false,
      aggregation_allowed: true,  // Can aggregate for scheduling patterns
      sharing_allowed: false,
      encryption_required: true,
      anonymization_required: false
    },
    
    approval_requirements: {
      pre_approval: false,
      post_notification: false,
      auto_approve_below: 999999  // No financial transactions
    },
    
    audit_requirements: {
      log_all_access: false,  // Low risk
      log_data_accessed: false,
      compliance_frameworks: [],
      audit_retention_days: 30,
      real_time_monitoring: false
    },
    
    revocation_conditions: {
      on_breach: true,
      on_suspicious_activity: false,
      on_data_leak: true,
      on_third_party_sharing: true,
      max_violations: 5
    },
    
    restrictions: [
      "Limited to scheduling-related data only",
      "Cannot access meeting content or recordings",
      "Cannot share calendar data with third parties",
      "Cannot access calendars of other users without permission"
    ],
    
    metadata: {
      grant_type: "permanent" as const,
      risk_level: "low" as const,
      trust_score: 95,
      review_required: false,
      tags: ["productivity", "scheduling", "low-risk"]
    }
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
          usage_frequency: "weekly loads",
          urgency: "high - current machine broken"
        }
      }
    },
    authority: {
      clientId: "shopping-agent",
      grant: {
        grant_id: "grant-shop-wm-001",
        purpose: "Emergency washing machine purchase - current unit broken",
        
        allowed_sections: [
          "preferences.domains.appliances",
          "constraints.hard.space_max",
          "constraints.soft.budget_range",
          "identity.location"  // For delivery
        ],
        allowed_actions: ["read", "execute", "delegate"],
        
        expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // 48 hours urgency
        
        valid_times: {
          // Extended hours due to urgency
          days: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
          hours: { start: "06:00", end: "23:00" },
          timezone: "America/Los_Angeles"
        },
        
        financial_limits: {
          per_transaction: 1500,  // Higher limit for appliance
          daily_limit: 1500,
          total_limit: 1500,  // One-time purchase
          currency: "USD",
          payment_methods: ["credit_card", "financing"],  // Allow financing
          require_2fa_above: 1000
        },
        
        operation_limits: {
          allowed_operations: [
            "search_inventory",
            "check_availability",
            "compare_models",
            "read_reviews",
            "calculate_delivery",
            "schedule_installation",
            "negotiate_price",
            "apply_rebates",
            "initiate_purchase",
            "arrange_haul_away"  // Remove old unit
          ]
        },
        
        approval_requirements: {
          pre_approval: false,  // Pre-approved due to urgency
          post_notification: true,
          approval_threshold: 1200,
          auto_approve_below: 1200  // Auto-approve within budget
        },
        
        conditions: [
          {
            type: "data_type" as const,
            operator: "eq" as const,
            value: "Energy Star Certified",
            field: "certification",
            description: "Only Energy Star certified models allowed"
          },
          {
            type: "custom" as const,
            operator: "lte" as const,
            value: 27,
            field: "width_inches",
            description: "Must fit in 27 inch wide space"
          }
        ],
        
        metadata: {
          grant_type: "one_time" as const,
          risk_level: "medium" as const,
          trust_score: 80,
          tags: ["urgent", "appliance", "pre-approved", "one-time"]
        }
      }
    }
  },
  
  furnitureShopping: {
    preferences: {
      domains: {
        furniture: {
          style_preferences: ["modern", "minimalist", "sustainable"],
          material_preferences: ["natural wood", "recycled materials", "bamboo"],
          color_preferences: ["earthy tones", "greens", "natural wood finishes"],
          functionality_priorities: ["durability", "comfort", "eco-friendly", "space-saving"],
          room_types: ["living room", "bedroom"],
          budget_range: "$500-2000 per piece",
          brand_preferences: ["West Elm", "CB2", "Article", "Burrow"],
          sustainability_certifications: ["FSC Certified", "GREENGUARD Gold", "Cradle to Cradle"]
        }
      }
    },
    authority: {
      clientId: "shopping-agent",
      grant: {
        grant_id: "grant-shop-furn-001",
        purpose: "Furniture shopping for apartment refresh - living room and bedroom",
        
        allowed_sections: [
          "preferences.domains.furniture",
          "preferences.values.sustainability",
          "preferences.domains.housing.space_constraints",
          "constraints.soft",
          "behavioral.cognitive.detail_orientation"  // For style matching
        ],
        allowed_actions: ["read", "execute"],
        
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        
        valid_times: {
          // Regular shopping hours
          days: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
          hours: { start: "09:00", end: "21:00" },
          timezone: "America/Los_Angeles"
        },
        
        financial_limits: {
          per_transaction: 2000,  // Per furniture piece
          daily_limit: 3000,
          monthly_limit: 6000,
          total_limit: 10000,  // Total furniture budget
          currency: "USD",
          payment_methods: ["credit_card", "buy_now_pay_later"],
          require_2fa_above: 1000
        },
        
        operation_limits: {
          max_requests_per_hour: 50,  // Allow browsing
          allowed_operations: [
            "browse_catalog",
            "filter_by_sustainability",
            "check_dimensions",
            "view_in_room_ar",  // AR visualization
            "read_reviews",
            "compare_items",
            "save_to_wishlist",
            "calculate_delivery",
            "check_return_policy",
            "apply_promo_codes",
            "request_fabric_samples"
          ],
          denied_operations: [
            "instant_checkout",  // Require review for furniture
            "auto_purchase"
          ]
        },
        
        geographic_limits: {
          allowed_countries: ["US"],
          allowed_regions: ["California"],
          // Limit to eco-friendly retailers
          ip_whitelist: [
            "westelm.com",
            "cb2.com",
            "article.com",
            "burrow.com",
            "thuma.co"
          ]
        },
        
        data_handling: {
          retention_days: 90,  // Keep for return period
          aggregation_allowed: true,  // Build style profile
          sharing_allowed: false,
          encryption_required: true
        },
        
        approval_requirements: {
          pre_approval: true,  // Require approval for each piece
          post_notification: true,
          approval_threshold: 500,
          approvers: ["user"],
          auto_approve_below: 200  // Small accessories
        },
        
        conditions: [
          {
            type: "custom" as const,
            operator: "contains" as const,
            value: ["FSC", "GREENGUARD", "Recycled"],
            field: "certifications",
            description: "Prefer certified sustainable products"
          },
          {
            type: "custom" as const,
            operator: "lte" as const,
            value: 650,  // Apartment size
            field: "total_square_footage",
            description: "Must fit in small apartment"
          }
        ],
        
        revocation_conditions: {
          on_breach: true,
          max_violations: 3
        },
        
        metadata: {
          grant_type: "recurring" as const,  // Can shop multiple times
          risk_level: "medium" as const,
          trust_score: 75,
          review_required: true,
          next_review: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          tags: ["furniture", "home-decor", "sustainable", "monitored"]
        }
      }
    }
  },
  
  // New scenario: Healthcare appointment booking
  healthcareBooking: {
    preferences: {
      domains: {
        healthcare: {
          provider_network: "Blue Shield PPO",
          preferred_hospitals: ["UCSF", "Stanford Health"],
          accessibility_needs: ["wheelchair accessible", "evening appointments"],
          language_preference: "English",
          specialty_preferences: ["integrative medicine", "preventive care"]
        }
      }
    },
    authority: {
      clientId: "healthcare-coordinator",
      grant: {
        grant_id: "grant-health-001",
        purpose: "Healthcare appointment scheduling and coordination",
        
        allowed_sections: [
          "identity.name",
          "preferences.domains.healthcare",
          "behavioral.patterns.work_patterns"  // For scheduling
        ],
        allowed_actions: ["read", "execute"],
        
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
        
        financial_limits: {
          per_transaction: 0,  // No financial transactions
          daily_limit: 0,
          currency: "USD"
        },
        
        data_handling: {
          retention_days: 365,  // Keep for medical records
          deletion_required: false,
          aggregation_allowed: false,  // No aggregation of medical data
          sharing_allowed: false,
          encryption_required: true,  // HIPAA compliance
          anonymization_required: false
        },
        
        approval_requirements: {
          pre_approval: true,  // Always approve medical appointments
          post_notification: true,
          approvers: ["user"]
        },
        
        audit_requirements: {
          log_all_access: true,  // HIPAA requirement
          log_data_accessed: true,
          compliance_frameworks: ["HIPAA"],
          audit_retention_days: 2555,  // 7 years for HIPAA
          real_time_monitoring: true
        },
        
        metadata: {
          grant_type: "permanent" as const,
          risk_level: "critical" as const,  // Medical data
          trust_score: 60,  // Lower trust for medical
          tags: ["healthcare", "HIPAA", "sensitive", "regulated"]
        }
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
  // Don't reset if already in demo mode to avoid infinite loop
  if (hcp.isDemoMode()) {
    return {
      success: true,
      message: 'Demo data already loaded',
      stats: {
        clients: DEMO_CLIENTS.length,
        grants: DEMO_GRANTS.length,
        scenario: 'existing'
      }
    }
  }
  
  // Reset to clean state
  hcp.reset()
  
  // Set demo mode first
  hcp.setDemoMode(true)
  
  // Load base demo context
  hcp.updateContext(DEMO_CONTEXT, 'demo-loader')
  
  // Set authority settings
  if (DEMO_AUTHORITY.settings) {
    hcp.updateAuthoritySettings(DEMO_AUTHORITY.settings)
  }
  
  // Register demo clients (skip if already registered)
  DEMO_CLIENTS.forEach(client => {
    try {
      hcp.registerClient(client)
    } catch (error) {
      // Client might already exist, that's ok
      console.log(`[Demo] Client ${client.id} already registered`)
    }
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