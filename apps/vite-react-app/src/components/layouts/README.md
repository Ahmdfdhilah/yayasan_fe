# Layout Components

Dokumentasi untuk komponen layout yang menggunakan sistem tema konsisten.

## Struktur Layout

### DefaultLayout
Layout default untuk halaman publik dengan:
- **Navbar**: Responsive dengan navigasi desktop/mobile
- **Main Content**: Area konten utama
- **Footer**: Footer multi-kolom dengan informasi perusahaan

### AdminLayout  
Layout admin dengan sidebar untuk dashboard:
- **Sidebar**: Fixed sidebar dengan navigasi admin
- **Header**: Search bar, notifikasi, dan user profile
- **Main Content**: Area konten admin
- **Footer**: Footer sederhana untuk admin

## Sistem Warna Tema

Kedua layout menggunakan CSS custom properties yang sudah didefinisikan dalam sistem tema:

### Primary Colors
```css
--primary: hsl(138.86 56.45% 24.31%)        /* Hijau utama */
--primary-foreground: hsl(0 0% 100%)        /* Putih untuk teks di primary */
```

### Secondary Colors  
```css
--secondary: hsl(80.62 50% 87.45%)          /* Hijau muda */
--secondary-foreground: hsl(220.91 39.29% 10.98%) /* Gelap untuk teks */
```

### Accent Colors
```css
--accent: hsl(78, 59%, 88%)                 /* Accent hijau terang */
--accent-foreground: hsl(220.91 39.29% 10.98%) /* Gelap untuk teks */
```

### Background & Surface
```css
--background: hsl(0 0% 100%)                /* Background utama */
--foreground: hsl(220.91 39.29% 10.98%)    /* Teks utama */
--card: hsl(0 0% 100%)                      /* Background card */
--card-foreground: hsl(220.91 39.29% 10.98%) /* Teks card */
--muted: hsl(220 8.94% 46.08%)              /* Background muted */
--muted-foreground: hsl(217.89 10.61% 64.90%) /* Teks muted */
```

### Sidebar Colors (AdminLayout)
```css
--sidebar-background: hsl(0 0% 100%)        /* Background sidebar */
--sidebar-foreground: hsl(220.91 39.29% 10.98%) /* Teks sidebar */
--sidebar-primary: hsl(138.86 56.45% 24.31%) /* Primary sidebar */
--sidebar-accent: hsl(121.59 44.66% 49.61%) /* Accent sidebar */
--sidebar-border: hsl(216.00 12.20% 83.92%) /* Border sidebar */
```

### Borders & Inputs
```css
--border: hsl(216.00 12.20% 83.92%)         /* Border default */
--input: hsl(220.00 14.29% 95.88%)          /* Background input */
--ring: hsl(121.59 44.66% 49.61%)           /* Focus ring */
```

## Dark Mode Support

Sistem tema mendukung dark mode dengan variabel yang sama:

```css
.dark {
  --background: hsl(222.22 47.37% 11.18%)   /* Background gelap */
  --foreground: hsl(0 0% 100%)              /* Teks putih */
  --card: hsl(220.65 40.26% 15.10%)         /* Card gelap */
  /* ... variabel lainnya */
}
```

## Cara Mengganti Tema

### 1. Edit CSS Variables
Ubah nilai di `packages/tailwind/globals.css`:

```css
:root {
  --primary: hsl(220 100% 50%);  /* Ganti ke biru */
  --secondary: hsl(280 100% 70%); /* Ganti ke ungu */
  /* ... */
}
```

### 2. Menggunakan Tailwind Classes
```tsx
// Menggunakan primary color
<div className="bg-primary text-primary-foreground">
  Primary Button
</div>

// Menggunakan secondary color  
<div className="bg-secondary text-secondary-foreground">
  Secondary Button
</div>

// Menggunakan accent color
<div className="bg-accent text-accent-foreground">
  Accent Element
</div>
```

### 3. Custom Components
```tsx
// Component yang mengikuti tema
function CustomCard({ children }) {
  return (
    <div className="bg-card text-card-foreground border border-border rounded-lg p-4">
      {children}
    </div>
  );
}
```

## Responsive Design

Layout menggunakan breakpoint Tailwind:
- `sm`: 640px+
- `md`: 768px+ 
- `lg`: 1024px+
- `xl`: 1280px+

### Mobile-First Approach
```tsx
// Desktop sidebar, mobile sheet
<div className="hidden md:fixed md:flex">Desktop Sidebar</div>
<Sheet>Mobile Sidebar</Sheet>

// Responsive navigation
<nav className="hidden md:flex">Desktop Nav</nav>
<Button className="md:hidden">Mobile Menu</Button>
```

## Usage Examples

### DefaultLayout
```tsx
import { DefaultLayout } from './components/layouts';

function HomePage() {
  return (
    <DefaultLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold">Welcome</h1>
      </div>
    </DefaultLayout>
  );
}
```

### AdminLayout
```tsx
import { AdminLayout } from './components/layouts';

function AdminDashboard() {
  return (
    <AdminLayout>
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>
    </AdminLayout>
  );
}
```

## Customization Tips

1. **Consistent Spacing**: Gunakan sistem spacing Tailwind (4, 6, 8, 12, 16, dll)
2. **Color Harmony**: Pastikan contrast ratio yang baik antara background dan foreground
3. **Component Reuse**: Buat komponen kecil yang reusable dengan tema variables
4. **Testing**: Test di light dan dark mode untuk memastikan readability
5. **Accessibility**: Gunakan semantic HTML dan ARIA labels yang tepat