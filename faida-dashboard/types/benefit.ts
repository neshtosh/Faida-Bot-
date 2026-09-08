export interface BenefitEligibility {
  minAge: number;
  maxAge: number;
  gender: "any" | "female" | "male";
  employed: boolean | "any";
  businessOwner: boolean | "any";
  disability: boolean | "any";
  counties: string[];
  sectors: string[];
  groupRequired: boolean;
  safaricomRequired?: boolean;
  businessAgeMin?: number;
}

export interface Benefit {
  id: string;
  name: string;
  provider: string;
  category: "financial" | "health" | "employment" | "legal" | "housing";
  emoji: string;
  description: string;
  amount: string;
  howToApply: string;
  documents: string;
  deadline: string;
  deadlineDate?: string;
  deadlineAnnual?: boolean;
  link: string;
  eligibility: BenefitEligibility;
}

export const CATEGORIES: Benefit["category"][] = [
  "financial",
  "health",
  "employment",
  "legal",
  "housing",
];

export const CATEGORY_LABELS: Record<Benefit["category"], string> = {
  financial: "💰 Financial",
  health: "🏥 Health",
  employment: "💼 Employment",
  legal: "⚖️ Legal",
  housing: "🏠 Housing",
};

export const TRISTATE_LABELS: Record<string, string> = {
  any: "Any",
  true: "Yes",
  false: "No",
};
