import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@workspace/ui/components/sheet";
import { Menu } from "lucide-react";
import logo from '@/assets/logo.png';
import { Button } from "@workspace/ui/components/button";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { Separator } from "@workspace/ui/components/separator";
import { MobileNavLink } from "@/components/common/MobileNavLink";
import { Link } from "react-router-dom";

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
      <SheetContent className="bg-card border-border">
        <SheetHeader className="text-left">
          <SheetTitle className="flex items-center gap-3">
            <img src={logo} alt="Yayasan Baitul Muslim" className="h-8 w-auto" />
            <span className="text-foreground">Menu</span>
          </SheetTitle>
        </SheetHeader>

        <div className="mt-8 space-y-6">
          <nav className="space-y-4">
            <MobileNavLink
              to="/"
              className="block text-foreground hover:text-primary transition-colors py-2"
              onNavigate={handleClose}
            >
              Beranda
            </MobileNavLink>
            <MobileNavLink
              to="/articles"
              className="block text-foreground hover:text-primary transition-colors py-2"
              onNavigate={handleClose}
            >
              Artikel
            </MobileNavLink>
            <MobileNavLink
              to="/galleries"
              className="block text-foreground hover:text-primary transition-colors py-2"
              onNavigate={handleClose}
            >
              Galeri
            </MobileNavLink>
            <MobileNavLink
              to="/schools"
              className="block text-foreground hover:text-primary transition-colors py-2"
              onNavigate={handleClose}
            >
              Sekolah
            </MobileNavLink>
            <MobileNavLink
              to="/about"
              className="block text-foreground hover:text-primary transition-colors py-2"
              onNavigate={handleClose}
            >
              Tentang
            </MobileNavLink>
            <MobileNavLink
              to="/contact"
              className="block text-foreground hover:text-primary transition-colors py-2"
              onNavigate={handleClose}
            >
              Kontak
            </MobileNavLink>
          </nav>

          <Separator className="bg-border" />

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Tema</span>
            <ThemeToggle />
          </div>

          <Separator className="bg-border" />

          <div className="space-y-3">
            <Link to='/login'>
              <Button
                className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground">
                Masuk
              </Button>
            </Link>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
