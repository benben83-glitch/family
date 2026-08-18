/** storage_path pointe vers le bucket privé "sticker-albums". */
export type AlbumImage = { storage_path: string; alt?: string };

export type StickerAlbum = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  background_image: AlbumImage | null;
  slot_count: number;
};

export type StickerSlot = {
  id: string;
  album_id: string;
  slot_number: number;
  label: string | null;
  image: AlbumImage | null;
};
