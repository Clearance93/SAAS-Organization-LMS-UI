import { LibraryItemModel } from './library-item-model';

describe('LibraryItemModel', () => {
  const model = new LibraryItemModel('li1', 'Math Book', 'PDF', 'Mathematics', 'Students');

  it('should create an instance', () => expect(model).toBeTruthy());
  it('should have correct title', () => expect(model.title).toBe('Math Book'));
  it('icon should return pdf icon for PDF type', () => expect(model.icon).toBe('picture_as_pdf'));
  it('toJson should return correct shape', () => expect(model.toJson().type).toBe('PDF'));
  it('fromJson should create instance', () => {
    const m = LibraryItemModel.fromJson({ id: 'li2', title: 'Video', type: 'VIDEO', category: 'Science', access: 'Teacher' });
    expect(m).toBeInstanceOf(LibraryItemModel);
    expect(m.icon).toBe('play_circle');
  });
});
