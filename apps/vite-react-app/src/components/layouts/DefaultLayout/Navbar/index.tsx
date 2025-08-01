import { Button } from "@workspace/ui/components/button";
import { NavMenu } from "./NavbarMenu";
import { NavigationSheet } from "./NavigationSheet";
import { ScrollToTopLink } from "@/components/common/ScrollToTopLink";
import logo from '@/assets/logo.png';
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="fixed top-6 inset-x-4 h-16 bg-card/95 backdrop-blur-sm border border-border shadow-lg max-w-screen-xl mx-auto rounded-full z-50">
      <div className="h-full flex items-center justify-between mx-auto px-6">
        <ScrollToTopLink to="/">
          <img src={logo} alt="Yayasan Baitul Muslim" className="h-8 w-auto" />
        </ScrollToTopLink>

        {/* Desktop Menu */}
        <NavMenu className="hidden md:block" />

        <div className="flex items-center gap-3">
          <Link to='/login'>
            <Button
              className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground">
              Masuk
            </Button>
          </Link>

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