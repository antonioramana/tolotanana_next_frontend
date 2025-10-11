import { NextRequest, NextResponse } from 'next/server';
import { verifyRecaptcha } from '@/lib/verifyRecaptcha';

export async function POST(req: NextRequest) {
  try {
    console.log('🔍 Validation don - Début de la requête');
    const body = await req.json();
    const { donationId, status, token } = body;
    
    console.log('📝 Données reçues:', { donationId, status, hasToken: !!token });

    if (!donationId || !status) {
      console.log('❌ Données manquantes');
      return NextResponse.json(
        { message: 'Données de validation requises' },
        { status: 400 }
      );
    }

    if (!['completed', 'failed'].includes(status)) {
      return NextResponse.json(
        { message: 'Statut de validation invalide' },
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

    // Appeler l'API backend existante
    const validationData = {
      status,
    };

    // Appeler directement l'API backend
    const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4750';
    const backendUrl = `${apiBase}/donations/${donationId}`;
    
    console.log('🚀 Appel backend:', { url: backendUrl, method: 'PATCH', data: validationData });
    
    const response = await fetch(backendUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify(validationData),
    });

    console.log('📡 Réponse backend:', { status: response.status, ok: response.ok });

    if (!response.ok) {
      const errorData = await response.json();
      console.log('❌ Erreur backend:', errorData);
      throw new Error(errorData.message || 'Erreur lors de la validation du don');
    }

    const result = await response.json();
    console.log('✅ Succès backend:', result);
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Erreur validation don:', error);
    return NextResponse.json(
      { message: error.message || 'Erreur lors de la validation du don' },
      { status: 500 }
    );
  }
}

