import { NextRequest, NextResponse } from 'next/server';
import { verifyRecaptcha } from '@/lib/verifyRecaptcha';
import { CampaignsApi } from '@/lib/api';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, targetAmount, categoryId, images, video, deadline, token } = body;

    if (!title || !description || !targetAmount || !categoryId || !deadline) {
      return NextResponse.json(
        { message: 'Tous les champs obligatoires sont requis' },
        { status: 400 }
      );
    }

    // Vérifier reCAPTCHA
    if (!token) {
      return NextResponse.json(
        { message: 'Vérification reCAPTCHA requise' },
        { status: 400 }
      );
    }

    // Créer un objet request compatible avec verifyRecaptcha
    const mockReq = {
      body: { token },
      query: {}
    } as any;

    const captcha = await verifyRecaptcha(mockReq);

    if (!captcha.success || (captcha.score !== undefined && captcha.score < 0.5)) {
      return NextResponse.json(
        {
          message: "reCAPTCHA verification failed",
          error: captcha.errorCodes || [],
        },
        { status: 400 }
      );
    }

    // Récupérer l'en-tête d'autorisation de la requête
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { message: 'Token d\'authentification requis' },
        { status: 401 }
      );
    }

    // Construire la payload pour le backend
    const campaignData = {
      title,
      description,
      targetAmount: Number(targetAmount),
      categoryId,
      images: images || [],
      video: video || undefined,
      deadline: new Date(deadline).toISOString(),
    };

    // Appeler directement l'API backend via notre client
    const created = await CampaignsApi.create(campaignData);

    return NextResponse.json(created);
  } catch (error: any) {
    console.error('Erreur création campagne (internal-api):', error);
    return NextResponse.json(
      { message: error.message || 'Erreur lors de la création de la campagne' },
      { status: 500 }
    );
  }
}


