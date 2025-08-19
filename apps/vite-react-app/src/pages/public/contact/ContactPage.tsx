import { useState } from 'react';
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent} from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Label } from "@workspace/ui/components/label";
import {
  Send,
  CheckCircle,
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
  const { error, success } = useToast()

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
      error({ title: 'Semua field harus diisi' });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      error({ title: 'Format email tidak valid' });
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

      success({ title: 'Pesan berhasil dikirim! Kami akan segera merespons.' });
    } catch (error) {
      console.error('Error submitting message:', error);
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


      {/* Contact Section */}
      <section className="py-16">
        <div className="px-4 max-w-screen-xl lg:px-8 mx-auto px-4">
          <div className="flex flex-col gap-12">
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
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;