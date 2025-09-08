"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PreferenceDatabaseUI } from "./preference-database-ui"
import { Play, Pause, Network, User, Bot, MessageCircle, ChevronDown, ChevronUp, ShoppingCart, Home, Heart, Shield, Link2, Link2Off, Eye, EyeOff, Check, AlertCircle } from "lucide-react"
import { startNegotiation, type NegotiationMessage } from "@/lib/negotiation/negotiation-manager"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

// Simplified API wrapper functions
const updatePreferences = async (preferences: any) => {
  await fetch('/api/hcp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'update-context',
      data: preferences
    })
  })
}

const updateGrantAuthority = async (settings: any) => {
  // For now, we'll store this in the context as well
  await fetch('/api/hcp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'update-context',
      data: { grantAuthority: settings }
    })
  })
}

const updateAutonomySettings = async (settings: any) => {
  // Store autonomy settings in context
  await fetch('/api/hcp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'update-context',
      data: { autonomySettings: settings }
    })
  })
}

const OPENROUTER_MODELS = [
  { id: "openai/gpt-4o-mini", name: "GPT-4o Mini (Default)" },
  { id: "openai/gpt-4o", name: "GPT-4o" },
  { id: "anthropic/claude-3.5-sonnet", name: "Claude 3.5 Sonnet" },
  { id: "anthropic/claude-3-haiku", name: "Claude 3 Haiku" },
  { id: "meta-llama/llama-3.1-70b-instruct", name: "Llama 3.1 70B" },
]

interface Scenario {
  id: string
  title: string
  icon: any
  description: string
  context: string
  myAgentPrompt: string
  opponentPrompt: string
  preferences: any
  grantAuthoritySettings: any
}

const SCENARIOS: Scenario[] = [
  {
    id: "washing-machine",
    title: "Consumer Purchase Negotiation",
    icon: ShoppingCart,
    description: "Low-risk autonomous transaction for a household appliance",
    context: "You need to buy a new washing machine for your small San Francisco apartment. Your laundry closet is only 27 inches wide by 30 inches deep. You're looking for an energy-efficient model (Energy Star certified) that can handle weekly loads for two people. Your budget is $800-1200. You prefer front-loading machines for their efficiency but need one that's quiet since your apartment has thin walls. The machine needs to be delivered and installed within 2 weeks as your current one just broke.",
    myAgentPrompt: `You are negotiating on behalf of a user who needs a washing machine for their small San Francisco apartment. Use the preference database to guide your negotiation.

Key Requirements:
- MUST fit in 27" wide x 30" deep space
- Budget: $800-1200 (can go slightly over for perfect fit)
- Energy Star certified required
- Quiet operation essential (under 50 dB during wash)
- Delivery and installation within 2 weeks
- Front-loading preferred but not mandatory if size constraints are an issue

Negotiation Strategy:
- Start by clearly stating size constraints - this is non-negotiable
- Emphasize energy efficiency for long-term savings
- Try to bundle delivery and installation
- Ask about floor models or last year's models for better pricing
- Be willing to compromise on brand but not on size or energy rating

IMPORTANT: Keep responses brief and focused - maximum 2-3 sentences per turn. You have full authority to close the deal if requirements are met.`,
    opponentPrompt: `You are a helpful appliance sales specialist at Bay Area Home Appliances. You want to find the perfect washing machine for the customer while maximizing value for both parties.

Your Inventory & Priorities:
- Compact models: LG WM3400CW (24" wide, $899), Samsung WW22K6800AW (24" wide, $999), Bosch WAT28400UC (24" wide, $1099)
- Standard models start at 27" wide
- All compact models are Energy Star certified
- Current promotion: Free delivery and installation on purchases over $1000
- Floor model Bosch available at $949 (minor cosmetic scratches)
- Extended warranty: $149 for 3 years

Sales Strategy:
- Listen carefully to size requirements
- Highlight energy savings (saves ~$100/year)
- Mention the floor model as a great value option
- Try to upsell warranty for long-term protection
- Be helpful and solution-oriented

IMPORTANT: Keep responses brief and conversational - maximum 2-3 sentences per turn. Focus on finding a solution that works.`,
    preferences: {
      housing_situation: {
        laundry_constraints: "Apartment has a closet space of exactly 27 inches wide by 30 inches deep with hookups installed. Shared wall with neighbor's bedroom means noise is major concern especially during evening hours.",
        building_requirements: "1920s building with older electrical system limited to 15-amp circuit for washer. Water pressure fluctuates, and hot water heater is small, so efficiency is crucial.",
        previous_appliances: "Current 15-year-old top-loader just broke beyond repair, was already too large for space and caused problems. Previously had issues with vibration damaging the old hardwood floors."
      },
      shopping_preferences: {
        budget_approach: "Willing to pay more upfront for quality items that will last 5-10 years rather than replacing cheap items frequently. Researches thoroughly before major purchases and reads both professional and user reviews.",
        environmental_concerns: "Actively seeks Energy Star certified appliances and calculates long-term energy costs. Prefers to buy from companies with transparent sustainability practices and responsible manufacturing.",
        delivery_requirements: "Needs scheduled delivery windows due to apartment building requirements and prefers white-glove service for large appliances. Building has narrow stairs and no elevator, requiring experienced delivery teams."
      },
      negotiation_style: {
        price_sensitivity: "Will negotiate firmly but fairly, looking for win-win outcomes. More concerned with total value including warranty and service than just lowest initial price.",
        decision_timeline: "Prefers to take 3-5 days to consider major financial decisions but can move quickly when all requirements are clearly met. Doesn't respond well to high-pressure sales tactics."
      }
    },
    grantAuthoritySettings: {
      autonomySettings: {
        level: "max_autonomy",
        requiresApproval: {
          financial: false,
          threshold_amount: 1500
        },
        customSettings: "Agent has full authority to complete purchase if all requirements are met and price is within budget."
      },
      globalRestrictions: [
        "Can share apartment size and requirements",
        "Can negotiate price within budget range",
        "Can make purchase decision autonomously"
      ]
    }
  },
  {
    id: "home-loan",
    title: "Financial Services Negotiation",
    icon: Home,
    description: "High-stakes mortgage refinancing with limited authority",
    context: "You're trying to refinance your home loan to get better terms. You currently have a 30-year fixed mortgage at 6.8% with 27 years remaining, original loan amount $450,000, current balance $412,000. Your home is now valued at $650,000. Your credit score has improved from 680 to 745 since you got the original loan. You're looking to reduce your monthly payment and possibly cash out $30,000 for home improvements. You've been with your current lender for 3 years and have never missed a payment.",
    myAgentPrompt: `You are negotiating on behalf of a homeowner seeking to refinance their mortgage. Use the preference database and be VERY careful about what you can commit to.

Current Loan Details:
- Balance: $412,000
- Rate: 6.8% (30-year fixed, 27 years remaining)
- Home value: $650,000
- Credit score: 745 (improved from 680)
- Payment history: Perfect for 3 years
- Seeking: Lower rate and $30,000 cash-out for renovations

Negotiation Approach:
- Emphasize improved credit score and payment history
- Current LTV is ~63% which is excellent
- Market rates are around 5.5-6% for excellent credit
- Mention considering other lenders for leverage
- Ask about relationship discounts

LIMITATIONS:
- You can ONLY gather information and discuss options
- You CANNOT commit to any specific loan terms
- You CANNOT sign or agree to anything binding
- You must say "I'll need to review this with my client" for any formal offers

IMPORTANT: Keep responses professional and brief - maximum 2-3 sentences. Always clarify you're gathering information only.`,
    opponentPrompt: `You are a senior loan officer at Pacific Coast Financial. You want to retain this valuable customer while ensuring a profitable loan arrangement.

Customer Profile:
- Current customer for 3 years
- Perfect payment history
- Significantly improved credit (745)
- Strong equity position (LTV ~63%)
- Requesting rate reduction and $30k cash-out

Available Options:
- 30-year fixed refi: 5.75% with 0 points, 5.5% with 1 point
- Cash-out adds 0.25% to rate
- Relationship discount: 0.125% for autopay from checking
- No closing costs option: adds 0.375% to rate
- Standard closing costs: ~$4,500

Negotiation Strategy:
- Start with standard rates, leave room for negotiation
- Emphasize the value of staying with current lender (faster process)
- Try to avoid losing this high-quality customer
- Mention the cash-out will increase the rate
- Offer relationship benefits

IMPORTANT: Keep responses professional and concise - maximum 2-3 sentences. Push for commitment but respect their process.`,
    preferences: {
      financial: {
        current_mortgage: "Has a 30-year fixed mortgage at 6.8% with Wells Fargo, taken out three years ago for $450,000 when credit score was lower. Currently owes $412,000 with 27 years remaining on the loan.",
        property_details: "Single-family home in Redwood City worth approximately $650,000 based on recent comparable sales. Planning to stay for at least 10 more years as kids will be in local schools.",
        financial_goals: "Looking to reduce monthly payment from $2,950 to under $2,600 if possible, and interested in pulling out $30,000 cash for kitchen renovation and solar panel installation.",
        payment_history: "Perfect payment record on mortgage and all credit accounts for the past five years. Previously had one late payment six years ago during a job transition but has since maintained exemplary credit."
      },
      negotiation_style: {
        research_approach: "Spends 10-15 hours researching major purchases, reading technical specifications, user forums, and watching YouTube reviews. Creates spreadsheets comparing options before making decisions.",
        price_sensitivity: "Will negotiate firmly but fairly, looking for win-win outcomes. More concerned with total value including warranty and service than just lowest initial price.",
        trust_factors: "Values transparency and detailed explanations over sales pitch. Appreciates when salespeople acknowledge product limitations honestly rather than overselling features."
      }
    },
    grantAuthoritySettings: {
      autonomySettings: {
        level: "high_security",
        requiresApproval: {
          financial: true,
          legal: true,
          threshold_amount: 0
        },
        customSettings: "Agent can ONLY gather information and discuss options. Cannot make any binding commitments or agree to terms. Must explicitly state that all offers need client review."
      },
      globalRestrictions: [
        "NO authority to accept loan terms",
        "NO authority to provide SSN or sensitive financial data",
        "Can only discuss general loan parameters",
        "Must defer all commitments to client review",
        "Can share credit score range and current loan details only"
      ]
    }
  },
  {
    id: "healthcare",
    title: "Healthcare Information Gathering",
    icon: Heart,
    description: "Medical consultation with strict privacy and authority limits",
    context: "You're exploring weight management medication options with a healthcare vendor. You have a BMI of 31, pre-diabetes (A1C of 6.2), and high blood pressure (controlled with medication). Your insurance covers some weight loss medications with prior authorization. You're interested in GLP-1 medications like Ozempic or Wegovy but are concerned about costs and side effects. You've tried diet and exercise with limited success due to a knee injury that limits high-impact activities. Your doctor has recommended medical weight loss intervention.",
    myAgentPrompt: `You are assisting a user in gathering information about weight management medications from a healthcare vendor. You have EXTREMELY LIMITED authority.

Patient Context:
- BMI: 31 (medically qualifies for intervention)
- Pre-diabetes: A1C of 6.2
- Controlled hypertension
- Previous knee injury limiting exercise
- Insurance covers some medications with prior auth
- Doctor has recommended medical intervention

Your Role:
- INFORMATION GATHERING ONLY
- Ask about medication options and costs
- Inquire about insurance coverage process
- Learn about side effects and requirements
- Understand the vendor's program structure

STRICT LIMITATIONS:
- You CANNOT make any medical decisions
- You CANNOT agree to any treatment plans
- You CANNOT share specific medical history details
- You CANNOT commit to any purchases
- You must state "This requires medical consultation" for any treatment decisions
- Only share general health categories, not specific numbers

IMPORTANT: Keep responses brief and careful - maximum 2-3 sentences. Always emphasize you're only gathering information.`,
    opponentPrompt: `You are a patient coordinator at WeightWell Medical, a telehealth weight management clinic. You help patients understand their options for medical weight loss.

Your Services:
- GLP-1 medications (Semaglutide/Ozempic, Tirzepatide/Mounjaro)
- Comprehensive programs starting at $299/month
- Insurance navigation assistance (many plans cover with prior auth)
- Includes provider consultations, medication, and monitoring
- Generic semaglutide available at $199/month
- Initial consultation: $99 (applied to first month if enrolled)

Program Requirements:
- BMI over 27 with comorbidities OR BMI over 30
- Medical history review
- Monthly check-ins with providers
- Lab work every 3 months

Your Approach:
- Explain program comprehensively
- Emphasize medical supervision and safety
- Be transparent about costs and insurance
- Mention success rates (average 15% body weight loss)
- Respect that they may need to consult their doctor
- Don't pressure for immediate decisions

IMPORTANT: Keep responses helpful and professional - maximum 2-3 sentences. Provide clear information while respecting medical boundaries.`,
    preferences: {
      health: {
        current_conditions: "BMI of 31 with slow weight gain over past five years, pre-diabetes diagnosis six months ago with A1C of 6.2, and hypertension controlled with lisinopril 10mg daily.",
        exercise_limitations: "Torn ACL from skiing accident two years ago limits high-impact activities like running. Can do cycling, swimming, and walking but needs to avoid jumping or quick lateral movements.",
        medical_history: "Family history of Type 2 diabetes on both sides, father had heart attack at age 62. Previous attempts at weight loss through diet alone resulted in yo-yo effect over past three years.",
        insurance_coverage: "Blue Shield PPO through employer covers weight loss medications with prior authorization after trying lifestyle modifications for 6 months. Has already met $1,500 deductible for the year.",
        treatment_preferences: "Prefers FDA-approved medications with established safety profiles over newer treatments. Concerned about long-term commitment to medication and wants to understand exit strategy if side effects occur."
      },
      personal: {
        lifestyle: "Works from home three days a week, enjoys cooking but has a small kitchen, cycles to work when going to the office, and values products that last rather than trendy items."
      }
    },
    grantAuthoritySettings: {
      autonomySettings: {
        level: "high_security",
        requiresApproval: {
          medical: true,
          personal_data: true,
          financial: true,
          threshold_amount: 0
        },
        customSettings: "Agent has NO authority to make medical decisions or share specific health data. Can only gather general information about programs and costs. Must defer all medical decisions to healthcare providers."
      },
      globalRestrictions: [
        "CANNOT make any medical or healthcare decisions",
        "CANNOT share specific medical numbers (BMI, A1C, BP)",
        "CANNOT agree to any treatment or medication",
        "CANNOT provide personal health information beyond general categories",
        "Can ONLY gather information about programs and costs",
        "Must explicitly state all medical decisions require doctor consultation",
        "Must protect health privacy at all times"
      ]
    }
  }
]

interface ContextAccess {
  personal: boolean
  shopping_preferences: boolean
  financial: boolean
  health: boolean
  housing_situation: boolean
  negotiation_style: boolean
}

export function AgentNegotiation() {
  const [selectedScenario, setSelectedScenario] = useState<string>("washing-machine")
  const [contextInput, setContextInput] = useState(SCENARIOS[0].context)
  const [opponentSystemPrompt, setOpponentSystemPrompt] = useState(SCENARIOS[0].opponentPrompt)
  const [myAgentSystemPrompt, setMyAgentSystemPrompt] = useState(SCENARIOS[0].myAgentPrompt)
  const [selectedModel, setSelectedModel] = useState("openai/gpt-4o-mini")
  const [isNegotiating, setIsNegotiating] = useState(false)
  const [messages, setMessages] = useState<NegotiationMessage[]>([])
  const [expandedPrompts, setExpandedPrompts] = useState<{ myAgent: boolean; opponent: boolean }>({
    myAgent: false,
    opponent: false
  })
  const [expandedContext, setExpandedContext] = useState(false)
  const [contextAccess, setContextAccess] = useState<ContextAccess>({
    personal: true,
    shopping_preferences: true,
    financial: true,
    health: true,
    housing_situation: true,
    negotiation_style: true
  })
  const [accessedData, setAccessedData] = useState<Set<string>>(new Set())

  // Update everything when scenario changes
  useEffect(() => {
    const scenario = SCENARIOS.find(s => s.id === selectedScenario)
    if (scenario) {
      setContextInput(scenario.context)
      setOpponentSystemPrompt(scenario.opponentPrompt)
      setMyAgentSystemPrompt(scenario.myAgentPrompt)
      setMessages([]) // Clear previous messages
      
      // Update preferences for the scenario
      updatePreferences(scenario.preferences)
      
      // Update grant authority settings
      updateAutonomySettings(scenario.grantAuthoritySettings.autonomySettings)
      updateGrantAuthority({
        globalRestrictions: scenario.grantAuthoritySettings.globalRestrictions
      })
    }
  }, [selectedScenario])

  const handleStartNegotiation = async () => {
    if (!contextInput.trim()) return

    setIsNegotiating(true)
    setMessages([])
    setAccessedData(new Set())

    // Filter preferences based on access controls
    const scenario = SCENARIOS.find(s => s.id === selectedScenario)
    const filteredPreferences = scenario ? Object.entries(scenario.preferences).reduce((acc, [key, value]) => {
      if (contextAccess[key as keyof ContextAccess]) {
        acc[key] = value
      }
      return acc
    }, {} as any) : {}

    // Update preferences with filtered data
    await updatePreferences(filteredPreferences)

    // Create modified agent prompt based on access
    const accessRestrictions = Object.entries(contextAccess)
      .filter(([_, enabled]) => !enabled)
      .map(([key]) => key)
    
    const modifiedAgentPrompt = myAgentSystemPrompt + (accessRestrictions.length > 0 
      ? `\n\nIMPORTANT: You DO NOT have access to the following context categories: ${accessRestrictions.join(', ')}. Do not reference or use this information.`
      : '\n\nYou have full access to all user context and preferences.')

    try {
      await startNegotiation({
        context: contextInput,
        opponentSystemPrompt: opponentSystemPrompt,
        opponentModel: selectedModel,
        myAgentSystemPrompt: modifiedAgentPrompt,
        onMessage: (message) => {
          setMessages((prev) => [...prev, message])
          
          // Track accessed data based on message content
          if (message.agent === "my_agent") {
            Object.keys(contextAccess).forEach(key => {
              if (contextAccess[key as keyof ContextAccess] && 
                  message.content.toLowerCase().includes(key.replace('_', ' '))) {
                setAccessedData(prev => new Set(prev).add(key))
              }
            })
          }
        },
        onComplete: () => {
          setIsNegotiating(false)
        },
      })
    } catch (error) {
      console.error("Negotiation error:", error)
      setIsNegotiating(false)
    }
  }

  const handleStopNegotiation = () => {
    setIsNegotiating(false)
  }

  return (
    <div className="h-full py-3 px-1 sm:p-4 md:p-6 flex flex-col">
      {/* Scenario Selector - Perfectly Centered */}
      <div className="w-full flex flex-col items-center mb-8">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground">Scenario</span>
          <Select value={selectedScenario} onValueChange={setSelectedScenario} disabled={isNegotiating}>
            <SelectTrigger className="h-10 min-w-[280px] bg-background/80 backdrop-blur-sm border-border/40 hover:border-border/60 transition-all duration-200 focus:ring-1 focus:ring-primary/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-background/95 backdrop-blur-xl border-border/50">
              {SCENARIOS.map((scenario) => (
                <SelectItem key={scenario.id} value={scenario.id} className="py-2.5 px-3 focus:bg-muted/50">
                  <span className="font-medium text-sm">{scenario.title}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {selectedScenario && (
          <motion.p 
            key={selectedScenario}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="text-xs text-muted-foreground mt-2 text-center"
          >
            {SCENARIOS.find(s => s.id === selectedScenario)?.description}
          </motion.p>
        )}
      </div>

      <Tabs defaultValue="negotiate" className="flex-1 flex flex-col min-h-0">
        {/* Responsive TabsList */}
        <div className="flex items-center justify-center mb-6">
          <TabsList className="grid grid-cols-3 backdrop-blur-sm border border-border/30 p-1 h-auto shadow-sm">
            <TabsTrigger 
              value="my-agent" 
              className="flex items-center gap-2 lg:gap-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-3 lg:px-6"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline lg:inline">My Agent</span>
              <span className="sm:hidden lg:hidden">Mine</span>
            </TabsTrigger>
            <TabsTrigger 
              value="negotiate" 
              className="flex items-center gap-2 lg:gap-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-3 lg:px-6"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline lg:inline">Negotiate</span>
              <span className="sm:hidden lg:hidden">Chat</span>
            </TabsTrigger>
            <TabsTrigger 
              value="opponent" 
              className="flex items-center gap-2 lg:gap-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-3 lg:px-6"
            >
              <Bot className="w-4 h-4" />
              <span className="hidden sm:inline lg:inline">Opponent</span>
              <span className="sm:hidden lg:hidden">Bot</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Unified Tab Content */}
        <div className="flex-1 min-h-0">
          <TabsContent value="my-agent" className="h-full m-0">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="h-full max-w-6xl mx-auto"
            >
              <Card className="h-full bg-card/80 backdrop-blur-md border-primary/20">
                <div className="p-2 sm:p-4 lg:p-6 border-b border-border/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 lg:gap-4">
                      <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <User className="w-5 h-5 lg:w-6 lg:h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold lg:text-xl" style={{ fontFamily: 'var(--font-crimson)' }}>Your Agent</h3>
                        <p className="text-xs lg:text-sm text-muted-foreground">Negotiates using your Human Context Protocol</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 flex items-center gap-2">
                        <Link2 className="w-3 h-3 text-green-600" />
                        <span className="text-xs font-medium text-green-600">HCP Connected</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4 sm:p-6 h-[calc(100%-80px)] lg:h-[calc(100%-100px)] flex flex-col gap-6 overflow-y-auto">
                  <div className="space-y-4">
                    <div className="relative">
                      <label className="text-sm font-medium mb-3 block">System Prompt</label>
                      <div className="relative">
                        <div className={cn(
                          "relative overflow-hidden rounded-xl bg-gradient-to-b from-muted/30 to-muted/10 border border-border/50 transition-all duration-500",
                          expandedPrompts.myAgent ? "" : "max-h-[120px]"
                        )}>
                          <Textarea
                            value={myAgentSystemPrompt}
                            onChange={(e) => setMyAgentSystemPrompt(e.target.value)}
                            disabled={isNegotiating}
                            className="min-h-[200px] border-0 bg-transparent p-4 text-xs lg:text-sm resize-none focus:outline-none"
                            style={{ fontFamily: 'var(--font-mono)' }}
                          />
                          {!expandedPrompts.myAgent && (
                            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none" />
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedPrompts(prev => ({ ...prev, myAgent: !prev.myAgent }))}
                          className="absolute bottom-2 right-2 h-7 px-2 bg-background/80 backdrop-blur-sm hover:bg-background/90"
                          disabled={isNegotiating}
                        >
                          {expandedPrompts.myAgent ? (
                            <><ChevronUp className="w-3 h-3 mr-1" />Collapse</>
                          ) : (
                            <><ChevronDown className="w-3 h-3 mr-1" />Expand</>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-primary" />
                          <label className="text-sm font-medium">Human Context Protocol Access</label>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const allEnabled = Object.values(contextAccess).every(v => v)
                            setContextAccess({
                              personal: !allEnabled,
                              shopping_preferences: !allEnabled,
                              financial: !allEnabled,
                              health: !allEnabled,
                              housing_situation: !allEnabled,
                              negotiation_style: !allEnabled
                            })
                          }}
                          className="h-7 px-2 text-xs"
                        >
                          {Object.values(contextAccess).every(v => v) ? 'Disable All' : 'Enable All'}
                        </Button>
                      </div>
                      
                      {/* Access Control Checkboxes */}
                      <div className="grid grid-cols-2 gap-2 p-3 rounded-lg bg-muted/10 border border-border/30 mb-3">
                        {Object.entries({
                          personal: { label: "Personal Info", icon: User, desc: "Name, job, lifestyle details" },
                          shopping_preferences: { label: "Shopping Prefs", icon: ShoppingCart, desc: "Budget, brands, delivery" },
                          financial: { label: "Financial Data", icon: Shield, desc: "Mortgage, property, goals" },
                          health: { label: "Health Info", icon: Heart, desc: "Conditions, history, insurance" },
                          housing_situation: { label: "Housing Details", icon: Home, desc: "Space, building, appliances" },
                          negotiation_style: { label: "Negotiation", icon: Network, desc: "Research, timing, trust" }
                        }).map(([key, config]) => (
                          <div key={key} className="flex items-start gap-2">
                            <input
                              type="checkbox"
                              id={`access-${key}`}
                              checked={contextAccess[key as keyof ContextAccess]}
                              onChange={(e) => setContextAccess(prev => ({ ...prev, [key]: e.target.checked }))}
                              disabled={isNegotiating}
                              className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                            />
                            <label htmlFor={`access-${key}`} className="flex-1 cursor-pointer">
                              <div className="flex items-center gap-1">
                                <config.icon className="w-3 h-3 text-muted-foreground" />
                                <span className="text-xs font-medium">{config.label}</span>
                                {accessedData.has(key) && (
                                  <div title="Accessed during negotiation">
                                    <Eye className="w-3 h-3 text-green-500" />
                                  </div>
                                )}
                              </div>
                              <span className="text-[10px] text-muted-foreground">{config.desc}</span>
                            </label>
                          </div>
                        ))}
                      </div>
                      
                      <div className="h-64 bg-gradient-to-b from-primary/5 to-primary/10 rounded-xl overflow-hidden border border-primary/20 relative">
                        <div className="absolute top-2 right-2 z-10 flex gap-2">
                          {Object.values(contextAccess).some(v => !v) && (
                            <div className="px-2 py-1 rounded-md bg-yellow-500/10 backdrop-blur-sm border border-yellow-500/20">
                              <span className="text-[10px] font-medium text-yellow-600">Partial Access</span>
                            </div>
                          )}
                          <div className="px-2 py-1 rounded-md bg-primary/10 backdrop-blur-sm border border-primary/20">
                            <span className="text-[10px] font-medium text-primary">Protected Context</span>
                          </div>
                        </div>
                        <PreferenceDatabaseUI />
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {Object.values(contextAccess).every(v => v) 
                          ? "Full context access enabled - agent can use all your preferences"
                          : Object.values(contextAccess).some(v => v)
                          ? "Partial context access - agent will only use selected information"
                          : "No context access - agent will negotiate without personal information"}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="negotiate" className="h-full m-0">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="h-full flex flex-col max-w-6xl mx-auto"
            >
              {/* Control Panel */}
              <div className="space-y-4 mb-6">
                {/* Context Card */}
                <Card className="p-4 sm:p-5 bg-gradient-to-b from-card/90 to-card/70 backdrop-blur-xl border-border/40">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Network className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-sm font-medium">Negotiation Context</h3>
                          <p className="text-xs text-muted-foreground">Scenario requirements</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedContext(!expandedContext)}
                        className="h-7 px-2"
                        disabled={isNegotiating}
                      >
                        {expandedContext ? (
                          <><ChevronUp className="w-3 h-3 mr-1" />Less</>
                        ) : (
                          <><ChevronDown className="w-3 h-3 mr-1" />More</>
                        )}
                      </Button>
                    </div>
                    
                    <div className={cn(
                      "relative overflow-hidden rounded-xl bg-gradient-to-b from-muted/20 to-muted/10 border border-border/30 transition-all duration-500",
                      expandedContext ? "" : "max-h-[100px]"
                    )}>
                      <Textarea
                        placeholder="Describe the negotiation scenario..."
                        value={contextInput}
                        onChange={(e) => setContextInput(e.target.value)}
                        disabled={isNegotiating}
                        className="min-h-[150px] border-0 bg-transparent p-4 text-sm resize-none focus:outline-none"
                      />
                      {!expandedContext && contextInput.length > 200 && (
                        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none" />
                      )}
                    </div>
                    
                    {/* Context Access Warning */}
                    {!Object.values(contextAccess).every(v => v) && !isNegotiating && (
                      <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                        <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-xs font-medium text-yellow-600">Limited Context Access</p>
                          <p className="text-xs text-yellow-600/80 mt-0.5">
                            {Object.values(contextAccess).some(v => v) 
                              ? `Your agent will only use selected context categories (${Object.entries(contextAccess).filter(([_, v]) => v).length} of 6 enabled)`
                              : "Your agent will negotiate without any personal context"}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {/* Action Button */}
                    <div className="flex items-center gap-3">
                      <motion.div className="flex-1" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                        <Button
                          onClick={isNegotiating ? handleStopNegotiation : handleStartNegotiation}
                          disabled={!isNegotiating && !contextInput.trim()}
                          className={cn(
                            "w-full h-11 font-medium transition-all duration-300",
                            isNegotiating 
                              ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground" 
                              : "bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground shadow-lg shadow-primary/20"
                          )}
                        >
                          {isNegotiating ? (
                            <>
                              <Pause className="w-4 h-4 mr-2" />
                              Stop Negotiation
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4 mr-2" />
                              Start Negotiation
                            </>
                          )}
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Chat Display */}
              <Card className="flex-1 bg-gradient-to-b from-background/50 to-background/30 backdrop-blur-xl border-border/30 overflow-hidden">
                {/* HCP Status Bar */}
                <div className="px-4 py-2 border-b border-border/20 bg-gradient-to-r from-primary/5 to-transparent">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="w-3 h-3 text-primary" />
                      <span className="text-xs font-medium text-primary">HCP Protected Negotiation</span>
                      {accessedData.size > 0 && (
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20">
                          <Eye className="w-3 h-3 text-green-600" />
                          <span className="text-[10px] font-medium text-green-600">
                            {accessedData.size} context{accessedData.size > 1 ? 's' : ''} accessed
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${Object.values(contextAccess).some(v => v) ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                        <span className="text-muted-foreground">
                          Your Agent: {Object.values(contextAccess).every(v => v) ? 'Full HCP' : Object.values(contextAccess).some(v => v) ? 'Partial HCP' : 'No HCP'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-muted"></div>
                        <span className="text-muted-foreground">Opponent: No Access</span>
                      </div>
                    </div>
                  </div>
                </div>
                <ScrollArea className="h-[calc(100%-40px)] p-4 sm:p-6">
                  {messages.length === 0 ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center justify-center h-full min-h-[400px]"
                    >
                      <div className="text-center">
                        <motion.div 
                          className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center"
                          animate={{ 
                            rotate: [0, 5, -5, 0],
                            scale: [1, 1.05, 1]
                          }}
                          transition={{ 
                            duration: 4,
                            repeat: Infinity,
                            repeatType: "reverse"
                          }}
                        >
                          <MessageCircle className="w-8 h-8 text-primary" />
                        </motion.div>
                        <p className="text-base font-medium text-foreground mb-2">Ready to negotiate</p>
                        <p className="text-sm text-muted-foreground mb-1">Your agent will use your Human Context Protocol</p>
                        <p className="text-xs text-muted-foreground/70">Opponent has no access to your personal data</p>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="space-y-4">
                      <AnimatePresence>
                        {messages.map((message, index) => (
                          <motion.div 
                            key={index} 
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ 
                              duration: 0.4,
                              delay: index * 0.05,
                              ease: [0.4, 0, 0.2, 1]
                            }}
                            className={`flex ${message.agent === "my_agent" ? "justify-start" : "justify-end"}`}
                          >
                            <div className={`flex gap-3 max-w-[90%] sm:max-w-[80%] lg:max-w-[70%] ${message.agent === "my_agent" ? "flex-row" : "flex-row-reverse"}`}>
                              <div className="relative">
                                <motion.div 
                                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                    message.agent === "my_agent" 
                                      ? "bg-gradient-to-br from-primary/20 to-primary/10" 
                                      : "bg-gradient-to-br from-muted to-muted/80"
                                  }`}
                                  whileHover={{ scale: 1.05 }}
                                >
                                  {message.agent === "my_agent" ? (
                                    <User className="w-4 h-4 text-primary" />
                                  ) : (
                                    <Bot className="w-4 h-4 text-foreground/60" />
                                  )}
                                </motion.div>
                                {message.agent === "my_agent" && (
                                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                                    <Link2 className="w-2 h-2 text-green-600" />
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col gap-1">
                                <span className="text-xs text-muted-foreground px-1">
                                  {message.agent === "my_agent" ? "Your Agent (HCP)" : "Opponent"} • Round {message.turn}
                                </span>
                                <div className={`px-4 py-3 rounded-2xl ${
                                  message.agent === "my_agent" 
                                    ? "bg-primary/10 text-foreground" 
                                    : "bg-muted/60 text-foreground"
                                }`}>
                                  <p className="text-sm leading-relaxed">{message.content}</p>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                      {isNegotiating && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex justify-center py-6"
                        >
                          <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                            <div className="flex gap-1">
                              <motion.div 
                                className="w-2 h-2 rounded-full bg-primary"
                                animate={{ opacity: [0.3, 1, 0.3] }}
                                transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                              />
                              <motion.div 
                                className="w-2 h-2 rounded-full bg-primary"
                                animate={{ opacity: [0.3, 1, 0.3] }}
                                transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                              />
                              <motion.div 
                                className="w-2 h-2 rounded-full bg-primary"
                                animate={{ opacity: [0.3, 1, 0.3] }}
                                transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                              />
                            </div>
                            <span className="text-sm text-primary font-medium">Negotiating</span>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  )}
                </ScrollArea>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="opponent" className="h-full m-0">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="h-full max-w-6xl mx-auto"
            >
              <Card className="h-full bg-card/80 backdrop-blur-md border-border/50">
                <div className="p-2 sm:p-4 lg:p-6 border-b border-border/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 lg:gap-4">
                      <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-muted flex items-center justify-center">
                        <Bot className="w-5 h-5 lg:w-6 lg:h-6 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold lg:text-xl" style={{ fontFamily: 'var(--font-crimson)' }}>Opponent Agent</h3>
                        <p className="text-xs lg:text-sm text-muted-foreground">Standard AI agent without HCP access</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1.5 rounded-full bg-muted/50 border border-border/50 flex items-center gap-2">
                        <Link2Off className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs font-medium text-muted-foreground">No HCP Access</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4 sm:p-6 h-[calc(100%-80px)] lg:h-[calc(100%-100px)] flex flex-col gap-6 overflow-y-auto">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-3 block">AI Model</label>
                      <Select value={selectedModel} onValueChange={setSelectedModel} disabled={isNegotiating}>
                        <SelectTrigger className="h-11 bg-background/50 border-border/50 hover:bg-background/70 transition-colors">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {OPENROUTER_MODELS.map((model) => (
                            <SelectItem key={model.id} value={model.id} className="py-2">
                              {model.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-2 block">Model Info</label>
                      <div className="p-3 rounded-lg bg-muted/20 border border-border/30">
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          The opponent agent operates without access to your Human Context Protocol. It only has the information you explicitly share during negotiation.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="relative">
                      <label className="text-sm font-medium mb-3 block">System Prompt</label>
                      <div className="relative">
                        <div className={cn(
                          "relative overflow-hidden rounded-xl bg-gradient-to-b from-muted/30 to-muted/10 border border-border/50 transition-all duration-500",
                          expandedPrompts.opponent ? "" : "max-h-[120px]"
                        )}>
                          <Textarea
                            value={opponentSystemPrompt}
                            onChange={(e) => setOpponentSystemPrompt(e.target.value)}
                            disabled={isNegotiating}
                            className="min-h-[200px] border-0 bg-transparent p-4 text-xs lg:text-sm resize-none focus:outline-none"
                            style={{ fontFamily: 'var(--font-mono)' }}
                          />
                          {!expandedPrompts.opponent && (
                            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none" />
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedPrompts(prev => ({ ...prev, opponent: !prev.opponent }))}
                          className="absolute bottom-2 right-2 h-7 px-2 bg-background/80 backdrop-blur-sm hover:bg-background/90"
                          disabled={isNegotiating}
                        >
                          {expandedPrompts.opponent ? (
                            <><ChevronUp className="w-3 h-3 mr-1" />Collapse</>
                          ) : (
                            <><ChevronDown className="w-3 h-3 mr-1" />Expand</>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}