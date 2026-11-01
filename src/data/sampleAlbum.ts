import type { Album } from "@/types";

export const SAMPLE_ALBUM: Album = {
  id: "album-bali-memories",
  title: "Album Kenangan",
  subtitle: "Kumpulan Memori ku",
  author: "Punya siapa ?",
  coverColor: "burgundy",
  coverTexture: "linen",
  createdAt: "2024-07-15T10:00:00Z",
  updatedAt: "2024-07-20T18:30:00Z",
  isFavorite: true,
  pages: [
    // Page 1 (Front intro - Story layout)
    {
      id: "p-1",
      pageNumber: 1,
      layout: "story",
      title: "Awal Perjalanan",
      journalText:
        "Menyusuri jalanan Ubud yang berkabut tipis di pagi hari. Bau dupa dan harum bunga canang sari menyambut kami dengan kehangatan yang tak terlupakan.",
      backgroundColor: "#FAF8F5",
      photos: [
        {
          id: "ph-1",
          url: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80",
          caption: "Gerbang Pura Lempuyang, Karangasem",
          date: "10 Juli 2024",
          filter: "warm",
        },
      ],
    },
    // Page 2 (Polaroid style)
    {
      id: "p-2",
      pageNumber: 2,
      layout: "polaroid",
      title: "Momen Sederhana",
      backgroundColor: "#FAF8F5",
      photos: [
        {
          id: "ph-2",
          url: "https://images.unsplash.com/photo-1555400038-63f5ba517a47?auto=format&fit=crop&w=800&q=80",
          caption: "Kopi luwak di terasiring Tegallalang",
          date: "11 Juli 2024",
          filter: "vintage",
          rotation: -2,
        },
      ],
    },
    // Page 3 (Split Vertical)
    // Page 4 (Hero Single Full)
    // Page 5 (Artistic Collage 3 photos)
    // Page 6 (Grid 4)
  ],
};
