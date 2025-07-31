import { Button } from "@workspace/ui/components/button";
import { NavMenu } from "./NavbarMenu";
import { NavigationSheet } from "./NavigationSheet";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import logo from '@/assets/logo.png';

const Navbar = () => {
  return (
    <nav className="fixed top-6 inset-x-4 h-16 bg-card/95 backdrop-blur-sm border border-border shadow-lg max-w-screen-xl mx-auto rounded-full z-50">
      <div className="h-full flex items-center justify-between mx-auto px-6">
        <img src={logo} alt="Yayasan Baitul Muslim" className="h-8 w-auto" />

        {/* Desktop Menu */}
        <NavMenu className="hidden md:block" />

        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <ThemeToggle className="hidden sm:flex" />
          
          <Button
            variant="outline"
            className="hidden sm:inline-flex rounded-full border-border hover:bg-accent hover:text-accent-foreground"
          >
            Masuk
          </Button>
          <Button className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground">
            Daftar
          </Button>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <NavigationSheet />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;