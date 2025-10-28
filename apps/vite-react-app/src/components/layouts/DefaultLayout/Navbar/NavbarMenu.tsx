import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
} from "@workspace/ui/components/navigation-menu";
import { ComponentProps } from "react";
import { ScrollToTopLink } from "@/components/common/ScrollToTopLink";

export const NavMenu = (props: ComponentProps<typeof NavigationMenu>) => (
    <NavigationMenu {...props}>
        <NavigationMenuList className="gap-6 space-x-0 data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-start">
            <NavigationMenuItem>
                <NavigationMenuLink asChild>
                    <ScrollToTopLink to="/" className="text-foreground hover:text-primary transition-colors">
                        Beranda
                    </ScrollToTopLink>
                </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
                <NavigationMenuLink asChild>
                    <ScrollToTopLink to="/about" className="text-foreground hover:text-primary transition-colors">
                        Tentang
                    </ScrollToTopLink>
                </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
                <NavigationMenuLink asChild>
                    <ScrollToTopLink to="/articles" className="text-foreground hover:text-primary transition-colors">
                        Artikel
                    </ScrollToTopLink>
                </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
                <NavigationMenuLink asChild>
                    <ScrollToTopLink to="/galleries" className="text-foreground hover:text-primary transition-colors">
                        Galeri
                    </ScrollToTopLink>
                </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
                <NavigationMenuLink asChild>
                    <ScrollToTopLink to="/schools" className="text-foreground hover:text-primary transition-colors">
                        Sekolah
                    </ScrollToTopLink>
                </NavigationMenuLink>
            </NavigationMenuItem>
           
            {/* <NavigationMenuItem>
                <NavigationMenuLink asChild>
                    <ScrollToTopLink to="/contact" className="text-foreground hover:text-primary transition-colors">
                        Kontak
                    </ScrollToTopLink>
                </NavigationMenuLink>
            </NavigationMenuItem> */}
        </NavigationMenuList>
    </NavigationMenu>
);
