import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  formatter?: (value: number) => string;
}

export function StatCard({ 
  title, 
  value, 
  subtitle, 
  trend, 
  trendValue, 
  formatter = (v) => v.toString() 
}: StatCardProps) {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-green-500';
      case 'down': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatter(value)}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">
            {subtitle}
          </p>
        )}
        {trend && trendValue && (
          <div className={`flex items-center gap-1 text-xs mt-2 ${getTrendColor()}`}>
            {getTrendIcon()}
            <span>{trendValue}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface GradeDistributionProps {
  distribution: {
    A: number;
    B: number;
    C: number;
    D: number;
  };
}

export function GradeDistribution({ distribution }: GradeDistributionProps) {
  const total = distribution.A + distribution.B + distribution.C + distribution.D;
  
  const getPercentage = (value: number) => {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  };

  const gradeVariants = {
    A: 'bg-green-500',
    B: 'bg-blue-500',
    C: 'bg-yellow-500',
    D: 'bg-red-500'
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Distribusi Grade</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {Object.entries(distribution).map(([grade, count]) => (
          <div key={grade} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${gradeVariants[grade as keyof typeof gradeVariants]}`} />
              <span className="text-sm font-medium">Grade {grade}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {count} ({getPercentage(count)}%)
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}