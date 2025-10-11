import { NextRequest, NextResponse } from 'next/server';
import { verifyRecaptcha } from '@/lib/verifyRecaptcha';
import { AuthApi } from '@/lib/api';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, token } = body;

    console.log('🔍 Admin login - Debug info:');
    console.log('📝 Email:', email);
    console.log('📝 Password provided:', !!password);
    console.log('📝 Token provided:', !!token);
    console.log('📝 Token length:', token?.length);

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email et mot de passe requis' },
        { status: 400 }
      );
    }

    // Vérifier reCAPTCHA
    if (!token) {
      console.log('❌ No reCAPTCHA token provided');
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

    console.log('📝 Verifying reCAPTCHA...');
    const captcha = await verifyRecaptcha(mockReq);

    console.log('📝 reCAPTCHA verification result:', {
      success: captcha.success,
      score: captcha.score,
      errorCodes: captcha.errorCodes
    });

    if (!captcha.success || (captcha.score !== undefined && captcha.score < 0.5)) {
      console.log('❌ reCAPTCHA verification failed');
      return NextResponse.json(
        {
          message: "reCAPTCHA verification failed",
          error: captcha.errorCodes || [],
        },
        { status: 400 }
      );
    }

    // Appeler l'API backend existante
    const response = await AuthApi.login({ email, password });
    
    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Erreur login admin:', error);
    return NextResponse.json(
      { message: error.message || 'Erreur de connexion' },
      { status: 500 }
    );
  }
}

