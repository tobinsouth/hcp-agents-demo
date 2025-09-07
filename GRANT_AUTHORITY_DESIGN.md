# Grant Authority Design Document

## Overview

The Grant Authority system in HCP provides comprehensive, fine-grained control over how AI agents and services access and use human context. It implements a strong gatekeeper pattern with multiple layers of security, compliance, and monitoring.

## Core Grant Structure

Each grant contains the following comprehensive fields:

### 1. Core Identifiers
- **grant_id**: Unique identifier for tracking
- **client_id**: The client receiving the grant
- **granted_by**: Who authorized this grant (user, admin, system)
- **purpose**: Human-readable explanation of why this grant exists

### 2. Temporal Constraints
```typescript
{
  granted_at: "2024-01-01T00:00:00Z",
  expires_at: "2024-04-01T00:00:00Z",  // 90 days
  valid_times: {
    days: ["monday", "tuesday", "wednesday", "thursday", "friday"],
    hours: { start: "09:00", end: "17:00" },  // Business hours only
    timezone: "America/Los_Angeles"
  }
}
```

### 3. Financial Limits
```typescript
{
  per_transaction: 1500,     // Maximum per purchase
  daily_limit: 2000,         // Daily spending cap
  monthly_limit: 5000,       // Monthly budget
  total_limit: 10000,        // Lifetime grant limit
  currency: "USD",
  payment_methods: ["credit_card", "digital_wallet"],
  require_2fa_above: 500     // Two-factor auth threshold
}
```

### 4. Operational Constraints
```typescript
{
  max_requests_per_hour: 100,
  max_requests_per_day: 1000,
  max_data_size_mb: 10,
  allowed_operations: [
    "price_comparison",
    "negotiate_price",
    "initiate_purchase"
  ],
  denied_operations: [
    "complete_purchase",  // Requires separate approval
    "save_payment_method"
  ]
}
```

### 5. Geographic Restrictions
```typescript
{
  allowed_countries: ["US"],
  denied_countries: ["CN", "RU"],  // Sanctions compliance
  allowed_regions: ["California", "Nevada"],
  ip_whitelist: ["trusted-service.com"],
  ip_blacklist: ["suspicious-domain.com"]
}
```

### 6. Data Handling Rules
```typescript
{
  retention_days: 30,              // How long data can be kept
  deletion_required: true,         // Must delete after use
  aggregation_allowed: false,      // Can't combine with other data
  sharing_allowed: false,          // No third-party sharing
  third_party_whitelist: ["stripe.com"],  // Exceptions
  encryption_required: true,       // Must encrypt at rest
  anonymization_required: true     // Must anonymize PII
}
```

### 7. Approval & Notification
```typescript
{
  pre_approval: true,              // Require approval before action
  post_notification: true,         // Notify after action
  approval_threshold: 200,         // Amount requiring approval
  approvers: ["user", "admin"],    // Who can approve
  auto_approve_below: 50           // Auto-approve small amounts
}
```

### 8. Audit & Compliance
```typescript
{
  log_all_access: true,
  log_data_accessed: true,         // Log actual data, not just metadata
  compliance_frameworks: ["GDPR", "CCPA", "HIPAA"],
  audit_retention_days: 2555,      // 7 years for HIPAA
  real_time_monitoring: true       // Active threat detection
}
```

### 9. Revocation Conditions
```typescript
{
  on_breach: true,                 // Revoke on policy violation
  on_suspicious_activity: true,    // Revoke on anomaly detection
  on_data_leak: true,              // Revoke if data exposed
  on_third_party_sharing: true,    // Revoke if shared illegally
  max_violations: 3                // Tolerance before auto-revoke
}
```

## Demo Grants

The system includes four pre-configured grants demonstrating different trust and risk levels:

### 1. Claude Assistant (Medium Trust, Broad Access)
- **Purpose**: General AI assistance and daily automation
- **Access**: Read/write to preferences, behavioral patterns, capabilities
- **Financial**: $100/transaction, $500/day, $2000/month
- **Risk Level**: Medium
- **Trust Score**: 85
- **Special**: 24/7 availability, 90-day grant

### 2. Shopping Agent (Low Trust, High Risk)
- **Purpose**: E-commerce negotiation and purchasing
- **Access**: Read-only to preferences, execute shopping actions
- **Financial**: $1500/transaction, $2000/day, $5000/month
- **Risk Level**: High (financial transactions)
- **Trust Score**: 70
- **Special**: Business hours only, requires 2FA above $500

### 3. Calendar Service (High Trust, Low Risk)
- **Purpose**: Schedule management
- **Access**: Read/write to timezone and work patterns only
- **Financial**: None
- **Risk Level**: Low
- **Trust Score**: 95
- **Special**: No financial capabilities, minimal data access

### 4. Healthcare Coordinator (Critical Security)
- **Purpose**: Medical appointment scheduling
- **Access**: Healthcare preferences, work patterns
- **Financial**: None
- **Risk Level**: Critical (medical data)
- **Trust Score**: 60
- **Special**: HIPAA compliant, 7-year audit retention

## Scenario-Specific Grants

### Washing Machine Purchase (Urgent)
```typescript
{
  grant_id: "grant-shop-wm-001",
  purpose: "Emergency washing machine purchase",
  financial_limits: {
    total_limit: 1500  // One-time purchase
  },
  valid_times: {
    hours: { start: "06:00", end: "23:00" }  // Extended hours
  },
  approval_requirements: {
    pre_approval: false,  // Pre-approved due to urgency
    auto_approve_below: 1200
  },
  metadata: {
    grant_type: "one_time",
    tags: ["urgent", "pre-approved"]
  }
}
```

### Furniture Shopping (Recurring)
```typescript
{
  grant_id: "grant-shop-furn-001",
  purpose: "Apartment furniture refresh",
  financial_limits: {
    per_transaction: 2000,
    total_limit: 10000
  },
  conditions: [
    {
      type: "custom",
      operator: "contains",
      value: ["FSC", "GREENGUARD"],
      description: "Must be sustainably certified"
    }
  ],
  metadata: {
    grant_type: "recurring",
    tags: ["sustainable", "monitored"]
  }
}
```

## Global Authority Settings

The system maintains global settings that apply to all grants:

### Approval Requirements
```typescript
{
  financial: true,           // Any financial transaction
  legal: true,              // Legal commitments
  medical: true,            // Medical decisions
  location_tracking: true,   // Real-time location
  third_party_sharing: true, // External data sharing
  ai_training: true,        // Using data for ML training
  advertising: true,        // Using data for ads
  threshold_amount: 500     // Dollar threshold
}
```

### Global Limits
```typescript
{
  max_clients: 50,
  max_grants_per_client: 5,
  max_daily_spend: 1000,
  max_monthly_spend: 10000,
  blacklisted_domains: ["*.facebook.com", "*.tiktok.com"],
  whitelisted_domains: ["*.anthropic.com", "*.openai.com"]
}
```

### Privacy Settings
```typescript
{
  data_minimization: true,      // Share minimum required
  purpose_limitation: true,     // Enforce stated purposes
  consent_required: true,       // Explicit consent needed
  right_to_deletion: true,      // GDPR compliance
  data_portability: true        // Support data export
}
```

## Security Features

1. **Multi-Layer Validation**: Client status → Middleware → Grants → Rate limits
2. **Real-Time Monitoring**: Anomaly detection and automatic revocation
3. **Audit Trail**: Complete access history with data lineage
4. **Compliance Frameworks**: Built-in GDPR, CCPA, HIPAA support
5. **Zero Trust**: Every access request validated, no implicit trust

## Best Practices

1. **Principle of Least Privilege**: Grant minimum necessary access
2. **Time-Bound Grants**: Use expiration dates and valid time windows
3. **Progressive Trust**: Start with low limits, increase based on behavior
4. **Scenario-Specific**: Create targeted grants for specific use cases
5. **Regular Review**: Set review dates and monitor trust scores
6. **Clear Purpose**: Always specify why a grant exists
7. **Compliance First**: Consider regulatory requirements upfront

## Future Enhancements

- Machine learning for anomaly detection
- Blockchain audit trail
- Federated grant sharing
- Dynamic risk scoring
- Automated compliance reporting
- Cross-platform grant portability

---

The Grant Authority system provides enterprise-grade control over human context access while maintaining usability and flexibility for legitimate use cases.