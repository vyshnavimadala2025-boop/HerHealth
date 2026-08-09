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
 * Single source of truth for the Knowledge Hub's topic cards. Several
 * topics (Lifestyle, Nutrition, Sleep, Mental Wellness, Preventive Care)
 * now point at their real, built product pages rather than educational
 * articles of their own — no dedicated Knowledge Hub content exists yet
 * for any topic, so each of those five links to the closest real,
 * working feature instead. The remaining topics still point at the
 * shared coming-soon placeholder until real content is written.
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
    href: '/coming-soon/womens-knowledge-hub',
    icon: Flower2,
  },
  {
    key: 'hormones',
    title: 'Hormones',
    description: 'Understanding hormones and their role in wellbeing.',
    href: '/coming-soon/womens-knowledge-hub',
    icon: Waves,
  },
  {
    key: 'cycle-health',
    title: 'Cycle Health',
    description: 'Educational content about the menstrual cycle.',
    href: '/coming-soon/womens-knowledge-hub',
    icon: HeartPulse,
  },
  {
    key: 'pcos',
    title: 'PCOS',
    description: 'General information about PCOS/PCOD wellness.',
    href: '/coming-soon/womens-knowledge-hub',
    icon: Leaf,
  },
  {
    key: 'fertility',
    title: 'Fertility',
    description: 'Educational content about fertility wellness.',
    href: '/coming-soon/womens-knowledge-hub',
    icon: Sparkles,
  },
  {
    key: 'pregnancy',
    title: 'Pregnancy',
    description: 'General pregnancy wellness education.',
    href: '/coming-soon/womens-knowledge-hub',
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
    href: '/coming-soon/help-center',
    icon: HelpCircle,
  },
]
