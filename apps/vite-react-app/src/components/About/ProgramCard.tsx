import { Card, CardContent } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@workspace/ui/components/collapsible";
import { ChevronDown, BookOpen } from 'lucide-react';

interface Program {
  id: number;
  title: string;
  description: string;
  htmlContent: string;
  image: string;
  category: string;
}

interface ProgramCardProps {
  program: Program;
}

export const ProgramCard = ({ program }: ProgramCardProps) => {
  return (
    <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      {/* Image Section */}
      <div className="relative overflow-hidden rounded-t-lg bg-muted h-48">
        <img
          src={program.image}
          alt={program.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 left-3">
          <Badge variant="secondary" className="bg-white/90 text-primary">
            {program.category}
          </Badge>
        </div>
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
            <p className="text-sm text-muted-foreground leading-relaxed">
              {program.description}
            </p>
          </div>
        </div>

        {/* Collapsible Details */}
        <Collapsible>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
            <span className="text-sm font-medium text-foreground">
              Lihat Detail Program
            </span>
            <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform [&[data-state=open]]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3">
            <div 
              className="prose prose-sm max-w-none text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: program.htmlContent }}
            />
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};