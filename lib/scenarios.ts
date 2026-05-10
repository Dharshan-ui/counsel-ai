export type Scenario = {
  id: string
  title: string
  setup: string
  persona: string
  personaLabel: string
  difficulty: 1 | 2 | 3
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'salary-counter',
    title: 'The salary counter',
    setup:
      'You received a competing offer 30% above your current salary. Your manager seems reluctant to match it and keeps deflecting with "budget constraints."',
    persona: 'Skeptical CFO',
    personaLabel: 'CFO Maya — numbers-driven, budget-constrained, skeptical of outside offers',
    difficulty: 2,
  },
  {
    id: 'lease-renewal',
    title: 'Lease renewal pushback',
    setup:
      "Your landlord wants to raise rent 18% at renewal. You've been a reliable tenant for 3 years and funded minor improvements yourself.",
    persona: 'Hardline landlord',
    personaLabel: 'David — knows market rates, business-first, uses take-it-or-leave-it framing',
    difficulty: 2,
  },
  {
    id: 'promotion-ask',
    title: 'Asking for a promotion',
    setup:
      "You've been at your level for 2.5 years, led two successful projects, and a peer with less tenure was recently promoted. You want a title and compensation change.",
    persona: 'Non-committal manager',
    personaLabel: 'James — conflict-averse, always needs to check with HR, defers every decision',
    difficulty: 3,
  },
  {
    id: 'decline-extra-work',
    title: 'Declining extra work',
    setup:
      'A friendly colleague keeps assigning you projects outside your scope. You like them but your plate is full and the pattern is becoming a problem.',
    persona: 'Friendly-but-pushy peer',
    personaLabel: 'Priya — warm but persistent, makes guilt feel like helpfulness',
    difficulty: 1,
  },
  {
    id: 'vendor-negotiation',
    title: 'Vendor negotiation',
    setup:
      'A software vendor quoted $48k/year. You have a competing quote for $34k and a budget cap of $38k. The vendor has been inflexible so far.',
    persona: 'Rigid sales rep',
    personaLabel: 'Connor — quota-driven, uses FOMO tactics, reluctant to deviate from standard pricing',
    difficulty: 2,
  },
  {
    id: 'relationship-boundary',
    title: 'Relationship boundary',
    setup:
      'Your partner dismisses your concerns about finances as "overthinking." You need a direct conversation about shared spending without it escalating.',
    persona: 'Defensive partner',
    personaLabel: 'Alex — feels attacked when finances are raised, deflects with humor or past grievances',
    difficulty: 3,
  },
]
