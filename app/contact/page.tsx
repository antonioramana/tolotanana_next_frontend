'use client';

import { useState } from 'react';
import { PublicContactApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FiMail, FiUser, FiMessageSquare, FiSend, FiPhone, FiMapPin, FiClock } from 'react-icons/fi';
import ResponsiveReCAPTCHA from '@/components/ui/responsive-recaptcha';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs',
        variant: 'destructive',
      });
      return;
    }

    if (!captchaToken) {
      toast({
        title: 'Vérification requise',
        description: 'Veuillez vérifier le reCAPTCHA avant d\'envoyer le message.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Utiliser la nouvelle API avec protection reCAPTCHA
      const response = await fetch('/api/contact/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          token: captchaToken
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de l\'envoi du message');
      }

      const result = await response.json();
      
      toast({
        title: 'Message envoyé !',
        description: result.message,
      });

      // Réinitialiser le formulaire
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Erreur lors de l\'envoi du message',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Contactez-nous
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Vous avez une question, une suggestion ou besoin d'aide ? 
              N'hésitez pas à nous contacter, nous vous répondrons dans les plus brefs délais.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Informations de contact */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FiMail className="h-5 w-5 text-orange-600" />
                    Informations de Contact
                  </CardTitle>
                  <CardDescription>
                    Plusieurs moyens pour nous joindre
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-start gap-3">
                    <FiMail className="h-5 w-5 text-orange-600 mt-1" />
                    <div>
                      <h3 className="font-medium text-gray-900">Email</h3>
                      <p className="text-gray-600">contact@tolotanana.com</p>
                      <p className="text-gray-600">support@tolotanana.com</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <FiPhone className="h-5 w-5 text-orange-600 mt-1" />
                    <div>
                      <h3 className="font-medium text-gray-900">Téléphone</h3>
                      <p className="text-gray-600">+261 34 12 345 67</p>
                      <p className="text-gray-600">+261 33 98 765 43</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <FiMapPin className="h-5 w-5 text-orange-600 mt-1" />
                    <div>
                      <h3 className="font-medium text-gray-900">Adresse</h3>
                      <p className="text-gray-600">
                        123 Avenue de l'Indépendance<br />
                        Antananarivo 101<br />
                        Madagascar
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <FiClock className="h-5 w-5 text-orange-600 mt-1" />
                    <div>
                      <h3 className="font-medium text-gray-900">Horaires</h3>
                      <p className="text-gray-600">
                        Lundi - Vendredi: 8h00 - 17h00<br />
                        Samedi: 8h00 - 12h00<br />
                        Dimanche: Fermé
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Formulaire de contact */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FiMessageSquare className="h-5 w-5 text-orange-600" />
                    Envoyez-nous un message
                  </CardTitle>
                  <CardDescription>
                    Remplissez le formulaire ci-dessous et nous vous répondrons rapidement
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">
                          <FiUser className="inline mr-2 h-4 w-4" />
                          Nom complet *
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Votre nom complet"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">
                          <FiMail className="inline mr-2 h-4 w-4" />
                          Email *
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="votre.email@example.com"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="subject">
                        <FiMessageSquare className="inline mr-2 h-4 w-4" />
                        Sujet *
                      </Label>
                      <Input
                        id="subject"
                        name="subject"
                        type="text"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="Sujet de votre message"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="message">
                        <FiMessageSquare className="inline mr-2 h-4 w-4" />
                        Message *
                      </Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Décrivez votre demande en détail..."
                        rows={6}
                        required
                      />
                    </div>

                    {/* reCAPTCHA */}
                    <div className="flex justify-center">
                      <ResponsiveReCAPTCHA
                        sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
                        onChange={(token: string | null) => setCaptchaToken(token)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">
                        * Champs obligatoires
                      </p>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-orange-600 hover:bg-orange-700"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Envoi en cours...
                          </>
                        ) : (
                          <>
                            <FiSend className="mr-2 h-4 w-4" />
                            Envoyer le message
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-16">
            <Card>
              <CardHeader>
                <CardTitle>Questions Fréquentes</CardTitle>
                <CardDescription>
                  Trouvez rapidement des réponses aux questions les plus courantes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">
                      Comment créer une campagne ?
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Inscrivez-vous, accédez à votre tableau de bord et cliquez sur "Nouvelle campagne". 
                      Suivez les étapes pour configurer votre campagne.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">
                      Quels sont les frais de plateforme ?
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Les frais de plateforme sont variables et affichés lors de chaque don. 
                      Ils couvrent les coûts de fonctionnement et de sécurité.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">
                      Comment retirer mes fonds ?
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Accédez à la section "Retraits" de votre tableau de bord, 
                      configurez vos informations bancaires et demandez un retrait.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">
                      Délai de réponse ?
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Nous nous efforçons de répondre à tous les messages dans les 24-48 heures 
                      pendant les jours ouvrables.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}