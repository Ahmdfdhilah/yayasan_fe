import { ReactNode, forwardRef } from 'react';

interface SectionProps {
    children: ReactNode;
    className?: string;
    containerClass?: string;
    id?:string;
}

export const Section = forwardRef<HTMLElement, SectionProps>(({ 
    children, 
    className = '', 
    id = '',
    containerClass = 'container mx-auto px-4' 
}, ref) => (
    <section ref={ref} className={`py-12 md:py-16 ${className}`} id={id}>
        <div className={containerClass}>
            {children}
        </div>
    </section>
));