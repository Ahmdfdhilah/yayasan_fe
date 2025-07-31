import { Sheet, SheetContent, SheetTrigger } from "@workspace/ui/components/sheet";
import { Menu } from "lucide-react";
import logo from '@/assets/logo.png';
import { NavMenu } from "./NavbarMenu";
import { Button } from "@workspace/ui/components/button";

export const NavigationSheet = () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <img src={logo} alt="Logo" className="h-8 w-auto" />
        <NavMenu orientation="vertical" className="mt-12" />
      </SheetContent>
    </Sheet>
  );
};
