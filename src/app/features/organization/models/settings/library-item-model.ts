import { LibraryItem } from "../../../../interfaces/schools/settings/library-item";

export class LibraryItemModel implements LibraryItem{
     constructor(
    public id: string,
    public title: string,
    public type: 'PDF' | 'EPUB' | 'VIDEO' | 'LINK' | 'AUDIO',
    public category: string,
    public access: 'Students' | 'Teacher' | 'Admins' | 'Custom',
    public fileUrl?: string | null,
    public uploaderId?: string | null,
    public assignedCourseIds?: string[],
    public createdAt?: string
  ) {}

  static fromJson(json: any): LibraryItemModel {
    return new LibraryItemModel(
      json.id,
      json.title,
      json.type,
      json.category,
      json.access,
      json.fileUrl,
      json.uploaderId,
      json.assignedCourseIds,
      json.createdAt
    );
  }

  toJson(): any {
    return {
      id: this.id,
      title: this.title,
      type: this.type,
      category: this.category,
      access: this.access,
      fileUrl: this.fileUrl,
      uploaderId: this.uploaderId,
      assignedCourseIds: this.assignedCourseIds,
      createdAt: this.createdAt
    };
  }

  get icon(): string {
    const icons: Record<string, string> = {
      PDF: 'picture_as_pdf',
      EPUB: 'menu_book',
      VIDEO: 'play_circle',
      LINK: 'link',
      AUDIO: 'audiotrack'
    };
    return icons[this.type] || 'insert_drive_file';
  }
}
