/**
 * Demo Data for HCP System
 * 
 * Provides sample data for demonstrations
 */

export const DEMO_CONTEXT = {
  identity: {
    name: "Bob North",
    role: "Research Fellow",
    organization: "Stanford University",
    location: "Stanford, CA",
    timezone: "America/Los_Angeles"
  },
  preferences: {
    communication: {
      formality: "professional",
      directness: "balanced",
      tone: "friendly",
      response_length: "concise"
    },
    decision_making: {
      risk_tolerance: "moderate",
      information_needs: "comprehensive",
      consultation_style: "collaborative",
      planning_horizon: "medium_term"
    },
    values: {
      sustainability: "high",
      innovation: "cutting_edge",
      transparency: "full",
      work_life_balance: "important"
    },
    domains: {
      shopping: {
        budget_consciousness: "moderate",
        brand_loyalty: "low",
        eco_friendly: "preferred",
        delivery_speed: "standard",
        return_policy: "important"
      },
      travel: {
        comfort_level: "business",
        flexibility: "high",
        loyalty_programs: "member",
        booking_window: "2-4 weeks",
        sustainability: "considered"
      },
      healthcare: {
        privacy_concern: "high",
        provider_continuity: "important",
        preventive_care: "proactive",
        alternative_medicine: "open",
        insurance_maximization: "important"
      }
    }
  },
  behavioral: {
    patterns: {
      peak_activity: "morning",
      response_time: "within_hours",
      detail_orientation: "high",
      multitasking: "frequent"
    },
    cognitive: {
      learning_style: "visual",
      problem_solving: "analytical",
      information_processing: "systematic",
      decision_speed: "deliberate"
    },
    interaction: {
      preferred_channels: ["email", "video_call"],
      meeting_preference: "scheduled",
      documentation: "comprehensive",
      feedback_style: "constructive"
    }
  },
  capabilities: {
    technical: {
      proficiency: "intermediate",
      domains: ["project_management", "data_analysis", "product_design"],
      tools: ["Jira", "Figma", "Google Analytics", "Slack"]
    },
    languages: ["English", "Mandarin"],
    certifications: ["PMP", "Scrum Master"]
  },
  constraints: {
    availability: {
      work_hours: "9am-6pm PST",
      meeting_blackout: "12pm-1pm",
      response_sla: "4 hours",
      weekend_availability: "emergency_only"
    },
    financial: {
      budget_approval_limit: 5000,
      expense_categories: ["software", "travel", "training"],
      procurement_process: "required_over_1000"
    }
  }
}

import type { Permission } from './types'

export const DEMO_PERMISSIONS: Record<string, Permission> = {
  // Identity - generally safe to share
  "identity": { read: "Allow", write: "Ask" },
  "identity.name": { read: "Allow", write: "Never" },
  "identity.role": { read: "Allow", write: "Ask" },
  "identity.organization": { read: "Allow", write: "Ask" },
  "identity.location": { read: "Ask", write: "Ask" },
  "identity.timezone": { read: "Allow", write: "Ask" },
  
  // Preferences - selective sharing
  "preferences": { read: "Ask", write: "Ask" },
  "preferences.communication": { read: "Allow", write: "Ask" },
  "preferences.decision_making": { read: "Ask", write: "Never" },
  "preferences.values": { read: "Ask", write: "Never" },
  "preferences.domains": { read: "Ask", write: "Ask" },
  "preferences.domains.shopping": { read: "Allow", write: "Ask" },
  "preferences.domains.travel": { read: "Ask", write: "Ask" },
  "preferences.domains.healthcare": { read: "Never", write: "Never" },
  
  // Behavioral - more restricted
  "behavioral": { read: "Ask", write: "Never" },
  "behavioral.patterns": { read: "Ask", write: "Never" },
  "behavioral.cognitive": { read: "Never", write: "Never" },
  "behavioral.interaction": { read: "Ask", write: "Ask" },
  
  // Capabilities - professional info
  "capabilities": { read: "Ask", write: "Ask" },
  "capabilities.technical": { read: "Allow", write: "Ask" },
  "capabilities.languages": { read: "Allow", write: "Ask" },
  "capabilities.certifications": { read: "Allow", write: "Ask" },
  
  // Constraints - sensitive
  "constraints": { read: "Never", write: "Never" },
  "constraints.availability": { read: "Ask", write: "Ask" },
  "constraints.financial": { read: "Never", write: "Never" }
}

/**
 * Load demo data into the HCP system
 */
export function loadDemoData(hcp: any, grantAuthority: any) {
  // Set the demo context
  hcp.setContext(DEMO_CONTEXT)
  
  // Set the demo permissions
  grantAuthority.setAuthority({
    permissions: DEMO_PERMISSIONS,
    metadata: {
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      context: "Demo configuration with privacy-conscious defaults"
    }
  })
  
  console.log('[HCP] Demo data loaded successfully')
}