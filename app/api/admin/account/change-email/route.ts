import { NextRequest, NextResponse } from 'next/server';
import { verifyRecaptcha } from '@/lib/verifyRecaptcha';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { newEmail, currentPassword, token } = body;

    if (!newEmail || !currentPassword) {
      return NextResponse.json(
        { message: 'Tous les champs sont requis' },
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
    const changeEmailData = {
      newEmail,
      currentPassword,
    };

    // Appeler directement l'API backend
    const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4750';
    const response = await fetch(`${apiBase}/users/change-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify(changeEmailData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erreur lors du changement d\'email');
    }

    const result = await response.json();
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Erreur changement email:', error);
    return NextResponse.json(
      { message: error.message || 'Erreur lors du changement d\'email' },
      { status: 500 }
    );
  }
}

