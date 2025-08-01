import { useState, useEffect } from 'react';
import { Badge } from "@workspace/ui/components/badge";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Users, Target, Eye, Heart } from 'lucide-react';
import { AboutSection } from '@/components/Home/AboutSection';
import { boardMemberService } from '@/services/board-members';
import { getBoardImageUrl } from '@/utils/imageUtils';
import type { BoardMember } from '@/services/board-members/types';

const LeadershipSkeleton = () => (
  <div className="max-w-4xl mx-auto">
    {/* First row - Center position */}
    <div className="grid gap-8 mb-8">
      <div className="max-w-sm mx-auto w-full">
        <Card>
          <div className="aspect-video relative overflow-hidden rounded-t-lg bg-muted">
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
          <div className="aspect-video relative overflow-hidden rounded-t-lg bg-muted">
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBoardMembers = async () => {
      try {
        // Get top 3 board members by display_order
        const response = await boardMemberService.getBoardMembers({
          size: 3,
          sort_by: 'display_order',
          sort_order: 'asc'
        });
        setBoardMembers(response.items);
      } catch (error) {
        console.error('Error loading board members:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBoardMembers();
  }, []);

  const renderLeadershipCard = (member: BoardMember, isCenter: boolean = false) => (
    <Card key={member.id} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group w-full">
      {/* Image Section - Half Card */}
      <div className="aspect-video relative overflow-hidden rounded-t-lg bg-muted">
        <img
          src={getBoardImageUrl(member.img_url) || `https://picsum.photos/400/240?random=${member.id}`}
          alt={member.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
        />
        {/* Rank indicator */}
        <div className="absolute top-3 right-3 bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm shadow-lg">
          {member.display_order}
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
        
        <p className="text-muted-foreground leading-relaxed text-sm">
          {member.short_description || member.description || `Pengurus Yayasan Baitul Muslim Lampung Timur`}
        </p>
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
      <AboutSection />

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
          ) : boardMembers.length > 0 ? (
            <div className="max-w-4xl mx-auto">
              {/* First row - Center position (order 1) */}
              <div className="grid gap-8 mb-8">
                {boardMembers.filter(member => member.display_order === 1).map(member => (
                  <div key={member.id} className="max-w-sm mx-auto w-full">
                    {renderLeadershipCard(member, true)}
                  </div>
                ))}
              </div>
              
              {/* Second row - Side positions (order 2 and 3) */}
              <div className="grid md:grid-cols-2 gap-8">
                {boardMembers.filter(member => member.display_order === 2 || member.display_order === 3).map(member => (
                  <div key={member.id} className="w-full">
                    {renderLeadershipCard(member, false)}
                  </div>
                ))}
              </div>
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

          {/* Values */}
          <div className="mt-12">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-foreground mb-4">Nilai-Nilai Kami</h3>
              <p className="text-muted-foreground">
                Prinsip-prinsip yang menjadi landasan dalam setiap aktivitas yayasan
              </p>
            </div>
            
            <div className="grid md:grid-cols-4 gap-6">
              {[
                {
                  icon: Heart,
                  title: 'Ikhlas',
                  description: 'Bekerja dengan ketulusan hati untuk mencapai ridha Allah SWT'
                },
                {
                  icon: Users,
                  title: 'Amanah',
                  description: 'Menjalankan tugas dengan penuh tanggung jawab dan kepercayaan'
                },
                {
                  icon: Target,
                  title: 'Istiqomah',
                  description: 'Konsisten dalam menjalankan komitmen dan nilai-nilai Islam'
                },
                {
                  icon: Eye,
                  title: 'Excellence',
                  description: 'Selalu berusaha memberikan yang terbaik dalam setiap layanan'
                }
              ].map((value, index) => {
                const IconComponent = value.icon;
                return (
                  <Card key={index} className="text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <CardContent className="p-6">
                      <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <IconComponent className="w-8 h-8 text-primary" />
                      </div>
                      <h4 className="font-bold text-foreground mb-2">{value.title}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{value.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;