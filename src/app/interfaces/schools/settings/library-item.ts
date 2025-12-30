export interface LibraryItem {
    id: string;
    title: string;
    type: 'PDF' | 'EPUB' | 'VIDEO' | 'LINK' | 'AUDIO';
    category: string;
    fileUrl?: string | null;
    uploaderId?: string | null;
    access: 'Students' | 'Teacher' | 'Admins' | 'Custom';
    assignedCourseIds?: string[];
    createdAt?: string;
}
