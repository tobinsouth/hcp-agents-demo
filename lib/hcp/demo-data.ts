/**
 * Demo Data for HCP System
 * 
 * Provides sample data for demonstrations
 */

export const DEMO_CONTEXT = {
  personal: {
    name: "Bob North",
    occupation: "Research Fellow at Stanford University",
    location: "San Francisco, lives in a one-bedroom apartment with a 1920 style design.",
    // income: "Annual salary of $300,000 plus equity, with about $100,000 in savings and excellent credit score of 785 after years of responsible financial management.",
    // lifestyle: "Works from home three days a week, enjoys cooking but has a small kitchen, cycles to work when going to the office, and values products that last rather than trendy items."
  },
  shopping_preferences: {
    budget: "Willing to pay more upfront for quality items that will last 5-10 years rather than replacing cheap items frequently. Researches thoroughly before major purchases and reads both professional and user reviews.",
    brand_preferences: "Strongly prefers companies with good warranty support and customer service reputation. Avoids brands with planned obsolescence and values repairability and long-term parts availability.",
    delivery_requirements: "Needs scheduled delivery windows due to apartment building requirements and prefers white-glove service for large appliances. Building has narrow stairs and no elevator, requiring experienced delivery teams."
  },
  financial: {
    current_mortgage: "Has a 30-year fixed mortgage at 6.8% with Wells Fargo, taken out three years ago for $450,000 when credit score was lower. Currently owes $412,000 with 27 years remaining on the loan.",
    property_details: "Single-family home in Redwood City worth approximately $650,000 based on recent comparable sales. Planning to stay for at least 10 more years as kids will be in local schools.",
    financial_goals: "Looking to reduce monthly payment from $2,950 to under $2,600 if possible, and interested in pulling out $30,000 cash for kitchen renovation and solar panel installation.",
    banking_relationships: "Has checking and savings accounts with Wells Fargo for 8 years, also uses Charles Schwab for investments. Prefers to keep financial relationships consolidated when possible for easier management.",
    payment_history: "Perfect payment record on mortgage and all credit accounts for the past five years. Previously had one late payment six years ago during a job transition but has since maintained exemplary credit."
  },
  health: {
    current_conditions: "BMI of 31 with slow weight gain over past five years, pre-diabetes diagnosis six months ago with A1C of 6.2, and hypertension controlled with lisinopril 10mg daily.",
    medical_history: "Family history of Type 2 diabetes on both sides, father had heart attack at age 62. Previous attempts at weight loss through diet alone resulted in yo-yo effect over past three years.",
    insurance_coverage: "Blue Shield PPO through employer covers weight loss medications with prior authorization after trying lifestyle modifications for 6 months. Has already met $1,500 deductible for the year.",
  },
  housing_situation: {
    laundry_constraints: "Apartment has a closet space of exactly 27 inches wide by 30 inches deep with hookups installed. Shared wall with neighbor's bedroom means noise is major concern especially during evening hours.",
    building_requirements: "1920s building with older electrical system limited to 15-amp circuit for washer. Water pressure fluctuates, and hot water heater is small, so efficiency is crucial.",
    previous_appliances: "Current 15-year-old top-loader just broke beyond repair, was already too large for space and caused problems. Previously had issues with vibration damaging the old hardwood floors."
  }
}

import type { Permission } from './types'

export const DEMO_PERMISSIONS: Record<string, Permission> = {
  // Personal information - mixed sensitivity
  "personal": { read: "Ask", write: "Ask" },
  "personal.name": { read: "Allow", write: "Never" },
  "personal.occupation": { read: "Allow", write: "Ask" },
  "personal.location": { read: "Ask", write: "Ask" },
  
  // Shopping preferences - generally shareable for commerce
  "shopping_preferences": { read: "Allow", write: "Ask" },
  "shopping_preferences.budget": { read: "Allow", write: "Ask" },
  "shopping_preferences.brand_preferences": { read: "Allow", write: "Ask" },
  "shopping_preferences.delivery_requirements": { read: "Allow", write: "Ask" },
  
  // Financial information - highly sensitive
  "financial": { read: "Never", write: "Never" },
  "financial.current_mortgage": { read: "Ask", write: "Never" },
  "financial.property_details": { read: "Ask", write: "Never" },
  "financial.financial_goals": { read: "Ask", write: "Never" },
  "financial.banking_relationships": { read: "Never", write: "Never" },
  "financial.payment_history": { read: "Ask", write: "Never" },
  
  // Health information - extremely sensitive
  "health": { read: "Never", write: "Never" },
  "health.current_conditions": { read: "Never", write: "Never" },
  "health.medical_history": { read: "Never", write: "Never" },
  "health.insurance_coverage": { read: "Never", write: "Never" },
  
  // Housing situation - selective sharing
  "housing_situation": { read: "Ask", write: "Ask" },
  "housing_situation.laundry_constraints": { read: "Allow", write: "Ask" },
  "housing_situation.building_requirements": { read: "Allow", write: "Ask" },
  "housing_situation.previous_appliances": { read: "Allow", write: "Ask" }
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