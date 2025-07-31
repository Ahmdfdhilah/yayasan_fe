import { useEffect, useState } from 'react';
import { Skeleton } from "@workspace/ui/components/skeleton";
import { 
  HeroSection, 
  StatsSection, 
  AboutSection, 
  ArticlesSection, 
  SchoolsSection 
} from '../../components/Home';

interface GalleryImage {
  id: number;
  imageUrl: string;
  name: string;
  description: string;
}

interface Article {
  id: number;
  title: string;
  description: string;
  author?: string;
  date?: string;
  imageUrl?: string;
}

interface School {
  id: number;
  name: string;
  description: string;
  level?: string;
  location?: string;
  students?: number;
  rating?: number;
  imageUrl?: string;
}

const HomePage = () => {
  const [galleryItems, setGalleryItems] = useState<GalleryImage[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Mock data - replace with actual API calls
        const mockGallery: GalleryImage[] = [
          {
            id: 1,
            name: "Kegiatan Belajar Mengajar",
            description: "Suasana pembelajaran yang kondusif dengan metode pengajaran modern yang menggabungkan pendidikan agama dan umum secara terpadu.",
            imageUrl: "https://picsum.photos/1920/1080?random=1"
          },
          {
            id: 2,
            name: "Fasilitas Sekolah Modern",
            description: "Gedung dan fasilitas penunjang pendidikan yang lengkap dan modern untuk mendukung proses pembelajaran yang berkualitas.",
            imageUrl: "https://picsum.photos/1920/1080?random=2"
          },
          {
            id: 3,
            name: "Kegiatan Ekstrakurikuler",
            description: "Berbagai kegiatan pengembangan bakat dan minat siswa yang beragam untuk membentuk karakter dan potensi siswa secara maksimal.",
            imageUrl: "https://picsum.photos/1920/1080?random=3"
          },
          {
            id: 4,
            name: "Masjid dan Area Ibadah",
            description: "Tempat ibadah yang luas dan nyaman untuk menunjang kegiatan spiritual dan pembentukan karakter islami yang kuat.",
            imageUrl: "https://picsum.photos/1920/1080?random=4"
          },
          {
            id: 5,
            name: "Lapangan Olahraga",
            description: "Fasilitas olahraga yang lengkap untuk mendukung pengembangan fisik dan kesehatan siswa dengan berbagai cabang olahraga.",
            imageUrl: "https://picsum.photos/1920/1080?random=5"
          },
          {
            id: 6,
            name: "Perpustakaan",
            description: "Pusat sumber belajar dengan koleksi buku yang lengkap dan suasana yang kondusif untuk menumbuhkan minat baca siswa.",
            imageUrl: "https://picsum.photos/1920/1080?random=6"
          },
          {
            id: 7,
            name: "Laboratorium Komputer",
            description: "Laboratorium komputer dengan perangkat modern untuk mendukung pembelajaran teknologi informasi dan komunikasi.",
            imageUrl: "https://picsum.photos/1920/1080?random=7"
          },
          {
            id: 8,
            name: "Ruang Kelas",
            description: "Ruang kelas yang nyaman dan dilengkapi dengan fasilitas pembelajaran modern untuk mendukung proses belajar mengajar yang efektif.",
            imageUrl: "https://picsum.photos/1920/1080?random=8"
          },
          {
            id: 9,
            name: "Asrama Putra",
            description: "Fasilitas asrama yang nyaman dan aman untuk siswa putra dengan pembinaan karakter dan kemandirian yang terintegrasi.",
            imageUrl: "https://picsum.photos/1920/1080?random=9"
          },
          {
            id: 10,
            name: "Asrama Putri",
            description: "Fasilitas asrama yang nyaman dan aman untuk siswi putri dengan pengawasan dan pembinaan yang sesuai dengan nilai-nilai islami.",
            imageUrl: "https://picsum.photos/1920/1080?random=10"
          }
        ];

        const mockArticles: Article[] = [
          {
            id: 1,
            title: "Prestasi Siswa SMAIT dalam Kompetisi Sains Nasional",
            description: "Para siswa SMAIT Baitul Muslim meraih prestasi gemilang dalam kompetisi sains tingkat nasional dengan meraih juara 1 bidang Matematika dan Fisika.",
            author: "Tim Redaksi",
            date: "15 Januari 2024"
          },
          {
            id: 2,
            title: "Program Tahfidz Qur'an Mencapai Target 500 Hafidz",
            description: "Program tahfidz Al-Qur'an di Pondok Pesantren Baitul Muslim berhasil mencapai target dengan 500 santri yang telah menyelesaikan hafalan 30 juz.",
            author: "Ustadz Ahmad",
            date: "10 Januari 2024"
          },
          {
            id: 3,
            title: "Fasilitas Baru: Laboratorium Komputer dan Science Center",
            description: "Yayasan Baitul Muslim meresmikan fasilitas baru berupa laboratorium komputer modern dan science center untuk menunjang pembelajaran STEM.",
            author: "Humas Yayasan",
            date: "8 Januari 2024"
          },
          {
            id: 4,
            title: "Kerjasama dengan Universitas Terkemuka untuk Program Beasiswa",
            description: "Yayasan menjalin kerjasama dengan beberapa universitas terkemuka untuk memberikan beasiswa kepada lulusan terbaik.",
            author: "Kepala Yayasan",
            date: "5 Januari 2024"
          },
          {
            id: 5,
            title: "Kegiatan Bakti Sosial dalam Rangka Milad Yayasan ke-31",
            description: "Dalam rangka memperingati milad ke-31, Yayasan Baitul Muslim mengadakan berbagai kegiatan bakti sosial untuk masyarakat sekitar.",
            author: "Panitia Milad",
            date: "1 Januari 2024"
          }
        ];

        const mockSchools: School[] = [
          { 
            id: 1, 
            name: "TKIT Baitul Muslim", 
            description: "Taman Kanak-Kanak Islam Terpadu dengan pendekatan pembelajaran yang menyenangkan dan mengembangkan potensi anak secara optimal.",
            level: "TK",
            location: "Way Jepara",
            students: 150,
            rating: 4.8
          },
          { 
            id: 2, 
            name: "SDIT Baitul Muslim", 
            description: "Sekolah Dasar Islam Terpadu dengan kurikulum nasional dan nilai-nilai Islam yang kuat serta fasilitas pembelajaran modern.",
            level: "SD",
            location: "Way Jepara", 
            students: 480,
            rating: 4.9
          },
          { 
            id: 3, 
            name: "SMPIT Baitul Muslim", 
            description: "Sekolah Menengah Pertama Islam Terpadu dengan fasilitas modern dan program pengembangan karakter yang komprehensif.",
            level: "SMP",
            location: "Way Jepara",
            students: 360,
            rating: 4.7
          },
          { 
            id: 4, 
            name: "SMAIT Baitul Muslim", 
            description: "Sekolah Menengah Atas Islam Terpadu dengan program unggulan dan persiapan masuk perguruan tinggi terbaik.",
            level: "SMA",
            location: "Way Jepara",
            students: 280,
            rating: 4.9
          },
          { 
            id: 5, 
            name: "Pondok Pesantren Tahfidz", 
            description: "Pondok Pesantren dengan fokus pada hafalan Al-Qur'an dan pembentukan karakter islami yang kuat.",
            level: "Pesantren",
            location: "Way Jepara",
            students: 200,
            rating: 4.8
          }
        ];

        setGalleryItems(mockGallery);
        setArticles(mockArticles);
        setSchools(mockSchools);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Memuat halaman...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <HeroSection galleryItems={galleryItems} />
      <StatsSection />
      <AboutSection />
      <ArticlesSection articles={articles} loading={loading} />
      <SchoolsSection schools={schools} loading={loading} />
    </div>
  );
};

export default HomePage;