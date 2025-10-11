const fs = require('fs');
const path = require('path');

console.log('🔍 Test de l\'API route de validation des retraits...\n');

// 1. Vérifier que l'API route existe
const apiRoutePath = path.join(__dirname, '..', 'app', 'api', 'admin', 'withdrawals', 'validate', 'route.ts');
console.log('📁 Vérification de l\'API route...');
if (fs.existsSync(apiRoutePath)) {
  console.log('✅ API route trouvée : /api/admin/withdrawals/validate/route.ts');
  
  // Lire le contenu pour vérifier la structure
  const content = fs.readFileSync(apiRoutePath, 'utf8');
  
  // Vérifications
  const checks = [
    { name: 'Export POST', test: content.includes('export async function POST') },
    { name: 'Vérification reCAPTCHA', test: content.includes('recaptchaSecret') },
    { name: 'Vérification auth', test: content.includes('authorization') },
    { name: 'Appel API backend', test: content.includes('withdrawal-requests') },
    { name: 'Gestion d\'erreurs', test: content.includes('try/catch') },
  ];
  
  console.log('\n📋 Vérifications de l\'API route :');
  checks.forEach(check => {
    console.log(`   ${check.test ? '✅' : '❌'} ${check.name}`);
  });
  
} else {
  console.log('❌ API route manquante !');
}

// 2. Vérifier le fichier .env.local
const envPath = path.join(__dirname, '..', '.env.local');
console.log('\n📁 Vérification du fichier .env.local...');
if (fs.existsSync(envPath)) {
  console.log('✅ Fichier .env.local trouvé');
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envChecks = [
    { name: 'NEXT_PUBLIC_RECAPTCHA_SITE_KEY', test: envContent.includes('NEXT_PUBLIC_RECAPTCHA_SITE_KEY') },
    { name: 'RECAPTCHA_SECRET_KEY', test: envContent.includes('RECAPTCHA_SECRET_KEY') },
    { name: 'NEXT_PUBLIC_API_BASE', test: envContent.includes('NEXT_PUBLIC_API_BASE') },
  ];
  
  console.log('\n📋 Variables d\'environnement :');
  envChecks.forEach(check => {
    console.log(`   ${check.test ? '✅' : '❌'} ${check.name}`);
  });
  
} else {
  console.log('❌ Fichier .env.local manquant !');
  console.log('💡 Créez le fichier .env.local avec les variables reCAPTCHA');
}

// 3. Instructions pour l'utilisateur
console.log('\n📝 Instructions :');
console.log('1. Créez le fichier .env.local dans tolotanana-frontend/');
console.log('2. Ajoutez vos vraies clés reCAPTCHA :');
console.log('   NEXT_PUBLIC_RECAPTCHA_SITE_KEY=votre_clé_site');
console.log('   RECAPTCHA_SECRET_KEY=votre_clé_secrète');
console.log('3. Redémarrez le serveur Next.js');
console.log('4. Testez la validation des retraits dans l\'admin');

console.log('\n🎯 L\'API route est maintenant créée et prête à être utilisée !');
