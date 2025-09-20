import { User, Campaign, Donation, WithdrawalRequest, CampaignUpdate } from '@/types';

export const fakeUsers: User[] = [
  {
    id: '1',
    email: 'admin@tolotanana.com',
    firstName: 'Admin',
    lastName: 'System',
    role: 'admin',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    phone: '+261 34 12 345 67',
    createdAt: '2024-01-01',
    isVerified: true,
  },
  {
    id: '2',
    email: 'marie@gmail.com',
    firstName: 'Marie',
    lastName: 'Rasoanirina',
    role: 'demandeur',
    avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    phone: '+261 34 11 222 33',
    createdAt: '2024-01-15',
    isVerified: true,
    bankInfo: [{
      id: '1',
      type: 'mobile_money',
      accountNumber: '0341122233',
      accountName: 'Marie Rasoanirina',
      provider: 'Orange Money',
      isDefault: true,
    }],
  },
  {
    id: '3',
    email: 'jean@gmail.com',
    firstName: 'Jean',
    lastName: 'Rakotomalala',
    role: 'demandeur',
    avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    phone: '+261 33 44 555 66',
    createdAt: '2024-02-01',
    isVerified: false,
  },
];

export const fakeCampaigns: Campaign[] = [
  {
    id: '1',
    title: 'Aide pour les frais médicaux de ma fille',
    description: 'Ma fille de 8 ans a besoin d\'une opération urgente du cœur. Les frais médicaux s\'élèvent à 50 000 000 Ar. Votre aide nous sera précieuse pour sauver sa vie.',
    targetAmount: 50000000,
    currentAmount: 32500000,
    category: 'Santé',
    images: [
      'https://images.pexels.com/photos/236380/pexels-photo-236380.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/263402/pexels-photo-263402.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
    video: 'https://youtu.be/ysz5S6PUM-U',
    deadline: '2024-06-30',
    createdAt: '2024-01-20',
    status: 'active',
    createdBy: '2',
    createdByName: 'Marie Rasoanirina',
    rating: 4.8,
    totalDonors: 156,
    isVerified: true,
    updates: [
      {
        id: '1',
        title: 'Merci pour votre soutien !',
        content: 'Grâce à vous, nous avons atteint 65% de notre objectif. L\'opération est prévue pour le mois prochain.',
        createdAt: '2024-03-15',
      }
    ],
  },
  {
    id: '2',
    title: 'Construction d\'une école rurale à Antsirabe',
    description: 'Nous souhaitons construire une école primaire pour 200 enfants dans un village rural près d\'Antsirabe. Le projet inclut 6 salles de classe, une bibliothèque et des sanitaires.',
    targetAmount: 80000000,
    currentAmount: 28000000,
    category: 'Éducation',
    images: [
      'https://images.pexels.com/photos/159844/cellular-education-classroom-159844.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1454360/pexels-photo-1454360.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
    video: 'https://www.w3schools.com/html/mov_bbb.mp4',
    deadline: '2024-12-31',
    createdAt: '2024-02-10',
    status: 'active',
    createdBy: '3',
    createdByName: 'Jean Rakotomalala',
    rating: 4.6,
    totalDonors: 89,
    isVerified: true,
    updates: [],
  },
  {
    id: '3',
    title: 'Aide d\'urgence après cyclone',
    description: 'Les familles de notre village ont tout perdu lors du dernier cyclone. Nous avons besoin d\'aide pour reconstruire les maisons et fournir des vivres.',
    targetAmount: 30000000,
    currentAmount: 45000000,
    category: 'Urgence',
    images: [
      'https://images.pexels.com/photos/1309899/pexels-photo-1309899.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
    deadline: '2024-05-15',
    createdAt: '2024-03-01',
    status: 'completed',
    createdBy: '2',
    createdByName: 'Marie Rasoanirina',
    rating: 4.9,
    totalDonors: 234,
    isVerified: true,
    updates: [
      {
        id: '2',
        title: 'Objectif atteint !',
        content: 'Grâce à votre générosité extraordinaire, nous avons dépassé notre objectif de 150% !',
        createdAt: '2024-04-20',
      }
    ],
  },
];

export const fakeDonations: Donation[] = [
  {
    id: '1',
    campaignId: '1',
    campaignTitle: 'Aide pour les frais médicaux de ma fille',
    donorId: '3',
    donorName: 'Jean Rakotomalala',
    amount: 500000,
    message: 'Bon courage, j\'espère que tout ira bien.',
    isAnonymous: false,
    paymentMethod: 'Orange Money',
    createdAt: '2024-03-20',
    status: 'completed',
  },
  {
    id: '2',
    campaignId: '1',
    campaignTitle: 'Aide pour les frais médicaux de ma fille',
    donorName: 'Donateur Anonyme',
    amount: 1000000,
    isAnonymous: true,
    paymentMethod: 'Mvola',
    createdAt: '2024-03-19',
    status: 'completed',
  },
  {
    id: '3',
    campaignId: '2',
    campaignTitle: 'Construction d\'une école rurale à Antsirabe',
    donorName: 'Sarah Randriamampianina',
    amount: 2000000,
    message: 'Très beau projet pour l\'éducation des enfants !',
    isAnonymous: false,
    paymentMethod: 'Airtel Money',
    createdAt: '2024-03-18',
    status: 'completed',
  },
];

export const fakeWithdrawals: WithdrawalRequest[] = [
  {
    id: '1',
    campaignId: '3',
    campaignTitle: 'Aide d\'urgence après cyclone',
    requestedBy: '2',
    amount: 45000000,
    bankInfo: {
      id: '1',
      type: 'mobile_money',
      accountNumber: '0341122233',
      accountName: 'Marie Rasoanirina',
      provider: 'Orange Money',
      isDefault: true,
    },
    justification: 'Campagne terminée avec succès, fonds nécessaires pour l\'achat de matériaux de construction',
    documents: ['facture_materiaux.pdf', 'devis_construction.pdf'],
    status: 'approved',
    createdAt: '2024-04-21',
    processedAt: '2024-04-22',
    processedBy: '1',
    notes: 'Documents vérifiés, demande approuvée',
  },
  {
    id: '2',
    campaignId: '1',
    campaignTitle: 'Aide pour les frais médicaux de ma fille',
    requestedBy: '2',
    amount: 25000000,
    bankInfo: {
      id: '1',
      type: 'mobile_money',
      accountNumber: '0341122233',
      accountName: 'Marie Rasoanirina',
      provider: 'Orange Money',
      isDefault: true,
    },
    justification: 'Premier versement pour couvrir les frais pré-opératoires',
    documents: ['devis_medical.pdf'],
    status: 'pending',
    createdAt: '2024-04-25',
  },
];

export const categories = [
  'Santé',
  'Éducation',
  'Urgence',
  'Environnement',
  'Sport',
  'Culture',
  'Technologie',
  'Communauté',
];

export const paymentMethods = [
  'Orange Money',
  'Mvola',
  'Airtel Money',
  'Carte bancaire',
  'Virement bancaire',
];

// Informations de paiement réutilisables (affichées dans le modal de don)
export const paymentInfos = {
  bank: [
    {
      bankName: 'BFV-SG',
      accountName: 'Association TOLOTANANA',
      accountNumber: '00000 000 000',
      iban: 'MG00 0000 0000 0000 0000 0000',
      swift: 'BFVSMGMG',
    },
  ],
  mobileMoney: [
    {
      provider: 'Orange Money',
      accountNumber: '034 11 222 33',
      accountName: 'TOLOTANANA',
    },
    {
      provider: 'Mvola',
      accountNumber: '032 12 345 67',
      accountName: 'TOLOTANANA',
    },
    {
      provider: 'Airtel Money',
      accountNumber: '033 44 555 66',
      accountName: 'TOLOTANANA',
    },
  ],
  note:
    "Important: vérifiez toujours le nom du bénéficiaire avant de valider. Conservez votre reçu et la référence de transaction pour tout suivi.",
} as const;

// Données de témoignages
export const testimonials = [
  {
    id: '1',
    name: 'Marie Rasoanirina',
    role: 'Bénéficiaire',
    avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    content: 'Grâce à TOLOTANANA, j\'ai pu collecter les fonds nécessaires pour l\'opération de ma fille. La plateforme est simple à utiliser et la communauté est incroyablement généreuse. Merci à tous !',
    rating: 5,
    campaign: 'Aide pour les frais médicaux de ma fille',
  },
  {
    id: '2',
    name: 'Jean Rakotomalala',
    role: 'Créateur de campagne',
    avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    content: 'TOLOTANANA m\'a permis de réaliser mon rêve de construire une école dans mon village. Le processus est transparent et l\'équipe est très professionnelle. Je recommande vivement !',
    rating: 5,
    campaign: 'Construction d\'une école rurale à Antsirabe',
  },
  {
    id: '3',
    name: 'Sarah Andriamalala',
    role: 'Donatrice',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    content: 'J\'adore utiliser TOLOTANANA pour soutenir des causes qui me tiennent à cœur. C\'est rassurant de voir l\'impact direct de mes dons et de suivre les progrès des campagnes.',
    rating: 5,
    campaign: 'Donatrice régulière',
  },
  {
    id: '4',
    name: 'Pierre Randrianarivo',
    role: 'Bénéficiaire',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    content: 'Après le cyclone, TOLOTANANA nous a aidés à reconstruire notre maison. La solidarité de la communauté malgache est extraordinaire. Cette plateforme change vraiment des vies.',
    rating: 5,
    campaign: 'Reconstruction après cyclone',
  },
  {
    id: '5',
    name: 'Lucie Ratsimba',
    role: 'Donatrice',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    content: 'Je donne régulièrement sur TOLOTANANA car je sais que chaque ariary va directement aux personnes dans le besoin. La transparence et la confiance sont essentielles pour moi.',
    rating: 5,
    campaign: 'Donatrice fidèle',
  },
  {
    id: '6',
    name: 'Marc Ravelojaona',
    role: 'Créateur de campagne',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    content: 'TOLOTANANA m\'a aidé à financer mon projet de bibliothèque mobile. L\'équipe m\'a accompagné à chaque étape et les donateurs sont très engagés. Une expérience exceptionnelle !',
    rating: 5,
    campaign: 'Bibliothèque mobile pour enfants',
  },
];