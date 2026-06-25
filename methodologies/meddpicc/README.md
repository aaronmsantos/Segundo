# MEDDPICC Methodology

## What Is MEDDPICC?

MEDDPICC is an 8-factor deal qualification framework used in enterprise B2B sales. Each letter represents a dimension of deal health that must be understood before you can forecast with confidence.

The framework forces you to answer: **Do I actually know what's happening in this deal, or am I guessing?**

Most deals die not from a single catastrophic failure but from accumulated blind spots. MEDDPICC makes those blind spots visible before they kill the deal.

## The 8 Factors

### M -- Metrics
**Question: Is the business impact quantified?**

You need hard numbers: dollar savings, hours recovered, risk reduced, revenue unlocked. If the prospect hasn't confirmed specific figures, you're building on sand. "It's costing us a lot" is not a metric. "$240K/year in manual reconciliation" is.

### E -- Economic Buyer
**Question: Is the person who signs the check identified and engaged?**

The Economic Buyer (EB) is whoever can say yes to a purchase of this size without asking someone else. Identifying them isn't enough -- they need to know you exist and have engaged with your team directly. A deal where the EB has never heard your name is a deal that dies in procurement.
### D -- Decision Criteria
**Question: Do we know what they're evaluating on?**

What does the solution need to do for them to say yes? This isn't your feature list -- it's their evaluation rubric. If you're demoing without knowing what they care about, you're performing, not selling.

### D -- Decision Process
**Question: Do we know the steps from yes to signed contract?**

Who needs to approve? In what order? What reviews are required? A champion who says "it should be straightforward" is a champion who hasn't done this before. Map every step with names and dates.

### P -- Paper Process
**Question: Do we know procurement, legal, security, and timeline?**

This is where deals go to die quietly. A 90-day procurement cycle discovered in week 11 of a 12-week deal is a disaster. Ask early: What happens after your team says go? Who in procurement handles vendor onboarding? Is there a security review?

### I -- Identified Pain
**Question: Is the pain real, quantified, and personally felt by the champion?**

Pain must be three things: real (not assumed by you), quantified (tied to numbers), and personal (the champion feels it, not just the organization). "We have compliance gaps" is weak. "I'm personally responsible for a $2M audit exposure and my board is asking about it quarterly" is strong.

### C -- Champion
**Question: Do we have someone with motive, influence, access to the EB, and actively selling for us?**

A champion must pass all four tests:
1. **Motive** -- They personally benefit from solving this problem
2. **Influence** -- People in the org listen to them
3. **EB Access** -- They can get you in front of the budget holder
4. **Active selling** -- They're advocating for you internally, not just taking your calls

Someone who responds to emails but won't introduce you to the EB is a contact, not a champion.
### C -- Competition
**Question: Do we know who else is being evaluated and our position?**

This includes other vendors, internal builds, and the most dangerous competitor of all: doing nothing. If you haven't asked "Are you evaluating other solutions?" you don't know. Silence doesn't mean you're the only option.

## Scoring

Each factor is scored on a 3-tier scale:

| Score | Points | Meaning |
|-------|--------|---------|
| Green | 10 | Confirmed with evidence from calls, emails, or documents |
| Yellow | 5 | Partially known -- some signal but gaps remain |
| Red | 0 | Unknown, at risk, or no evidence |

**Maximum score: 80** (8 factors x 10 points)

### Forecast Categories

| Category | Score Range | Meaning |
|----------|------------|---------|
| Commit | 70-80 | High confidence. Most factors confirmed. Forecast this deal. |
| Best Case | 50-69 | Solid shape but gaps remain. Could close but needs work. |
| Pipeline | 30-49 | Early or partially qualified. Do not forecast. |
| At Risk | 0-29 | Major gaps. This deal needs rescue or disqualification. |

## Gap Moves

When a factor scores yellow or red, Segundo recommends specific **gap moves** -- actions designed to close that exact gap. Each gap move includes:

- **Diagnosis**: Why the factor is at this score
- **Moves**: 2-3 specific actions to improve it
- **Anti-patterns**: Common mistakes to avoid

Gap moves are defined in `gap-moves.json` alongside the methodology definition. You can customize them for your sales motion.

## When to Use MEDDPICC

**Use MEDDPICC when:**
- Deal ACV is above your quick-close threshold (typically $25K+)
- Sales cycle is longer than 30 days
- Multiple stakeholders are involved in the decision
- Procurement, legal, or security reviews are likely
- You're displacing an incumbent or competing against other vendors

**Use MEDDIC instead when:**
- You don't need to track Paper Process separately (simpler procurement)
- Competition is not a significant factor in your market

**Use BANT instead when:**
- High-velocity, low-ACV sales (under $10K)
- Short sales cycles (under 2 weeks)
- Single decision maker, no procurement
- You need quick qualification to prioritize volume

## File Structure

```
methodologies/meddpicc/
  methodology.json    -- Factor definitions, scoring, thresholds
  gap-moves.json      -- Recommended actions for yellow/red scores
  README.md           -- This file
```

## Customization

You can customize MEDDPICC for your organization:

1. **Adjust weights**: Set `weight: 2` on factors that matter most to your sales motion
2. **Modify thresholds**: Change the score ranges for Commit/Best Case/Pipeline/At Risk
3. **Edit level descriptions**: Make green/yellow/red definitions specific to your product and buyers
4. **Add gap moves**: Write moves that reference your specific assets, proof points, and processes

See `docs/methodology.md` for the full customization guide.