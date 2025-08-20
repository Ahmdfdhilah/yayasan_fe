import { Separator } from "@workspace/ui/components/separator";
import { Mail, Phone, MapPin } from "lucide-react";
import { ScrollToTopLink } from "@/components/common/ScrollToTopLink";
import logo from '@/assets/logo.png';

const Footer = () => {

  return (
    <footer className="bg-sidebar border-t border-border">
      <div className="max-w-screen-xl mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Logo & Description */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Yayasan Baitul Muslim" className="h-10 w-auto" />
              <h3 className="font-semibold text-foreground text-lg">Yayasan Baitul Muslim</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Yayasan pendidikan dan dakwah Islam yang menyelenggarakan pendidikan terpadu berkualitas sejak 1993.
            </p>
            {/* Contact Info */}
            <div className="space-y-3 mt-6">
              <h3 className="font-semibold text-foreground">Kontak Kami</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">
                    Lokasi: Jalan Batin Kyai, Labuhan Ratu 1<br />
                    Way Jepara, Lampung Timur, Lampung
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">
                    Telp: 0852-1972-0205
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">
                    Email: humasbaitulmuslim.official@gmail.com
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Maps */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Lokasi Kami</h3>
            <div className="aspect-video w-full rounded-lg overflow-hidden border">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3058.5982747005614!2d105.69910082151554!3d5.165405647055576!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e408b02872137bf%3A0xc56ae07f86b61515!2sYayasan%20Baitul%20Muslim%20Lampung%20Timur!5e1!3m2!1sid!2sid!4v1755648097208!5m2!1sid!2sid"
                width="600"
                height="450"
                style={{ border: 0 }}   
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Klik peta untuk membuka di Google Maps
            </p>
          </div>
        </div>

        <Separator className="my-8 bg-border" />

        {/* Bottom Footer */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Yayasan Baitul Muslim Lampung Timur. Hak cipta dilindungi.
          </p>
          <div className="flex items-center space-x-4">
            <ScrollToTopLink to="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Kontak
            </ScrollToTopLink>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;