import { Badge } from "@workspace/ui/components/badge";

interface HeaderSectionProps {
    title: string;
    subtitle?: string;
    badgeText?: string;
}
const HeaderSection: React.FC<HeaderSectionProps> = ({
    title,
    subtitle,
    badgeText,
}) => {
    return (
        <div className="text-center mb-16">
            <Badge className="bg-primary/10 text-primary hover:bg-primary/20 mb-4">
                {badgeText}
            </Badge>
            <h2 className="text-4xl font-bold mb-4">{title}</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {subtitle}
            </p>
        </div>
    );
};

export default HeaderSection;