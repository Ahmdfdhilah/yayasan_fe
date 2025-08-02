import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@workspace/ui/components/sheet";
import { ScrollArea, ScrollBar } from "@workspace/ui/components/scroll-area";
import { Menu } from "lucide-react";
import logo from '@/assets/logo.png';
import { Button } from "@workspace/ui/components/button";
import { MobileNavLink } from "@/components/common/MobileNavLink";

export const NavigationSheet = () => {
  const [open, setOpen] = useState(false);

  const handleClose = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full border-border hover:bg-accent hover:text-accent-foreground">
          <Menu className="text-foreground" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-[16rem] max-w-[80vw]">
        <SheetHeader className="sr-only">
          <SheetTitle>Navigation Menu</SheetTitle>
          <SheetDescription>Main navigation menu for the application</SheetDescription>
        </SheetHeader>

        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center gap-3 p-4 border-b border-border">
            <img src={logo} alt="Yayasan Baitul Muslim" className="h-8 w-auto flex-shrink-0" />
            <span className="text-foreground font-medium">Menu</span>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden min-h-0">
            <ScrollArea className="h-full">
              <div className="p-4 pb-2">
                <nav className="space-y-1">
                  <MobileNavLink
                    to="/"
                    className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                    onNavigate={handleClose}
                  >
                    Beranda
                  </MobileNavLink>
                  <MobileNavLink
                    to="/about"
                    className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                    onNavigate={handleClose}
                  >
                    Tentang
                  </MobileNavLink>
                  <MobileNavLink
                    to="/articles"
                    className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                    onNavigate={handleClose}
                  >
                    Artikel
                  </MobileNavLink>
                  <MobileNavLink
                    to="/galleries"
                    className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                    onNavigate={handleClose}
                  >
                    Galeri
                  </MobileNavLink>
                  <MobileNavLink
                    to="/schools"
                    className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                    onNavigate={handleClose}
                  >
                    Sekolah
                  </MobileNavLink>
                  <MobileNavLink
                    to="/contact"
                    className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                    onNavigate={handleClose}
                  >
                    Kontak
                  </MobileNavLink>
                </nav>
              </div>
              <ScrollBar orientation="vertical" />
            </ScrollArea>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
