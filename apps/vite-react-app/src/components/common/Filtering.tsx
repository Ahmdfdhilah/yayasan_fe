import { useState } from "react";
import { Filter, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle } from "@workspace/ui/components/card";
import { ReactNode } from "react";

export interface FilteringParams {
    children?: ReactNode;
}

function Filtering({
    children
}: FilteringParams) {
    // State untuk mengelola visibilitas filter
    const [isFilterVisible, setIsFilterVisible] = useState<boolean>(true);

    // Toggle visibilitas filter
    const toggleFilterVisibility = () => {
        setIsFilterVisible(!isFilterVisible);
    };

    return (
        <Card className="shadow-md">
            <CardHeader className="text-primary flex flex-row justify-between items-center">
                <CardTitle className="font-semibold flex items-center">
                    <Filter className="primary w-5 h-5 mr-2" />
                    Opsi Filter
                </CardTitle>

                {/* Tombol Toggle untuk Filter */}
                <button
                    onClick={toggleFilterVisibility}
                    className="flex items-center space-x-2 p-2 rounded-md hover:text-accent"
                >
                    {isFilterVisible ? (
                        <>
                            <ChevronUp className="h-4 w-4" />
                            <span className="text-sm">Sembunyikan Filter</span>
                        </>
                    ) : (
                        <>
                            <ChevronDown className="h-4 w-4" />
                            <span className="text-sm">Tampilkan Filter</span>
                        </>
                    )}
                </button>
            </CardHeader>

            {/* Render konten filter secara kondisional */}
            {isFilterVisible && (
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                        {/* Render children filter */}
                        {children}
                    </div>
                </CardContent>
            )}
        </Card>
    );
}

export default Filtering;