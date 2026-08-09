import {
  Apple,
  Baby,
  Brain,
  Compass,
  Flower2,
  HeartPulse,
  HelpCircle,
  Leaf,
  Moon,
  ShieldCheck,
  Sparkles,
  Waves,
  type LucideIcon,
} from 'lucide-react'

/**
 * Single source of truth for the Knowledge Hub's topic cards. Every topic
 * now resolves to something real: five (Lifestyle, Nutrition, Sleep,
 * Mental Wellness, Preventive Care) link to their matching built product;
 * five more (Hormones, Cycle Health, PCOS, Fertility, Pregnancy) retarget
 * to their matching built product the same way (Stage 4C1); FAQs points
 * directly at the real Help Center instead of a placeholder; and Women's
 * Health — the one topic broad enough that no single product is a natural
 * fit — gets its own real, static educational article page instead of a
 * retarget or a placeholder.
 */
export interface KnowledgeHubTopic {
  key: string
  title: string
  description: string
  href: string
  icon: LucideIcon
}

export const KNOWLEDGE_HUB_TOPICS: KnowledgeHubTopic[] = [
  {
    key: 'womens-health',
    title: "Women's Health",
    description: 'A general, educational overview of women’s health topics.',
    href: '/womens-health',
    icon: Flower2,
  },
  {
    key: 'hormones',
    title: 'Hormones',
    description: 'Understanding hormones and their role in wellbeing.',
    href: '/hormone-balance',
    icon: Waves,
  },
  {
    key: 'cycle-health',
    title: 'Cycle Health',
    description: 'Educational content about the menstrual cycle.',
    href: '/cycle-tracker',
    icon: HeartPulse,
  },
  {
    key: 'pcos',
    title: 'PCOS',
    description: 'General information about PCOS/PCOD wellness.',
    href: '/wellness-tracker',
    icon: Leaf,
  },
  {
    key: 'fertility',
    title: 'Fertility',
    description: 'Educational content about fertility wellness.',
    href: '/fertility-journey',
    icon: Sparkles,
  },
  {
    key: 'pregnancy',
    title: 'Pregnancy',
    description: 'General pregnancy wellness education.',
    href: '/baby-growth',
    icon: Baby,
  },
  {
    key: 'nutrition',
    title: 'Nutrition',
    description: 'Everyday nutrition education and awareness.',
    href: '/nutrition-companion',
    icon: Apple,
  },
  {
    key: 'sleep',
    title: 'Sleep',
    description: 'How rest and sleep relate to overall wellness.',
    href: '/sleep-intelligence',
    icon: Moon,
  },
  {
    key: 'mental-wellness',
    title: 'Mental Wellness',
    description: 'Gentle, educational mental wellness content.',
    href: '/stress-recovery',
    icon: Brain,
  },
  {
    key: 'lifestyle',
    title: 'Lifestyle',
    description: 'How everyday lifestyle habits may relate to wellness.',
    href: '/lifestyle-intelligence',
    icon: Compass,
  },
  {
    key: 'preventive-care',
    title: 'Preventive Care',
    description: 'General education about preventive health habits.',
    href: '/preventive-screening-planner',
    icon: ShieldCheck,
  },
  {
    key: 'faqs',
    title: 'FAQs',
    description: 'Answers to frequently asked questions.',
    href: '/help-center',
    icon: HelpCircle,
  },
]
