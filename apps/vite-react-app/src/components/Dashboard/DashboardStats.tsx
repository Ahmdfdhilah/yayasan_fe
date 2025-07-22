import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

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
  distribution: Record<string, number>;
}

export function GradeDistribution({ distribution }: GradeDistributionProps) {
  const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);
  
  const getPercentage = (value: number) => {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  };

  const gradeColors: Record<string, string> = {
    A: '#22c55e', // green-500
    B: '#3b82f6', // blue-500
    C: '#eab308', // yellow-500
    D: '#ef4444'  // red-500
  };

  // Prepare data for pie chart
  const chartData = Object.entries(distribution)
    .filter(([_, count]) => count > 0) // Only show grades that have data
    .map(([grade, count]) => ({
      name: `Grade ${grade}`,
      value: count,
      percentage: getPercentage(count),
      color: gradeColors[grade] || '#6b7280' // Default gray color for unknown grades
    }));

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-2 shadow-md">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            {data.value} ({data.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Distribusi Grade</CardTitle>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <div className="flex items-center justify-center h-48 text-muted-foreground">
            <p>Belum ada data grade</p>
          </div>
        ) : (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
        
        {/* Legend */}
        {chartData.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-2">
            {chartData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs font-medium">{item.name}</span>
                <span className="text-xs text-muted-foreground ml-auto">
                  {item.value} ({item.percentage}%)
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}