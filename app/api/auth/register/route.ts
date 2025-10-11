import { NextRequest, NextResponse } from 'next/server';
import { verifyRecaptcha } from '@/lib/verifyRecaptcha';
import { AuthApi } from '@/lib/api';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, password, role, phone, token } = body;

    console.log('🔍 Register - Debug info:');
    console.log('📝 First name:', firstName);
    console.log('📝 Last name:', lastName);
    console.log('📝 Email:', email);
    console.log('📝 Role:', role);
    console.log('📝 Phone:', phone);
    console.log('📝 Password provided:', !!password);
    console.log('📝 Token provided:', !!token);
    console.log('📝 Token length:', token?.length);

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { message: 'Tous les champs obligatoires sont requis' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Le mot de passe doit contenir au moins 6 caractères' },
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
    const response = await AuthApi.register({
      firstName,
      lastName,
      email,
      password,
      role: role || 'demandeur',
      phone: phone || undefined,
    });
    
    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Erreur register:', error);
    return NextResponse.json(
      { message: error.message || 'Erreur lors de la création du compte' },
      { status: 500 }
    );
  }
}
