import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { ArrowRight, MapPin, Calendar, Users } from 'lucide-react';
import { ScrollToTopLink } from "../common/ScrollToTopLink";
import yayasan from '@/assets/yayasan.webp';


const highlights = [
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
];

export const AboutSection = () => {
  return (
    <section className="py-16">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <Badge variant="outline" className="mb-4 border-primary text-primary">
              Tentang Kami
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
            <div className="grid gap-4 mb-8">
              {highlights.map((item, index) => {
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

            <ScrollToTopLink to='/about'>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Pelajari Lebih Lanjut
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </ScrollToTopLink>
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
  );
};