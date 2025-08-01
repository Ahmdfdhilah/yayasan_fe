import { useState } from 'react';
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Label } from "@workspace/ui/components/label";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send, 
  CheckCircle,
  Building,
  Globe,
  Users
} from 'lucide-react';
import { messageService } from '@/services/messages';
import type { MessageCreate } from '@/services/messages/types';
import { useToast } from '@workspace/ui/components/sonner';

interface ContactFormData {
  name: string;
  email: string;
  title: string;
  message: string;
}

const ContactPage = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    title: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const toast =  useToast()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.title.trim() || !formData.message.trim()) {
      toast.error('Semua field harus diisi');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Format email tidak valid');
      return;
    }

    setIsSubmitting(true);

    try {
      const messageData: MessageCreate = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        title: formData.title.trim(),
        message: formData.message.trim()
      };

      await messageService.submitMessage(messageData);
      
      setIsSubmitted(true);
      setFormData({
        name: '',
        email: '',
        title: '',
        message: ''
      });
      
      toast.success('Pesan berhasil dikirim! Kami akan segera merespons.');
    } catch (error) {
      console.error('Error submitting message:', error);
      toast.error('Gagal mengirim pesan. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setIsSubmitted(false);
    setFormData({
      name: '',
      email: '',
      title: '',
      message: ''
    });
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: 'Alamat',
      details: [
        'Jl. Ir. H. Djuanda No. 19',
        'Way Jepara, Lampung Timur',
        'Lampung 34192, Indonesia'
      ]
    },
    {
      icon: Phone,
      title: 'Telepon',
      details: [
        '+62 725 123456',
        '+62 812 3456 7890'
      ]
    },
    {
      icon: Mail,
      title: 'Email',
      details: [
        'info@baitulmuslim.ac.id',
        'admin@baitulmuslim.ac.id'
      ]
    },
    {
      icon: Clock,
      title: 'Jam Operasional',
      details: [
        'Senin - Jumat: 07:00 - 16:00',
        'Sabtu: 07:00 - 12:00',
        'Minggu: Tutup'
      ]
    }
  ];

  const quickStats = [
    {
      icon: Building,
      title: '5 Jenjang',
      description: 'Pendidikan Tersedia'
    },
    {
      icon: Users,
      title: '30+ Tahun',
      description: 'Melayani Pendidikan'
    },
    {
      icon: Globe,
      title: 'Terakreditasi',
      description: 'Lembaga Terpercaya'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-96 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img
            src="https://picsum.photos/1920/600?random=contact"
            alt="Kontak Kami"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Content */}
        <div className="relative z-10 h-full flex items-center pt-24">
          <div className="max-w-screen-xl mx-auto px-4 w-full">
            <div className="max-w-3xl text-white">
              <Badge variant="secondary" className="mb-6 bg-white/10 text-white border-white/20 hover:bg-white/20">
                Yayasan Baitul Muslim Lampung Timur
              </Badge>
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                Kontak Kami
              </h1>
              
              <p className="text-lg md:text-xl mb-8 text-white/90 leading-relaxed max-w-2xl">
                Hubungi kami untuk informasi lebih lanjut tentang pendidikan, program, atau pertanyaan lainnya
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-12 bg-primary/5">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {quickStats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">{stat.title}</h3>
                  <p className="text-muted-foreground">{stat.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <div className="mb-8">
                <Badge variant="outline" className="mb-4 border-primary text-primary">
                  Kirim Pesan
                </Badge>
                <h2 className="text-3xl font-bold mb-4 text-foreground">
                  Hubungi Kami
                </h2>
                <p className="text-lg text-muted-foreground">
                  Isi form di bawah ini untuk mengirim pesan kepada kami. Kami akan merespons dalam 1x24 jam.
                </p>
              </div>

              {isSubmitted ? (
                <Card className="border-green-200 bg-green-50 border-2">
                  <CardContent className="p-8 text-center">
                    <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-green-800 mb-2">
                      Pesan Terkirim!
                    </h3>
                    <p className="text-green-700 mb-6">
                      Terima kasih telah menghubungi kami. Pesan Anda telah berhasil dikirim dan akan segera kami proses.
                    </p>
                    <Button 
                      onClick={resetForm}
                      variant="outline"
                      className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                    >
                      Kirim Pesan Lain
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Nama Lengkap *</Label>
                          <Input
                            id="name"
                            name="name"
                            type="text"
                            placeholder="Masukkan nama lengkap"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            disabled={isSubmitting}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="nama@email.com"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            disabled={isSubmitting}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="title">Subjek *</Label>
                        <Input
                          id="title"
                          name="title"
                          type="text"
                          placeholder="Subjek pesan"
                          value={formData.title}
                          onChange={handleInputChange}
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="message">Pesan *</Label>
                        <Textarea
                          id="message"
                          name="message"
                          placeholder="Tulis pesan Anda di sini..."
                          value={formData.message}
                          onChange={handleInputChange}
                          required
                          disabled={isSubmitting}
                          rows={6}
                        />
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Mengirim...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Kirim Pesan
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Contact Information */}
            <div>
              <div className="mb-8">
                <Badge variant="outline" className="mb-4 border-primary text-primary">
                  Informasi Kontak
                </Badge>
                <h2 className="text-3xl font-bold mb-4 text-foreground">
                  Temukan Kami
                </h2>
                <p className="text-lg text-muted-foreground">
                  Berbagai cara untuk menghubungi dan menemukan kami.
                </p>
              </div>

              <div className="space-y-6">
                {contactInfo.map((info, index) => {
                  const IconComponent = info.icon;
                  return (
                    <Card key={index} className="hover:shadow-lg transition-all duration-300">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-3">
                          <div className="bg-primary/10 p-2 rounded-lg">
                            <IconComponent className="w-5 h-5 text-primary" />
                          </div>
                          {info.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-1">
                          {info.details.map((detail, idx) => (
                            <p key={idx} className="text-muted-foreground">
                              {detail}
                            </p>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Map Placeholder */}
              <Card className="mt-6">
                <CardContent className="p-0">
                  <div 
                    className="w-full h-64 bg-muted rounded-lg flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors"
                    onClick={() => window.open('https://maps.google.com/?q=Way+Jepara+Lampung+Timur', '_blank')}
                  >
                    <div className="text-center">
                      <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground font-medium">Lihat di Google Maps</p>
                      <p className="text-sm text-muted-foreground">Klik untuk membuka peta</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;