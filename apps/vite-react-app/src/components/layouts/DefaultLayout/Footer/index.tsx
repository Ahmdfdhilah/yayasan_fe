import { useState, useEffect } from 'react';
import { Separator } from "@workspace/ui/components/separator";
import { Mail, Phone, MapPin, Facebook, Instagram } from "lucide-react";
import { ScrollToTopLink } from "@/components/common/ScrollToTopLink";
import { organizationService } from '@/services/organizations';
import type { Organization } from '@/services/organizations/types';
import logo from '@/assets/logo.png';

const Footer = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);

  useEffect(() => {
    const loadOrganizations = async () => {
      try {
        const response = await organizationService.getOrganizations({
          page: 1,
          size: 5,
          sort_by: 'name',
          sort_order: 'asc'
        });
        setOrganizations(response.items);
      } catch (error) {
        console.error('Error loading organizations for footer:', error);
      }
    };

    loadOrganizations();
  }, []);

  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-screen-xl mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Yayasan Baitul Muslim" className="h-10 w-auto" />
              <h3 className="font-semibold text-foreground text-lg">Yayasan Baitul Muslim</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Yayasan pendidikan dan dakwah Islam yang menyelenggarakan pendidikan terpadu berkualitas sejak 1993.
            </p>
            <div className="flex items-center space-x-3">
              <ScrollToTopLink to="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="w-4 h-4" />
              </ScrollToTopLink>
              <ScrollToTopLink to="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="w-4 h-4" />
              </ScrollToTopLink>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Tautan Cepat</h3>
            <ul className="space-y-2">
              <li>
                <ScrollToTopLink to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Beranda
                </ScrollToTopLink>
              </li>
              <li>
                <ScrollToTopLink to="/articles" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Artikel
                </ScrollToTopLink>
              </li>
              <li>
                <ScrollToTopLink to="/galleries" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Galeri
                </ScrollToTopLink>
              </li>
              <li>
                <ScrollToTopLink to="/schools" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Sekolah
                </ScrollToTopLink>
              </li>
              <li>
                <ScrollToTopLink to="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Tentang
                </ScrollToTopLink>
              </li>
              <li>
                <ScrollToTopLink to="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Kontak
                </ScrollToTopLink>
              </li>
            </ul>
          </div>

          {/* Education Levels */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Jenjang Pendidikan</h3>
            <ul className="space-y-2">
              {organizations.length > 0 ? (
                organizations.map((org) => (
                  <li key={org.id}>
                    <ScrollToTopLink
                      to={`/schools/${org.id}`}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {org.display_name}
                    </ScrollToTopLink>
                  </li>
                ))
              ) : (
                <>
                  <li>
                    <ScrollToTopLink to="/schools" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      TKIT Baitul Muslim
                    </ScrollToTopLink>
                  </li>
                  <li>
                    <ScrollToTopLink to="/schools" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      SDIT Baitul Muslim
                    </ScrollToTopLink>
                  </li>
                  <li>
                    <ScrollToTopLink to="/schools" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      SMPIT Baitul Muslim
                    </ScrollToTopLink>
                  </li>
                </>
              )}
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