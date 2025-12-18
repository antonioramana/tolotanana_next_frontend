import { NextRequest, NextResponse } from 'next/server';
import { verifyRecaptcha } from '@/lib/verifyRecaptcha';
import { AuthApi } from '@/lib/api';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, token } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email et mot de passe requis' },
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
          message: "La vérification reCAPTCHA a échoué. Veuillez cocher à nouveau la case reCAPTCHA.",
          error: captcha.errorCodes || [],
        },
        { status: 400 }
      );
    }

    // Appeler l'API backend existante
    const response = await AuthApi.login({ email, password });
    
    return NextResponse.json(response);
  } catch (error: any) {
    // Normaliser les erreurs pour le frontend
    console.error('Erreur login:', error);

    const rawMessage = typeof error?.message === 'string' ? error.message : '';
    let message = 'Erreur de connexion';
    let status = 500;

    // Si le backend renvoie un JSON sous forme de texte, essayons de le parser
    try {
      if (rawMessage.startsWith('{')) {
        const parsed = JSON.parse(rawMessage);
        if (parsed?.message) {
          // Ex: "Identifiants invalides"
          message = parsed.message;
        }
        if (typeof parsed?.statusCode === 'number') {
          status = parsed.statusCode;
        }
      }
    } catch {
      // On ignore les erreurs de parsing et on garde le message par défaut
    }

    // Mapping vers des messages plus clairs en français
    if (message.includes('Identifiants invalides')) {
      message = 'Email ou mot de passe incorrect. Vérifiez vos identifiants et réessayez.';
      status = 401;
    }

    return NextResponse.json(
      { message },
      { status }
    );
  }
}
