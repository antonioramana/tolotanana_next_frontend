import { NextRequest, NextResponse } from 'next/server';

const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4750';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { withdrawalId, action, captchaToken } = body;

    // Vérification des paramètres requis
    if (!withdrawalId || !action || !captchaToken) {
      return NextResponse.json(
        { error: 'Paramètres manquants' },
        { status: 400 }
      );
    }

    // Vérification de l'action
    if (!['approved', 'rejected'].includes(action)) {
      return NextResponse.json(
        { error: 'Action invalide' },
        { status: 400 }
      );
    }

    // Vérification reCAPTCHA
    const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
    if (!recaptchaSecret) {
      console.error('RECAPTCHA_SECRET_KEY manquant dans les variables d\'environnement');
      return NextResponse.json(
        { error: 'Configuration reCAPTCHA manquante' },
        { status: 500 }
      );
    }

    // Vérification du token reCAPTCHA
    const recaptchaResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${recaptchaSecret}&response=${captchaToken}`,
    });

    const recaptchaResult = await recaptchaResponse.json();
    
    if (!recaptchaResult.success) {
      console.error('Échec de la vérification reCAPTCHA:', recaptchaResult);
      return NextResponse.json(
        { error: 'Vérification reCAPTCHA échouée' },
        { status: 400 }
      );
    }

    // Vérification de l'autorisation
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Token d\'autorisation manquant' },
        { status: 401 }
      );
    }

    // Appel à l'API backend
    const response = await fetch(`${apiBase}/withdrawal-requests/${withdrawalId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify({ status: action }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erreur API backend:', response.status, errorText);
      return NextResponse.json(
        { error: `Erreur du serveur: ${response.status}` },
        { status: response.status }
      );
    }

    const result = await response.json();
    
    return NextResponse.json({
      success: true,
      message: `Retrait ${action === 'approved' ? 'approuvé' : 'rejeté'} avec succès`,
      data: result,
    });

  } catch (error) {
    console.error('Erreur lors de la validation du retrait:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
