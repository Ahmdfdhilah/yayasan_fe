import React from 'react';

interface ListHeaderCompositeProps {
  title: string;
  subtitle?: string;
  className?: string;
}

const ListHeaderComposite: React.FC<ListHeaderCompositeProps> = ({
  title,
  subtitle,
  className = "",
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">{title}</h2>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListHeaderComposite;