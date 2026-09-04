export interface LegalDocSummary {
  id: string;
  slug: string;
  title: string;
  lastUpdated: string;
  characters: number;
}

export interface LegalDoc {
  id: string;
  slug: string;
  title: string;
  content: string;
  lastUpdated: string;
}
