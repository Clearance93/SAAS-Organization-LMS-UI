export interface SchoolProfile {
    id: string;
    name: string;
    logoUrl?: string | null;
    motto?: string;
    type: 'Primary' | 'Secondary' | 'Combined' | 'Organization';
    timeZone: string;
    locale: string;
    themeColor?: string;
    contactEmail?: string;
    contactPhone?: string;
}
