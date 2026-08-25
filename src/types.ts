export interface SourceAttribution {
  title: string;
  uri: string;
  type?: 'maps' | 'website' | 'registry' | 'news';
}

export interface ScoreBreakdown {
  marketPresence: number;
  commercialMaturity: number;
  operationalScale: number;
  contactQuality: number;
}

export interface ProcurementProfile {
  decisionMakers: string[];
  salesCycleEstimate: string;
  budgetScale: string;
}

export interface ComplianceMemo {
  lawfulBasis: string;
  dataAudited: string;
  privacyNotice: string;
}

export interface OutreachSequence {
  formalEmail: {
    subject: string;
    body: string;
  };
  whatsAppIntro: string;
  discoveryCallHook: string;
}

export interface DeepQualification {
  icpScore: number;
  scoreBreakdown: ScoreBreakdown;
  qualificationSummary: string;
  keyPainPoints: string[];
  b2bOpportunityAngles: string[];
  procurementProfile: ProcurementProfile;
  complianceMemo: ComplianceMemo;
  outreachSequence: OutreachSequence;
  analyzedAt: string;
}

export interface FastActionCache {
  quickPitch?: string;
  smsSnippet?: string;
  complianceBadge?: string;
  icebreakers?: string[];
}

export type LeadStatus = 'discovered' | 'verified' | 'qualified' | 'contacted' | 'in_discovery' | 'won' | 'archived';

export interface Lead {
  id: string;
  name: string;
  category: string;
  subSector: string;
  location: string;
  locationDetail: string;
  summary: string;
  estimatedSize?: string;
  rating?: number | null;
  reviewCount?: number | null;
  mapsUri?: string | null;
  
  // Public domain contact details
  officialWebsite?: string | null;
  publicEmail?: string | null;
  publicPhone?: string | null;
  officeAddress?: string | null;
  coordinates?: { lat: number; lng: number };
  foundedYear?: string | null;
  coreOfferings?: string[];
  decisionMakerTitle?: string;
  dataProtectionStatus?: string;
  
  // Attribution & verification
  sources: SourceAttribution[];
  confidenceScore?: number;
  isVerified: boolean;
  
  // Deep reasoning intelligence
  deepQualification?: DeepQualification;
  fastActions?: FastActionCache;
  
  // Pipeline management
  status: LeadStatus;
  savedAt: string;
  notes?: string;
}

export interface DiscoverySegment {
  category: string;
  location: string;
  additionalKeywords: string;
  minConfidence: number;
  strictPublicOnly: boolean;
}

export interface PresetSegment {
  id: string;
  title: string;
  category: string;
  location: string;
  description: string;
  highlightTag: string;
}
