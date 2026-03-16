import { NextRequest, NextResponse } from 'next/server';
import { verifyRecaptcha } from '@/lib/verifyRecaptcha';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, userData, token, adminPassword } = body;
    

    if (!userId || !userData) {
      return NextResponse.json(
        { message: 'Données de modification requises' },
        { status: 400 }
      );
    }

    // Vérifier reCAPTCHA seulement si un token est fourni
    if (token) {
      
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
      
    } else {
    }

    // Récupérer l'en-tête d'autorisation de la requête
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { message: 'Token d\'authentification requis' },
        { status: 401 }
      );
    }

    // Récupérer les données originales de l'utilisateur pour comparer
    const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4750';
    const getUserResponse = await fetch(`${apiBase}/users/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
      },
    });

    if (!getUserResponse.ok) {
      return NextResponse.json(
        { message: 'Impossible de récupérer les données utilisateur' },
        { status: 400 }
      );
    }

    const originalUser = await getUserResponse.json();

    // Vérifier si le rôle change réellement
    const roleChanged = userData.role && userData.role !== originalUser.role;
    
    if (roleChanged && !adminPassword) {
      return NextResponse.json(
        { message: 'Mot de passe administrateur requis pour modifier le rôle' },
        { status: 400 }
      );
    }

    // Vérifier le mot de passe admin si le rôle change
    if (roleChanged && adminPassword) {
      
      // Récupérer l'ID de l'admin depuis le token JWT
      const tokenPayload = JSON.parse(atob(authHeader.split('.')[1]));
      const adminId = tokenPayload.sub;
      
      // Vérifier le mot de passe admin
      const passwordCheckResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4750'}/auth/verify-admin-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
        },
        body: JSON.stringify({
          adminId,
          password: adminPassword
        }),
      });

      if (!passwordCheckResponse.ok) {
        return NextResponse.json(
          { message: 'Mot de passe administrateur incorrect' },
          { status: 401 }
        );
      }
      
    }

    // Appeler l'API backend existante pour la mise à jour
    const backendUrl = `${apiBase}/users/${userId}`;
    
    
    const response = await fetch(backendUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify(userData),
    });


    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erreur lors de la modification de l\'utilisateur');
    }

    const result = await response.json();
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Erreur modification utilisateur:', error);
    return NextResponse.json(
      { message: error.message || 'Erreur lors de la modification de l\'utilisateur' },
      { status: 500 }
    );
  }
}
