import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import CarouselHero, { CarouselItem } from "@workspace/ui/components/ui/carousel";

interface HeroSectionProps {
  galleryItems: CarouselItem[];
}

export const HeroSection = ({ galleryItems }: HeroSectionProps) => {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      {galleryItems && galleryItems.length > 0 ? (
        <CarouselHero items={galleryItems} />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Memuat galeri...</div>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
      <div className="absolute bottom-0 left-0 right-0 p-8 text-white z-20">
        <div className="max-w-screen-xl mx-auto">
          <Badge variant="secondary" className="mb-4 bg-primary/20 text-white border-primary/30">
            Berdiri 1993
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white">
            Yayasan Baitul Muslim
          </h1>
          <p className="text-xl md:text-2xl mb-6 max-w-2xl text-white/90">
            Pendidikan Islam Terpadu Berkualitas Sejak 1993
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Daftar Sekarang
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
              Pelajari Lebih Lanjut
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};