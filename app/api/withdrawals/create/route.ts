import { NextRequest, NextResponse } from 'next/server';
import { verifyRecaptcha } from '@/lib/verifyRecaptcha';
import { WithdrawalsApi } from '@/lib/api';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { campaignId, amount, bankInfoId, justification, documents, password, token } = body;

    if (!campaignId || !amount || !bankInfoId || !justification) {
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

    // Appeler l'API backend existante avec l'autorisation
    const withdrawalData = {
      campaignId,
      amount: parseFloat(amount),
      bankInfoId,
      justification,
      documents: documents || [],
      password: password || undefined,
    };

    // Appeler directement l'API backend avec l'en-tête d'autorisation
    const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4750';
    const response = await fetch(`${apiBase}/withdrawal-requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify(withdrawalData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erreur lors de la création de la demande de retrait');
    }

    const result = await response.json();
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Erreur création demande de retrait:', error);
    return NextResponse.json(
      { message: error.message || 'Erreur lors de la création de la demande de retrait' },
      { status: 500 }
    );
  }
}
