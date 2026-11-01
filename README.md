# 📖 Memoria - Digital Photo Flipbook

**Simpan cerita kecil, kenang selamanya**

Memoria adalah aplikasi album foto digital yang hangat dan personal, dirancang untuk mengabadikan momen berharga dalam bentuk flipbook interaktif. Buat, edit, dan bagikan kenangan Anda dengan gaya yang unik dan personal.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Vue](https://img.shields.io/badge/Vue-3.5.13-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7.2-blue)

---

## ✨ Fitur Utama

- 📸 **Multiple Page Layouts** - Berbagai pilihan tata letak halaman:
  - Single photo dengan caption
  - Full bleed photo
  - Split layout (vertical/horizontal)
  - Polaroid style dengan efek tilt
  - Artistic collage (3 photos)
  - Grid layout (4 photos)
  - Story layout dengan journal text

- 🎨 **Photo Customization** - Personalisasi setiap foto:
  - Filter vintage, warm, cool, sepia, grayscale
  - Caption dan date tracking
  - Photo rotation untuk efek organik
  - Multiple photo handling

- 📚 **Book Customization** - Desain cover yang elegan:
  - 8 pilihan warna cover (burgundy, navy, forest, charcoal, terracotta, sand, sage, midnight)
  - 4 jenis tekstur (linen, leather, smooth, vintage)
  - Custom cover image
  - Metadata lengkap (title, subtitle, author)

- 💾 **Cloud Storage** - Integrasi Supabase:
  - Sinkronisasi real-time
  - Backup cloud
  - Multi-device access

- 📖 **Interactive Flipbook** - Pengalaman membaca yang immersive:
  - Page flip animation
  - Smooth navigation
  - Responsive design

- 🎵 **Sound Effects** - Pengalaman audio yang menyenangkan
- 🎉 **Celebratory Effects** - Efek visual yang menyenangkan

---

## 🛠️ Tech Stack

### Frontend

- **Framework**: Vue.js 3.5.13
- **Language**: TypeScript 5.7.2
- **Build Tool**: Vite 6.2.0
- **State Management**: Pinia 2.3.1
- **Routing**: Vue Router 4.5.0
- **Styling**: Tailwind CSS 4.0.9

### Libraries

- **@supabase/supabase-js** ^2.49.1 - Backend & Database
- **page-flip** ^2.0.7 - Flipbook animation
- **canvas-confetti** ^1.9.4 - Celebration effects
- **lucide-vue-next** ^0.475.0 - Icon library

### Development Tools

- **vue-tsc** - TypeScript type checking
- **vite-plugin-vue-inspector** - Vue component inspector
- **@tailwindcss/vite** - Tailwind CSS integration

---

## 📋 Prerequisites

Pastikan Anda telah menginstal:

- **Node.js** v18 atau lebih tinggi
- **npm** v9 atau lebih tinggi (atau yarn/pnpm)
- **Git** untuk version control

---

## 🚀 Installation

### 1. Clone Repository

```bash
git clone <repository-url>
cd Project
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Buat file `.env` di root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://wiqzvucwaqzetweqveqq.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-anon-key>
LAUNCH_EDITOR=code
```

---

## 🎯 Running the Project

### Development Mode

```bash
npm run dev
```

### Build untuk Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

---

## 📁 Project Structure

```
Project/
├── src/
│   ├── components/          # Vue components
│   │   ├── BookCoverModal.vue
│   │   ├── FlipbookViewer.vue
│   │   ├── MemoryFormModal.vue
│   │   ├── PhotoEditModal.vue
│   │   ├── Navbar.vue
│   │   ├── SinglePageEditor.vue
│   │   ├── PageSpreadEditor.vue
│   │   └── ...
│   ├── views/               # Page-level components
│   │   ├── EditorView.vue   # Album editor
│   │   └── ReaderView.vue   # Album viewer
│   ├── stores/              # Pinia state management
│   │   ├── albumStore.ts    # Album state
│   │   └── configStore.ts   # App config
│   ├── router/
│   │   └── index.ts         # Route definitions
│   ├── utils/               # Utility functions
│   │   ├── supabase.ts      # Supabase client
│   │   ├── albumService.ts  # Album business logic
│   │   ├── storage.ts       # Local storage
│   │   ├── compression.ts   # Image compression
│   │   ├── audio.ts         # Sound effects
│   │   └── story.ts         # Story utilities
│   ├── types/
│   │   └── index.ts         # TypeScript types
│   ├── data/
│   │   ├── coverColors.ts   # Cover definitions
│   │   └── sampleAlbum.ts   # Sample data
│   ├── App.vue              # Root component
│   ├── main.ts              # Entry point
│   ├── style.css            # Global styles
│   └── vite-env.d.ts        # Vite types
├── public/                  # Static assets
├── dist/                    # Build output
├── index.html               # HTML template
├── package.json
├── tsconfig.json
├── vite.config.ts
└── .env
```

---

## 📚 Key Features Explained

### 1. Album Management (albumStore)

Pinia store yang mengelola state album:

- CRUD operations untuk albums
- Pagination dan filtering
- Favorites management

### 2. Editor View (EditorView.vue)

Interface untuk membuat dan mengedit album:

- Add/edit pages dengan berbagai layout
- Upload dan manage photos
- Customize cover design
- Preview flipbook

### 3. Reader View (ReaderView.vue)

Interface untuk membaca album:

- Interactive page flip
- Navigation controls
- Fullscreen mode
- Share options

### 4. Supabase Integration

Cloud backend untuk:

- Store albums & metadata
- Store images di storage bucket
- Real-time sync
- Ready untuk authentication

### 5. Photo Filters & Effects

6 filter tersedia:

- `normal` - Original
- `vintage` - Retro effect
- `warm` - Warm tone
- `cool` - Cool tone
- `sepia` - Brown tone
- `grayscale` - B&W

### 6. Page Layouts

**single** | **single-full** | **split-v** | **split-h** | **polaroid** | **collage-3** | **grid-4** | **story**

---

## 🔐 Security Notes

- Jangan expose private keys ke version control
- `.env` file sudah di `.gitignore`
- Supabase anon key hanya untuk public access
- Implement Row Level Security (RLS) di Supabase

---

## 🎨 Styling

Project menggunakan **Tailwind CSS v4** dengan custom color scheme:

- Primary: `#584653` (mauve brown)
- Background: `#FFFDF8` (warm white/ivory)
- Accent: Pink/rose tones

---

## 📱 Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## 🐛 Troubleshooting

### Port sudah digunakan

```bash
npm run dev -- --port 3000
```

### Dependency issues

```bash
rm -r node_modules package-lock.json
npm install
```

### Supabase connection failed

- Verifikasi URL dan keys di `.env`
- Check Supabase project settings
- Pastikan internet connection
- Check browser console

### Build errors

```bash
rm -r dist node_modules/.vite
npm run build
```

---

## 📝 Environment Variables

| Variable                               | Description                       | Required |
| -------------------------------------- | --------------------------------- | -------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | Supabase project URL              | ✅       |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase anon key                 | ✅       |
| `LAUNCH_EDITOR`                        | Default editor (code for VS Code) | ❌       |

---

## 🚀 Deployment

### Deploy ke Vercel

```bash
npm install -g vercel
vercel
```

### Deploy ke Netlify

```bash
npm run build
# Upload 'dist' folder ke Netlify
```

### Deploy ke GitHub Pages

1. Update `vite.config.ts` dengan `base` path
2. Build: `npm run build`
3. Push ke `gh-pages` branch

---

## 🤝 Contributing

Kontribusi sangat diterima!

1. Fork repository
2. Buat feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push ke branch: `git push origin feature/amazing-feature`
5. Open Pull Request

---

## 📄 License

MIT License - lihat [LICENSE](LICENSE) untuk detail.

---

## 👨‍💻 Author

Dibuat dengan ❤️ untuk melestarikan memori berharga.

---

## 📞 Support

Jika ada masalah atau saran:

- Buka issue di GitHub
- Baca dokumentasi Vite: https://vitejs.dev
- Baca dokumentasi Vue 3: https://vuejs.org
- Baca dokumentasi Supabase: https://supabase.com/docs

---

## 🙏 Acknowledgments

- **Vue.js** - Progressive JavaScript framework
- **Vite** - Next generation build tool
- **Tailwind CSS** - Utility-first CSS framework
- **Supabase** - Open source Firebase alternative
- **Page Flip Library** - Smooth page flip animations

---

**Happy memories with Memoria!✨**
