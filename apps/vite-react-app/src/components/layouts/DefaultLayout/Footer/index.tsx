import { Separator } from "@workspace/ui/components/separator";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Facebook, Instagram } from "lucide-react";
import logo from '@/assets/logo.png';

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-screen-xl mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="space-y-4">
            <img src={logo} alt="Yayasan Baitul Muslim" className="h-10 w-auto" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              Yayasan pendidikan dan dakwah Islam yang menyelenggarakan pendidikan terpadu berkualitas sejak 1993.
            </p>
            <div className="flex items-center space-x-3">
              <Link to="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="w-4 h-4" />
              </Link>
              <Link to="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Tautan Cepat</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Beranda
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Tentang Kami
                </Link>
              </li>
              <li>
                <Link to="/schools" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Lembaga Pendidikan
                </Link>
              </li>
              <li>
                <Link to="/articles" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Artikel & Berita
                </Link>
              </li>
            </ul>
          </div>

          {/* Education Levels */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Jenjang Pendidikan</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/schools/tkit" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  TKIT Baitul Muslim
                </Link>
              </li>
              <li>
                <Link to="/schools/sdit" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  SDIT Baitul Muslim
                </Link>
              </li>
              <li>
                <Link to="/schools/smpit" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  SMPIT Baitul Muslim
                </Link>
              </li>
              <li>
                <Link to="/schools/smait" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  SMAIT Baitul Muslim
                </Link>
              </li>
              <li>
                <Link to="/schools/pesantren" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Pondok Pesantren
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Kontak Kami</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">
                  Jl. Ir. H. Djuanda No. 19<br />
                  Way Jepara, Lampung Timur
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-sm text-muted-foreground">
                  +62 xxx-xxxx-xxxx
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-sm text-muted-foreground">
                  info@baitulmuslim.sch.id
                </span>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8 bg-border" />

        {/* Bottom Footer */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Yayasan Baitul Muslim Lampung Timur. Hak cipta dilindungi.
          </p>
          <div className="flex items-center space-x-4">
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Kebijakan Privasi
            </Link>
            <Link to="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Syarat & Ketentuan
            </Link>
            <Link to="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Kontak
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;