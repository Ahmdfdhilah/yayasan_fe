import { Card, CardContent } from "@workspace/ui/components/card";
import { Users, GraduationCap, BookOpen, Award } from 'lucide-react';

const stats = [
  {
    icon: GraduationCap,
    value: "30+",
    label: "Tahun Berpengalaman",
    description: "Melayani pendidikan sejak 1993"
  },
  {
    icon: Users,
    value: "2000+",
    label: "Siswa Aktif",
    description: "Dari berbagai jenjang pendidikan"
  },
  {
    icon: BookOpen,
    value: "5",
    label: "Jenjang Pendidikan",
    description: "TKIT hingga Pondok Pesantren"
  },
  {
    icon: Award,
    value: "100+",
    label: "Prestasi Diraih",
    description: "Prestasi akademik dan non-akademik"
  }
];

export const StatsSection = () => {
  return (
    <section className="py-16 bg-muted/50">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card key={index} className="text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="bg-primary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <IconComponent className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
                  <div className="font-semibold text-foreground mb-1">{stat.label}</div>
                  <div className="text-sm text-muted-foreground">{stat.description}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};