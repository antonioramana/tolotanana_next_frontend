'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FiPercent, FiFileText, FiSettings, FiDollarSign, FiMessageSquare } from 'react-icons/fi';

export default function AdminSettingsPage() {
  const settingsCards = [
      {
        title: 'Frais de Plateforme',
        description: 'Gérer les pourcentages de frais appliqués aux donations',
        icon: FiPercent,
        href: '/admin/settings/platform-fees',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
      },
      {
        title: 'Témoignages',
        description: 'Gérer les témoignages affichés sur le site',
        icon: FiMessageSquare,
        href: '/admin/settings/testimonials',
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
      },
    {
      title: 'Informations Bancaires',
      description: 'Configurer les informations bancaires de la plateforme',
      icon: FiDollarSign,
      href: '/admin/settings/bank-info',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Conditions d\'Utilisation',
      description: 'Gérer les termes et conditions de la plateforme',
      icon: FiFileText,
      href: '/admin/settings/terms-of-service',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Paramètres d'Administration</h1>
        <p className="text-muted-foreground mt-2">
          Configurez les paramètres globaux de la plateforme
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {settingsCards.map((card) => {
          const IconComponent = card.icon;
          return (
            <Link key={card.href} href={card.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader className="p-4 sm:p-6">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 ${card.bgColor} rounded-lg flex items-center justify-center mb-3 sm:mb-4`}>
                    <IconComponent className={`h-5 w-5 sm:h-6 sm:w-6 ${card.color}`} />
                  </div>
                  <CardTitle className="text-lg sm:text-xl">{card.title}</CardTitle>
                  <CardDescription className="text-muted-foreground text-sm sm:text-base">
                    {card.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                    <FiSettings className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    Cliquez pour configurer
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}


