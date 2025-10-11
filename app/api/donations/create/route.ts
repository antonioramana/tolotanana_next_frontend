import { NextRequest, NextResponse } from 'next/server';
import { verifyRecaptcha } from '@/lib/verifyRecaptcha';
import { DonationsApi } from '@/lib/api';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { campaignId, amount, message, donorName, isAnonymous, paymentMethod, token } = body;

    if (!campaignId || !amount || !paymentMethod) {
      return NextResponse.json(
        { message: 'Données de don requises' },
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

    // Récupérer l'en-tête d'autorisation de la requête (optionnel pour les dons)
    const authHeader = req.headers.get('authorization');
    
    // Appeler l'API backend existante
    const donationData = {
      campaignId,
      amount: parseFloat(amount),
      message: message || undefined,
      donorName: isAnonymous ? undefined : donorName?.trim(),
      isAnonymous,
      paymentMethod,
    };

    // Appeler directement l'API backend
    const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4750';
    const response = await fetch(`${apiBase}/donations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { 'Authorization': authHeader } : {}),
      },
      body: JSON.stringify(donationData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erreur lors de la création du don');
    }

    const result = await response.json();
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Erreur création don:', error);
    return NextResponse.json(
      { message: error.message || 'Erreur lors de la création du don' },
      { status: 500 }
    );
  }
}
