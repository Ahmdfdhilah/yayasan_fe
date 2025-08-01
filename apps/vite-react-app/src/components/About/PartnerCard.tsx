import { Card, CardContent } from "@workspace/ui/components/card";

interface Partner {
  id: number;
  name: string;
  description: string;
  logo: string;
  website?: string;
}

interface PartnerCardProps {
  partner: Partner;
}

export const PartnerCard = ({ partner }: PartnerCardProps) => {
  return (
    <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full overflow-hidden mb-4 bg-muted">
            <img
              src={partner.logo}
              alt={partner.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          <h3 className="font-bold text-lg text-foreground mb-3">
            {partner.name}
          </h3>
          
          <p className="text-sm text-muted-foreground leading-relaxed">
            {partner.description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};