import { useState, useEffect } from 'react';
import bgTentang from '@/assets/bg-tentang.webp';
import { Badge } from "@workspace/ui/components/badge";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@workspace/ui/components/carousel";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@workspace/ui/components/collapsible";
import { Users, Target, Eye, MapPin, Calendar, Fullscreen, ChevronDown, BookOpen } from 'lucide-react';
import { RichTextDisplay } from '@/components/common/RichTextDisplay';
import ImageViewDialog from '@/components/common/ImageViewDialog';
import { boardMemberService } from '@/services/board-members';
// import { mitraService } from '@/services/mitra';
import { programService } from '@/services/program';
import { getBoardImageUrl, getNewsImageUrl } from '@/utils/imageUtils';
import type { BoardMember, BoardGroup } from '@/services/board-members/types';
// import type { Mitra } from '@/services/mitra/types';
import type { Program } from '@/services/program/types';
import yayasan from '@/assets/yayasan.webp';

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


const AboutPage = () => {
  const [boardMembers, setBoardMembers] = useState<BoardMember[]>([]);
  const [boardGroups, setBoardGroups] = useState<BoardGroup[]>([]);
  // const [mitras, setMitras] = useState<Mitra[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  // const [mitraLoading, setMitraLoading] = useState(true);
  const [programLoading, setProgramLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<{
    src: string;
    alt: string;
    title?: string;
  } | null>(null);
  const [selectedDescription, setSelectedDescription] = useState<string>('');
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);

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

    // const loadMitras = async () => {
    //   try {
    //     const response = await mitraService.getMitras({
    //       limit: 50
    //     });
    //     setMitras(response.items);
    //   } catch (error) {
    //     console.error('Error loading mitra data:', error);
    //   } finally {
    //     setMitraLoading(false);
    //   }
    // };

    const loadPrograms = async () => {
      try {
        const response = await programService.getPrograms({
          limit: 50
        });
        setPrograms(response.items);
      } catch (error) {
        console.error('Error loading program data:', error);
      } finally {
        setProgramLoading(false);
      }
    };

    loadData();
    // loadMitras();
    loadPrograms();
  }, []);

  // Handle image click to open dialog
  const handleImageClick = (member: BoardMember) => {
    const imageUrl = getBoardImageUrl(member.img_url) || `https://picsum.photos/400/500?random=${member.id}`;

    setSelectedImage({
      src: imageUrl,
      alt: member.name,
      title: `${member.name} - ${member.position}`
    });

    setSelectedDescription(
      member.description ||
      member.short_description ||
      'Pengurus Yayasan Baitul Muslim Lampung Timur'
    );

    setIsImageDialogOpen(true);
  };

  // Handle dialog close
  const handleDialogClose = (open: boolean) => {
    setIsImageDialogOpen(open);
    if (!open) {
      setSelectedImage(null);
      setSelectedDescription('');
    }
  };


  // // Render mitra card for carousel
  // const renderMitraCard = (mitra: Mitra) => (
  //   <Card key={mitra.id} className="h-full">
  //     <CardContent className="p-6 text-center h-full flex flex-col">
  //       <div className="relative w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden bg-muted">
  //         {mitra.img_url ? (
  //           <img
  //             src={getNewsImageUrl(mitra.img_url)}
  //             alt={mitra.title}
  //             className="w-full h-full object-cover"
  //             onError={(e) => {
  //               const target = e.target as HTMLImageElement;
  //               target.src = `https://picsum.photos/200/200?random=${mitra.id}`;
  //             }}
  //           />
  //         ) : (
  //           <div className="w-full h-full flex items-center justify-center">
  //             <Users className="w-8 h-8 text-muted-foreground" />
  //           </div>
  //         )}
  //       </div>
  //       <h3 className="font-semibold text-foreground mb-2">{mitra.title}</h3>
  //       {mitra.description && (
  //         <div className="text-sm text-muted-foreground leading-relaxed flex-1">
  //           <RichTextDisplay content={mitra.description} />
  //         </div>
  //       )}
  //     </CardContent>
  //   </Card>
  // );

  // Render program card for carousel
  const renderProgramCard = (program: Program) => (
    <Card key={program.id} className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      {/* Image Section */}
      <div className="relative overflow-hidden rounded-t-lg bg-muted">
        {program.img_url ? (
          <img
            src={getNewsImageUrl(program.img_url)}
            alt={program.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = `https://picsum.photos/400/300?random=${program.id}`;
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Target className="w-12 h-12 text-muted-foreground" />
          </div>
        )}
      </div>

      <CardContent className="p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="bg-primary/10 p-2 rounded-lg flex-shrink-0">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-foreground mb-2">
              {program.title}
            </h3>
            {program.excerpt && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {program.excerpt}
              </p>
            )}
          </div>
        </div>

        {/* Collapsible Details */}
        {program.description && (
          <Collapsible>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
              <span className="text-sm font-medium text-foreground">
                Lihat Detail Program
              </span>
              <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform [&[data-state=open]]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3">
              <div className="prose prose-sm max-w-none text-muted-foreground">
                <RichTextDisplay content={program.description} />
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );

  const renderLeadershipCard = (member: BoardMember, isCenter: boolean = false) => (
    <Card key={member.id} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group w-full">
      {/* Image Section - Clickable for dialog */}
      <div
        className="relative overflow-hidden rounded-t-lg bg-muted h-80 cursor-pointer"
        onClick={() => handleImageClick(member)}
      >
        <img
          src={getBoardImageUrl(member.img_url) || `https://picsum.photos/400/500?random=${member.id}`}
          alt={member.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
        />
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Fullscreen className="w-8 h-8 text-white" />
          </div>
        </div>
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
            src={bgTentang}
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
                    description: "Jalan Batin Kyai, Labuhan Ratu 1 Way Jepara, Lampung Timur, Lampung"
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
                  src={yayasan}
                  alt="Yayasan Baitul Muslim"
                  className="rounded-lg shadow-lg w-full"
                />
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
                    <div className="text-left">
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
      {/* <section className="py-16 bg-muted/20">
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
            {mitraLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Card key={index}>
                    <CardContent className="p-6 text-center">
                      <Skeleton className="w-24 h-24 rounded-full mx-auto mb-4" />
                      <Skeleton className="h-6 w-32 mx-auto mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-3/4 mx-auto" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : mitras.length > 0 ? (
              <Carousel
                opts={{
                  align: "start",
                  loop: true,
                }}
                className="w-full"
              >
                <CarouselContent className="-ml-2 md:-ml-4">
                  {mitras.map((mitra) => (
                    <CarouselItem key={mitra.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                      {renderMitraCard(mitra)}
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="hidden md:flex" />
                <CarouselNext className="hidden md:flex" />
              </Carousel>
            ) : (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Belum ada data mitra yang tersedia.</p>
              </div>
            )}
          </div>
        </div>
      </section> */}

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
            {programLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Card key={index}>
                    <div className="relative overflow-hidden rounded-t-lg bg-muted h-48">
                      <Skeleton className="w-full h-full" />
                    </div>
                    <CardContent className="p-6">
                      <Skeleton className="h-6 w-32 mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-3/4" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : programs.length > 0 ? (
              <Carousel
                opts={{
                  align: "start",
                  loop: true,
                }}
                className="w-full"
              >
                <CarouselContent className="-ml-2 md:-ml-4">
                  {programs.map((program) => (
                    <CarouselItem key={program.id} className="pl-2 md:pl-4">
                      {renderProgramCard(program)}
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="hidden md:flex" />
                <CarouselNext className="hidden md:flex" />
              </Carousel>
            ) : (
              <div className="text-center py-12">
                <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Belum ada data program yang tersedia.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Image View Dialog */}
      {selectedImage && (
        <ImageViewDialog
          open={isImageDialogOpen}
          onOpenChange={handleDialogClose}
          image={selectedImage}
          description={selectedDescription}
        />
      )}
    </div>
  );
};

export default AboutPage;