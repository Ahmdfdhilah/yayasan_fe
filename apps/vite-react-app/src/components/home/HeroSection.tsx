import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import CarouselHero, { CarouselItem } from "@workspace/ui/components/ui/carousel";

interface HeroSectionProps {
  galleryItems: CarouselItem[];
}

export const HeroSection = ({ galleryItems }: HeroSectionProps) => {
  return (
    <section className="relative">
      <CarouselHero items={galleryItems} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
        <div className="max-w-screen-xl mx-auto">
          <Badge variant="secondary" className="mb-4 bg-primary/20 text-primary-foreground border-primary/30">
            Est. 1993
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Yayasan Baitul Muslim
          </h1>
          <p className="text-xl md:text-2xl mb-6 max-w-2xl text-muted-foreground">
            Pendidikan Islam Terpadu Berkualitas Sejak 1993
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
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