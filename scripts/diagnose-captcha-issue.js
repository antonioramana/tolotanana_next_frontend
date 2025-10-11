const fs = require('fs');
const path = require('path');

console.log('🔍 Diagnostic complet du problème captcha...\n');

// 1. Vérifier les fichiers d'environnement
console.log('📄 1. Vérification des fichiers d\'environnement:');
const envLocalPath = path.join(__dirname, '../.env.local');
const envPath = path.join(__dirname, '../.env');

let envLocalContent = '';
let envContent = '';

if (fs.existsSync(envLocalPath)) {
  envLocalContent = fs.readFileSync(envLocalPath, 'utf8');
  console.log('✅ .env.local trouvé');
} else {
  console.log('❌ .env.local non trouvé');
}

if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
  console.log('✅ .env trouvé');
} else {
  console.log('❌ .env non trouvé');
}

// 2. Extraire les clés
const allContent = envLocalContent + '\n' + envContent;
const siteKeyMatch = allContent.match(/NEXT_PUBLIC_RECAPTCHA_SITE_KEY=(.+)/);
const secretKeyMatch = allContent.match(/RECAPTCHA_SECRET_KEY=(.+)/);

const siteKey = siteKeyMatch ? siteKeyMatch[1].trim() : null;
const secretKey = secretKeyMatch ? secretKeyMatch[1].trim() : null;

console.log(`📝 Site Key: ${siteKey ? siteKey.substring(0, 15) + '...' : 'NON_DEFINI'}`);
console.log(`📝 Secret Key: ${secretKey ? secretKey.substring(0, 15) + '...' : 'NON_DEFINI'}`);

// 3. Vérifier le format
const isValidSiteKey = siteKey && siteKey.startsWith('6Lf') && siteKey.length > 20;
const isValidSecretKey = secretKey && secretKey.startsWith('6Lf') && secretKey.length > 20;

console.log(`✅ Format Site Key: ${isValidSiteKey ? '✓' : '✗'}`);
console.log(`✅ Format Secret Key: ${isValidSecretKey ? '✓' : '✗'}`);

// 4. Vérifier les fichiers de code
console.log('\n📄 2. Vérification des fichiers de code:');

// Vérifier auth-modal.tsx
const authModalPath = path.join(__dirname, '../components/layout/auth-modal.tsx');
if (fs.existsSync(authModalPath)) {
  const authModalContent = fs.readFileSync(authModalPath, 'utf8');
  const hasCaptcha = authModalContent.includes('ResponsiveReCAPTCHA');
  const hasTokenCheck = authModalContent.includes('disabled={isLoading || !token}');
  const hasTokenValidation = authModalContent.includes('if (!token)');
  
  console.log('✅ auth-modal.tsx trouvé');
  console.log(`📝 ResponsiveReCAPTCHA utilisé: ${hasCaptcha ? '✓' : '✗'}`);
  console.log(`📝 Bouton désactivé si !token: ${hasTokenCheck ? '✓' : '✗'}`);
  console.log(`📝 Validation token côté client: ${hasTokenValidation ? '✓' : '✗'}`);
} else {
  console.log('❌ auth-modal.tsx non trouvé');
}

// Vérifier ResponsiveReCAPTCHA
const recaptchaPath = path.join(__dirname, '../components/ui/responsive-recaptcha.tsx');
if (fs.existsSync(recaptchaPath)) {
  const recaptchaContent = fs.readFileSync(recaptchaPath, 'utf8');
  const hasSitekeyCheck = recaptchaContent.includes('if (!sitekey)');
  const hasErrorDisplay = recaptchaContent.includes('reCAPTCHA non configuré');
  
  console.log('✅ ResponsiveReCAPTCHA.tsx trouvé');
  console.log(`📝 Vérification sitekey: ${hasSitekeyCheck ? '✓' : '✗'}`);
  console.log(`📝 Affichage erreur si sitekey manquante: ${hasErrorDisplay ? '✓' : '✗'}`);
} else {
  console.log('❌ ResponsiveReCAPTCHA.tsx non trouvé');
}

// Vérifier la route API
const apiRoutePath = path.join(__dirname, '../app/api/auth/register/route.ts');
if (fs.existsSync(apiRoutePath)) {
  const apiRouteContent = fs.readFileSync(apiRoutePath, 'utf8');
  const hasTokenValidation = apiRouteContent.includes('if (!token)');
  const hasRecaptchaVerification = apiRouteContent.includes('verifyRecaptcha');
  
  console.log('✅ API route register trouvée');
  console.log(`📝 Validation token côté serveur: ${hasTokenValidation ? '✓' : '✗'}`);
  console.log(`📝 Vérification reCAPTCHA: ${hasRecaptchaVerification ? '✓' : '✗'}`);
} else {
  console.log('❌ API route register non trouvée');
}

// 5. Diagnostic du problème
console.log('\n🔍 3. Diagnostic du problème:');

if (!siteKey) {
  console.log('❌ PROBLÈME IDENTIFIÉ: Site Key reCAPTCHA non définie');
  console.log('💡 SOLUTION: Ajoutez NEXT_PUBLIC_RECAPTCHA_SITE_KEY dans .env.local');
} else if (!isValidSiteKey) {
  console.log('❌ PROBLÈME IDENTIFIÉ: Format Site Key incorrect');
  console.log('💡 SOLUTION: Vérifiez que la clé commence par "6Lf" et fait plus de 20 caractères');
} else {
  console.log('✅ Site Key correcte détectée');
  
  // Vérifier si le problème vient du composant
  if (fs.existsSync(recaptchaPath)) {
    const recaptchaContent = fs.readFileSync(recaptchaPath, 'utf8');
    if (recaptchaContent.includes('if (!sitekey)')) {
      console.log('⚠️ PROBLÈME POTENTIEL: Le composant ResponsiveReCAPTCHA affiche une erreur si sitekey manquante');
      console.log('💡 SOLUTION: Vérifiez que la variable d\'environnement est accessible côté client');
    }
  }
}

// 6. Solutions recommandées
console.log('\n💡 4. Solutions recommandées:');
console.log('1. Redémarrez le serveur Next.js après modification des variables d\'environnement');
console.log('2. Vérifiez que NEXT_PUBLIC_RECAPTCHA_SITE_KEY est bien définie dans .env.local');
console.log('3. Testez avec la page /debug-captcha pour diagnostiquer le problème');
console.log('4. Vérifiez la console du navigateur pour les erreurs JavaScript');
console.log('5. Assurez-vous que le domaine est autorisé dans la configuration reCAPTCHA');

console.log('\n✅ Diagnostic terminé !');
