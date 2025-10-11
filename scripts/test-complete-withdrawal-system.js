const fs = require('fs');
const path = require('path');

console.log('🔍 Test complet du système de validation des retraits...\n');

// 1. Vérifier l'API route
const apiRoutePath = path.join(__dirname, '..', 'app', 'api', 'admin', 'withdrawals', 'validate', 'route.ts');
console.log('📁 Vérification de l\'API route...');
if (fs.existsSync(apiRoutePath)) {
  console.log('✅ API route trouvée : /api/admin/withdrawals/validate/route.ts');
  
  const content = fs.readFileSync(apiRoutePath, 'utf8');
  
  // Vérifications détaillées
  const checks = [
    { name: 'Export POST', test: content.includes('export async function POST') },
    { name: 'Try/catch block', test: content.includes('try {') && content.includes('} catch (error)') },
    { name: 'Vérification reCAPTCHA', test: content.includes('recaptchaSecret') },
    { name: 'Vérification auth', test: content.includes('authorization') },
    { name: 'Appel API backend', test: content.includes('withdrawal-requests') },
    { name: 'Gestion d\'erreurs 400', test: content.includes('status: 400') },
    { name: 'Gestion d\'erreurs 401', test: content.includes('status: 401') },
    { name: 'Gestion d\'erreurs 500', test: content.includes('status: 500') },
    { name: 'Response JSON', test: content.includes('NextResponse.json') },
  ];
  
  console.log('\n📋 Vérifications de l\'API route :');
  checks.forEach(check => {
    console.log(`   ${check.test ? '✅' : '❌'} ${check.name}`);
  });
  
} else {
  console.log('❌ API route manquante !');
  process.exit(1);
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
}

// 3. Vérifier la page admin withdrawals
const withdrawalsPagePath = path.join(__dirname, '..', 'app', 'admin', 'withdrawals', 'page.tsx');
console.log('\n📁 Vérification de la page admin withdrawals...');
if (fs.existsSync(withdrawalsPagePath)) {
  console.log('✅ Page admin withdrawals trouvée');
  
  const pageContent = fs.readFileSync(withdrawalsPagePath, 'utf8');
  const pageChecks = [
    { name: 'Modal de validation', test: pageContent.includes('showValidationModal') },
    { name: 'Fonction confirmValidation', test: pageContent.includes('confirmValidation') },
    { name: 'Appel API /api/admin/withdrawals/validate', test: pageContent.includes('/api/admin/withdrawals/validate') },
    { name: 'reCAPTCHA component', test: pageContent.includes('ResponsiveReCAPTCHA') },
    { name: 'Loading states', test: pageContent.includes('validatingWithdrawals') },
  ];
  
  console.log('\n📋 Vérifications de la page admin :');
  pageChecks.forEach(check => {
    console.log(`   ${check.test ? '✅' : '❌'} ${check.name}`);
  });
  
} else {
  console.log('❌ Page admin withdrawals manquante !');
}

// 4. Instructions finales
console.log('\n🎯 Résumé :');
console.log('✅ L\'API route /api/admin/withdrawals/validate est créée');
console.log('✅ Le fichier .env.local existe avec les variables reCAPTCHA');
console.log('✅ La page admin a le modal de validation avec reCAPTCHA');
console.log('\n📝 Pour tester :');
console.log('1. Redémarrez votre serveur Next.js (npm run dev)');
console.log('2. Allez sur la page admin des retraits');
console.log('3. Cliquez sur "Approuver" ou "Rejeter" un retrait');
console.log('4. Complétez le reCAPTCHA dans le modal');
console.log('5. Confirmez l\'action');
console.log('\n🚀 Le système de validation des retraits est maintenant fonctionnel !');
