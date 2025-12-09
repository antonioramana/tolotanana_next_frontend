import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    console.log('🔍 Validation don - Début de la requête');
    const body = await req.json();
    const { donationId, status } = body;
    
    console.log('📝 Données reçues:', { donationId, status });

    if (!donationId || !status) {
      console.log('❌ Données manquantes');
      return NextResponse.json(
        { message: 'Données de validation requises' },
        { status: 400 }
      );
    }

    if (!['completed', 'failed', 'pending'].includes(status)) {
      return NextResponse.json(
        { message: 'Statut de validation invalide' },
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
    
    let response: Response;
    try {
      response = await fetch(backendUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
        },
        body: JSON.stringify(validationData),
      });
    } catch (fetchErr: any) {
      console.error('❌ Appel backend impossible:', fetchErr);
      return NextResponse.json(
        { message: fetchErr?.message || 'Backend injoignable' },
        { status: 500 }
      );
    }

    console.log('📡 Réponse backend:', { status: response.status, ok: response.ok });

    const text = await response.text();
    let json: any = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = null;
    }

    if (!response.ok) {
      console.log('❌ Erreur backend:', { status: response.status, statusText: response.statusText, body: text });
      return NextResponse.json(
        {
          message: json?.message || response.statusText || 'Erreur lors de la validation du don',
          status: response.status,
          backendBody: json || text || null,
        },
        { status: response.status }
      );
    }

    console.log('✅ Succès backend:', json);
    return NextResponse.json(json ?? {});
  } catch (error: any) {
    console.error('Erreur validation don:', error);
    return NextResponse.json(
      { message: error.message || 'Erreur lors de la validation du don' },
      { status: 500 }
    );
  }
}

