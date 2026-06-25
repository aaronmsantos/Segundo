# Configuration Reference

Segundo uses YAML files in the `config/` directory. All configuration is human-readable and version-controllable.

## company.yaml

The primary configuration file. Defines your company, sales process, and methodology.

### Company Section

```yaml
company:
  name: "Your Company"         # Required. Used in skill templates.
  product: "Description"       # One-line product description.
  website: "https://..."       # Company website.
  icp:
    segments: [mid-market]     # smb, mid-market, enterprise
    verticals: [saas]          # Industry verticals you target
    geo: [na, emea]            # Geographic focus
    min_acv: 10000             # Minimum deal size to pursue
    max_acv: 500000            # Maximum typical deal size
  pricing_model: seat          # seat, usage_based, flat, hybrid
```

### Methodology Section

```yaml
methodology:
  framework: meddpicc          # meddpicc, meddic, bant, sandler, custom
  deal_stages:
    - name: "Prospecting"
      probability: 5
    - name: "Discovery"
      probability: 15
      gates: [pain, metrics]   # Methodology factors required before advancing
    - name: "Validating"
      probability: 35
      gates: [champion, economic_buyer]
    - name: "Negotiating"
      probability: 65
      gates: [paper_process, decision_criteria]
    - name: "Closing"
      probability: 90
      gates: [decision_process]
  forecasting:
    categories: [commit, best_case, pipeline, omit]
    require_eb_for_commit: true  # EB must be engaged for Commit forecast
```

### Connectors Section

```yaml
connectors:
  crm: { provider: salesforce, enabled: true }
  calls: { provider: gong, enabled: false }
  email: { provider: gmail, enabled: false }
  chat: { provider: slack, enabled: false }
```

### Team Section

```yaml
team:
  roles:
    - { role: ae, owns: [deal_memory, methodology_score, follow_ups] }
    - { role: sdr, owns: [outbound, qualification] }
    - { role: se, owns: [scoping, technical_validation] }
    - { role: manager, owns: [pipeline_review, forecast, coaching] }
```

### Competitors Section

```yaml
competitors:
  - { name: "Competitor A", battle_card: "competitive/competitor-a.md" }
  - { name: "Competitor B", battle_card: "competitive/competitor-b.md" }
```

## identity.yaml

Agent personality and user profile.

```yaml
agent:
  name: "Segundo"              # What to call the AI
  posture: direct              # direct, consultative, formal

user:
  name: "Your Name"
  role: "Account Executive"
  experience: mid              # junior, mid, senior, leader
  strengths: [discovery, negotiation]
  blind_spots: [multi-threading]
  voice:
    banned_words: [leverage, synergy]
    style: conversational
    language: en
```

## voice.yaml

Controls AI writing style for emails, DMs, and internal communication.

```yaml
email:
  style: conversational        # terse, conversational, formal
  max_paragraphs: 4
  sign_off: "Best,"
  banned_words: [leverage, unlock, deep dive, circle back, synergy]

dm:
  register: casual             # casual, formal
  sign_off: "All the best,"

internal:
  style: terse
  skip_preamble: true
```

## connectors.yaml

API credential references. Actual secrets go in `.env`, not here.

```yaml
salesforce:
  enabled: true
  instance_url_env: SF_INSTANCE_URL    # Name of env var, not the value
  auth_method: token
  username_env: SF_USERNAME
  password_env: SF_PASSWORD
  token_env: SF_TOKEN
  field_mappings:
    next_steps: Next_Steps__c          # Custom field for deal notes
    stage: StageName
    close_date: CloseDate
    amount: Amount
```

Each connector follows the same pattern: `enabled` flag + env var names for credentials + provider-specific mappings.
