import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@workspace/ui/components/sheet";
import { Menu } from "lucide-react";
import logo from '@/assets/logo.png';
import { NavMenu } from "./NavbarMenu";
import { Button } from "@workspace/ui/components/button";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { Separator } from "@workspace/ui/components/separator";

export const NavigationSheet = () => {
  return (
    <Sheet>
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
          <NavMenu orientation="vertical" />
          
          <Separator className="bg-border" />
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Tema</span>
            <ThemeToggle />
          </div>
          
          <Separator className="bg-border" />
          
          <div className="space-y-3">
            <Button variant="outline" className="w-full border-border hover:bg-accent hover:text-accent-foreground">
              Masuk
            </Button>
            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
              Daftar
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
