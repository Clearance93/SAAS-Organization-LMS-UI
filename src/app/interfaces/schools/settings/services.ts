export interface Services {
    id: string;
    name: string;
    type: string;
    description?: string;
    enabled: boolean;
    price?: number | null;
}
