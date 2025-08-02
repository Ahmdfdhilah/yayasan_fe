import { useState, useEffect } from 'react';
import { Badge } from "@workspace/ui/components/badge";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@workspace/ui/components/carousel";
import { Users, Target, Eye, MapPin, Calendar } from 'lucide-react';
import { PartnerCard, ProgramCard } from '@/components/About';
import { RichTextDisplay } from '@/components/common/RichTextDisplay';
import { boardMemberService } from '@/services/board-members';
import { getBoardImageUrl } from '@/utils/imageUtils';
import type { BoardMember, BoardGroup } from '@/services/board-members/types';

const LeadershipSkeleton = () => (
  <div className="max-w-4xl mx-auto">
    {/* First row - Center position */}
    <div className="grid gap-8 mb-8">
      <div className="max-w-sm mx-auto w-full">
        <Card>
          <div className="relative overflow-hidden rounded-t-lg bg-muted h-80">
            <Skeleton className="w-full h-full" />
          </div>
          <CardContent className="p-6 text-center">
            <Skeleton className="h-6 w-32 mx-auto mb-2" />
            <Skeleton className="h-4 w-24 mx-auto mb-4" />
            <Skeleton className="h-16 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>

    {/* Second row - Two side positions */}
    <div className="grid md:grid-cols-2 gap-8">
      {Array.from({ length: 2 }).map((_, index) => (
        <Card key={index}>
          <div className="relative overflow-hidden rounded-t-lg bg-muted h-80">
            <Skeleton className="w-full h-full" />
          </div>
          <CardContent className="p-6 text-center">
            <Skeleton className="h-5 w-28 mx-auto mb-2" />
            <Skeleton className="h-4 w-20 mx-auto mb-4" />
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

// Mock data types
interface Partner {
  id: number;
  name: string;
  description: string;
  logo: string;
  website?: string;
}

interface Program {
  id: number;
  title: string;
  description: string;
  htmlContent: string;
  image: string;
  category: string;
}

// Mock data
const mockPartners: Partner[] = [
  {
    id: 1,
    name: "Kementerian Agama RI",
    description: "Kemitraan dalam pengembangan pendidikan Islam yang berkualitas",
    logo: "https://picsum.photos/200/200?random=kemenag",
    website: "https://kemenag.go.id"
  },
  {
    id: 2,
    name: "Yayasan Darussalam",
    description: "Kolaborasi dalam program pendidikan dan dakwah",
    logo: "https://picsum.photos/200/200?random=darussalam"
  },
  {
    id: 3,
    name: "Bank Syariah Indonesia",
    description: "Dukungan pembiayaan untuk pengembangan fasilitas pendidikan",
    logo: "https://picsum.photos/200/200?random=bsi",
    website: "https://bankbsi.co.id"
  },
  {
    id: 4,
    name: "Universitas Islam Negeri",
    description: "Kerjasama dalam peningkatan kualitas tenaga pendidik",
    logo: "https://picsum.photos/200/200?random=uin"
  },
  {
    id: 5,
    name: "Rumah Zakat",
    description: "Program bantuan sosial dan pendidikan untuk masyarakat",
    logo: "https://picsum.photos/200/200?random=rumahzakat"
  }
];

const mockPrograms: Program[] = [
  {
    id: 1,
    title: "Program Beasiswa Yatim Piatu",
    description: "Program bantuan pendidikan untuk anak yatim piatu dan dhuafa",
    htmlContent: `
      <div class="space-y-4">
        <p>Program Beasiswa Yatim Piatu adalah salah satu program unggulan Yayasan Baitul Muslim yang bertujuan memberikan akses pendidikan berkualitas bagi anak-anak yatim piatu dan keluarga kurang mampu.</p>
        
        <h4 class="font-semibold text-lg">Kriteria Penerima:</h4>
        <ul class="list-disc pl-6 space-y-2">
          <li>Anak yatim, piatu, atau yatim piatu</li>
          <li>Berasal dari keluarga kurang mampu</li>
          <li>Memiliki prestasi akademik yang baik</li>
          <li>Berkomitmen melanjutkan pendidikan</li>
        </ul>
        
        <h4 class="font-semibold text-lg">Fasilitas yang Diberikan:</h4>
        <ul class="list-disc pl-6 space-y-2">
          <li>Biaya sekolah/kuliah penuh</li>
          <li>Uang saku bulanan</li>
          <li>Seragam dan perlengkapan sekolah</li>
          <li>Bimbingan belajar tambahan</li>
          <li>Pembinaan karakter dan spiritual</li>
        </ul>
      </div>
    `,
    image: "https://picsum.photos/400/250?random=program1",
    category: "Pendidikan"
  },
  {
    id: 2,
    title: "Program Tahfidz Al-Quran",
    description: "Program menghafal Al-Quran dengan metode modern dan bimbingan ahli",
    htmlContent: `
      <div class="space-y-4">
        <p>Program Tahfidz Al-Quran dirancang untuk membentuk generasi Qur'ani yang mampu menghafal, memahami, dan mengamalkan ajaran Al-Quran dalam kehidupan sehari-hari.</p>
        
        <h4 class="font-semibold text-lg">Metode Pembelajaran:</h4>
        <ul class="list-disc pl-6 space-y-2">
          <li>Metode Tilawati untuk tahsin bacaan</li>
          <li>Sistem talaqqi langsung dengan ustadz</li>
          <li>Muraja'ah rutin dan terjadwal</li>
          <li>Evaluasi berkala dengan tes bacaan</li>
        </ul>
        
        <h4 class="font-semibold text-lg">Target Program:</h4>
        <ul class="list-disc pl-6 space-y-2">
          <li>Hafalan minimal 5 juz untuk tingkat dasar</li>
          <li>Hafalan 15 juz untuk tingkat menengah</li>
          <li>Hafalan 30 juz untuk tingkat lanjut</li>
          <li>Kemampuan membaca dengan tartil</li>
        </ul>
      </div>
    `,
    image: "https://picsum.photos/400/250?random=program2",
    category: "Spiritual"
  },
  {
    id: 3,
    title: "Program Pemberdayaan Ekonomi Umat",
    description: "Program pengembangan usaha mikro dan keterampilan untuk masyarakat",
    htmlContent: `
      <div class="space-y-4">
        <p>Program Pemberdayaan Ekonomi Umat bertujuan meningkatkan kesejahteraan masyarakat melalui pengembangan usaha mikro, pelatihan keterampilan, dan pendampingan bisnis.</p>
        
        <h4 class="font-semibold text-lg">Jenis Kegiatan:</h4>
        <ul class="list-disc pl-6 space-y-2">
          <li>Pelatihan keterampilan tenjahit dan kerajinan</li>
          <li>Workshop manajemen usaha mikro</li>
          <li>Bantuan modal usaha tanpa bunga</li>
          <li>Pemasaran produk melalui platform digital</li>
        </ul>
        
        <h4 class="font-semibold text-lg">Sasaran Program:</h4>
        <ul class="list-disc pl-6 space-y-2">
          <li>Ibu-ibu rumah tangga</li>
          <li>Pemuda putus sekolah</li>
          <li>Keluarga prasejahtera</li>
          <li>Kelompok usaha mikro</li>
        </ul>
      </div>
    `,
    image: "https://picsum.photos/400/250?random=program3",
    category: "Ekonomi"
  },
  {
    id: 4,
    title: "Program Dakwah dan Kajian Islam",
    description: "Program penyebaran ajaran Islam melalui kajian dan ceramah rutin",
    htmlContent: `
      <div class="space-y-4">
        <p>Program Dakwah dan Kajian Islam bertujuan menyebarkan ajaran Islam yang rahmatan lil alamin melalui berbagai kegiatan dakwah dan pembelajaran agama.</p>
        
        <h4 class="font-semibold text-lg">Kegiatan Rutin:</h4>
        <ul class="list-disc pl-6 space-y-2">
          <li>Kajian mingguan setiap hari Jumat</li>
          <li>Ceramah bulanan dengan ustadz tamu</li>
          <li>Halaqah Al-Quran untuk ibu-ibu</li>
          <li>Program muallaf dan pembinaan</li>
        </ul>
        
        <h4 class="font-semibold text-lg">Materi Kajian:</h4>
        <ul class="list-disc pl-6 space-y-2">
          <li>Tafsir Al-Quran dan Hadits</li>
          <li>Fiqh sehari-hari</li>
          <li>Akhlak dan tasawuf</li>
          <li>Sejarah Islam dan sirah nabawiyah</li>
        </ul>
      </div>
    `,
    image: "https://picsum.photos/400/250?random=program4",
    category: "Dakwah"
  }
];

const AboutPage = () => {
  const [boardMembers, setBoardMembers] = useState<BoardMember[]>([]);
  const [boardGroups, setBoardGroups] = useState<BoardGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load board groups first
        const groupsResponse = await boardMemberService.getBoardGroups({
          size: 50,
          sort_by: 'display_order',
          sort_order: 'asc'
        });
        setBoardGroups(groupsResponse.items);

        // Load all board members
        const membersResponse = await boardMemberService.getBoardMembers({
          size: 50,
          sort_by: 'member_order',
          sort_order: 'asc'
        });
        setBoardMembers(membersResponse.items);
      } catch (error) {
        console.error('Error loading board data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const renderLeadershipCard = (member: BoardMember, isCenter: boolean = false) => (
    <Card key={member.id} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group w-full">
      {/* Image Section - Flexible aspect ratio */}
      <div className="relative overflow-hidden rounded-t-lg bg-muted h-80">
        <img
          src={getBoardImageUrl(member.img_url) || `https://picsum.photos/400/500?random=${member.id}`}
          alt={member.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
        />
        {/* Rank indicator */}
        <div className="absolute top-3 right-3 bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm shadow-lg">
          {member.member_order}
        </div>
      </div>

      {/* Content Section */}
      <CardContent className="p-6 text-center">
        <h3 className={`font-bold text-foreground mb-2 group-hover:text-primary transition-colors ${isCenter ? 'text-xl' : 'text-lg'}`}>
          {member.name}
        </h3>

        <Badge variant="secondary" className="mb-4">
          {member.position}
        </Badge>

        <div className="text-muted-foreground leading-relaxed text-sm">
          {member.description ? (
            <RichTextDisplay content={member.description} />
          ) : member.short_description ? (
            <p>{member.short_description}</p>
          ) : (
            <p>Pengurus Yayasan Baitul Muslim Lampung Timur</p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-96 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img
            src="https://picsum.photos/1920/600?random=about"
            alt="Tentang Yayasan"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Content */}
        <div className="relative z-10 h-full flex items-center pt-24">
          <div className="max-w-screen-xl mx-auto px-4 w-full">
            <div className="max-w-3xl text-white">
              <Badge variant="secondary" className="mb-6 bg-white/10 text-white border-white/20 hover:bg-white/20">
                Yayasan Baitul Muslim Lampung Timur
              </Badge>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                Tentang Yayasan
              </h1>

              <p className="text-lg md:text-xl mb-8 text-white/90 leading-relaxed max-w-2xl">
                Mengenal lebih dekat Yayasan Baitul Muslim Lampung Timur, visi misi, dan pengurus yayasan
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 1: About Section */}
      <section className="py-16">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="outline" className="mb-4 border-primary text-primary">
                Sejarah Kami
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
                Yayasan Baitul Muslim Lampung Timur
              </h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                Yayasan Baitul Muslim Lampung Timur adalah lembaga pendidikan dan dakwah Islam yang telah berdiri sejak 15 Juli 1993.
                Kami menyelenggarakan pendidikan Islam terpadu berkualitas dari tingkat TKIT hingga Pondok Pesantren Tahfidz Qur'an.
              </p>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Berlokasi di Way Jepara, Lampung Timur, kami berkomitmen memberikan pendidikan yang menggabungkan ilmu agama dan umum
                dengan pendekatan yang holistik dan modern.
              </p>

              {/* Highlights */}
              <div className="grid gap-4">
                {[
                  {
                    icon: Calendar,
                    title: "Berdiri Sejak 1993",
                    description: "Lebih dari 30 tahun pengalaman dalam pendidikan Islam"
                  },
                  {
                    icon: MapPin,
                    title: "Lokasi Strategis",
                    description: "Jl. Ir. H. Djuanda No. 19, Way Jepara, Lampung Timur"
                  },
                  {
                    icon: Users,
                    title: "Pendidikan Holistik",
                    description: "Menggabungkan ilmu agama dan umum dengan pendekatan modern"
                  }
                ].map((item, index) => {
                  const IconComponent = item.icon;
                  return (
                    <div key={index} className="flex items-start gap-3">
                      <div className="bg-primary/10 p-2 rounded-lg">
                        <IconComponent className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">{item.title}</h4>
                        <p className="text-muted-foreground text-sm">{item.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-6">
              <div className="relative">
                <img
                  src="https://picsum.photos/600/400"
                  alt="Yayasan Baitul Muslim"
                  className="rounded-lg shadow-lg w-full"
                />
                <Card className="absolute -bottom-6 -right-6 shadow-lg border-0 bg-primary text-primary-foreground">
                  <CardContent className="p-6 text-center">
                    <div className="text-2xl font-bold">30+</div>
                    <div className="text-sm opacity-90">Tahun Melayani</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Leadership Section */}
      <section className="py-16 bg-muted/20">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 border-primary text-primary">
              Kepemimpinan
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
              Pengurus Yayasan
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Para pengurus yang berdedikasi memimpin dan mengembangkan Yayasan Baitul Muslim Lampung Timur
            </p>
          </div>

          {loading ? (
            <LeadershipSkeleton />
          ) : boardGroups.length > 0 ? (
            <div className="max-w-6xl mx-auto space-y-12">
              {/* Render each group */}
              {boardGroups.map((group) => {
                const groupMembers = boardMembers
                  .filter(member => member.group_id === group.id)
                  .sort((a, b) => a.member_order - b.member_order);

                if (groupMembers.length === 0) return null;

                return (
                  <div key={group.id} className="space-y-6">
                    {/* Group Title */}
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-foreground mb-2">{group.title}</h3>
                      {group.description && (
                        <div className="text-muted-foreground">
                          <RichTextDisplay content={group.description} />
                        </div>
                      )}
                    </div>

                    {/* Group Members */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {groupMembers.map(member => (
                        <div key={member.id} className="w-full">
                          {renderLeadershipCard(member, false)}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">
                Data pengurus belum tersedia.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Section 3: Vision & Mission */}
      <section className="py-16">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 border-primary text-primary">
              Visi & Misi
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
              Visi dan Misi Kami
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Komitmen kami dalam mencerdaskan bangsa melalui pendidikan Islam yang berkualitas
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Visi */}
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-primary/60"></div>
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Eye className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">Visi</h3>
                </div>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Menjadi lembaga pendidikan Islam terpadu yang unggul, berkarakter, dan berwawasan global,
                  yang mampu mencetak generasi Qur'ani yang beriman, bertakwa, berilmu, dan berakhlak mulia.
                </p>
              </CardContent>
            </Card>

            {/* Misi */}
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary/60 to-primary"></div>
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Target className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">Misi</h3>
                </div>
                <div className="space-y-4">
                  {[
                    'Menyelenggarakan pendidikan Islam terpadu yang berkualitas dengan kurikulum yang seimbang antara ilmu agama dan umum',
                    'Membentuk generasi yang memiliki akhlak mulia, berkarakter Islami, dan berwawasan global',
                    'Mengembangkan potensi peserta didik secara optimal dalam aspek spiritual, intelektual, emosional, dan sosial',
                    'Menciptakan lingkungan pembelajaran yang kondusif, inovatif, dan berbasis teknologi modern',
                    'Membangun kemitraan strategis dengan berbagai pihak untuk kemajuan pendidikan Islam'
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="bg-primary/20 text-primary rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                        {index + 1}
                      </div>
                      <p className="text-muted-foreground leading-relaxed text-sm">{item}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </section>

      {/* Section 4: Foundation Partners */}
      <section className="py-16 bg-muted/20">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 border-primary text-primary">
              Kemitraan
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
              Mitra Yayasan
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Berbagai pihak yang berkolaborasi dengan kami dalam mengembangkan pendidikan dan dakwah Islam
            </p>
          </div>

          <div className="relative max-w-5xl mx-auto">
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {mockPartners.map((partner) => (
                  <CarouselItem key={partner.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                    <PartnerCard partner={partner} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex" />
              <CarouselNext className="hidden md:flex" />
            </Carousel>
          </div>
        </div>
      </section>

      {/* Section 5: Foundation Programs */}
      <section className="py-16">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 border-primary text-primary">
              Program Kami
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
              Program Yayasan
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Berbagai program unggulan yang dijalankan untuk kemajuan pendidikan dan kesejahteraan umat
            </p>
          </div>

          <div className="relative max-w-6xl mx-auto">
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {mockPrograms.map((program) => (
                  <CarouselItem key={program.id} className="pl-2 md:pl-4">
                    <ProgramCard program={program} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex" />
              <CarouselNext className="hidden md:flex" />
            </Carousel>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;