const fs = require('fs');
const path = require('path');

console.log('🔍 Vérification de la configuration reCAPTCHA...\n');

// Fonction pour vérifier la configuration
function checkRecaptchaConfig() {
  console.log('📄 Vérification des fichiers d\'environnement:');
  
  // Vérifier .env.local
  const envLocalPath = path.join(__dirname, '../.env.local');
  let envLocalContent = '';
  
  if (fs.existsSync(envLocalPath)) {
    envLocalContent = fs.readFileSync(envLocalPath, 'utf8');
    console.log('✅ Fichier .env.local trouvé');
  } else {
    console.log('❌ Fichier .env.local non trouvé');
  }
  
  // Vérifier .env
  const envPath = path.join(__dirname, '../.env');
  let envContent = '';
  
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
    console.log('✅ Fichier .env trouvé');
  } else {
    console.log('❌ Fichier .env non trouvé');
  }
  
  // Vérifier les variables reCAPTCHA
  const allContent = envLocalContent + '\n' + envContent;
  
  const hasSiteKey = allContent.includes('NEXT_PUBLIC_RECAPTCHA_SITE_KEY');
  const hasSecretKey = allContent.includes('RECAPTCHA_SECRET_KEY');
  
  console.log(`✅ NEXT_PUBLIC_RECAPTCHA_SITE_KEY: ${hasSiteKey ? '✓' : '✗'}`);
  console.log(`✅ RECAPTCHA_SECRET_KEY: ${hasSecretKey ? '✓' : '✗'}`);
  
  // Extraire les valeurs
  const siteKeyMatch = allContent.match(/NEXT_PUBLIC_RECAPTCHA_SITE_KEY=(.+)/);
  const secretKeyMatch = allContent.match(/RECAPTCHA_SECRET_KEY=(.+)/);
  
  const siteKey = siteKeyMatch ? siteKeyMatch[1].trim() : 'Non défini';
  const secretKey = secretKeyMatch ? secretKeyMatch[1].trim() : 'Non défini';
  
  console.log(`📝 Site Key: ${siteKey}`);
  console.log(`📝 Secret Key: ${secretKey}`);
  
  // Vérifier le format des clés
  const isValidSiteKey = siteKey.startsWith('6Lf') && siteKey.length > 20;
  const isValidSecretKey = secretKey.startsWith('6Lf') && secretKey.length > 20;
  
  console.log(`✅ Format Site Key: ${isValidSiteKey ? '✓' : '✗'}`);
  console.log(`✅ Format Secret Key: ${isValidSecretKey ? '✓' : '✗'}`);
  
  return {
    hasSiteKey,
    hasSecretKey,
    siteKey,
    secretKey,
    isValidSiteKey,
    isValidSecretKey
  };
}

// Fonction pour vérifier l'utilisation dans le code
function checkRecaptchaUsage() {
  console.log('\n📄 Vérification de l\'utilisation dans le code:');
  
  // Vérifier le composant ResponsiveReCAPTCHA
  const recaptchaPath = path.join(__dirname, '../components/ui/responsive-recaptcha.tsx');
  if (fs.existsSync(recaptchaPath)) {
    const content = fs.readFileSync(recaptchaPath, 'utf8');
    const hasSiteKeyUsage = content.includes('process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY');
    console.log(`✅ ResponsiveReCAPTCHA utilise NEXT_PUBLIC_RECAPTCHA_SITE_KEY: ${hasSiteKeyUsage ? '✓' : '✗'}`);
  } else {
    console.log('❌ Composant ResponsiveReCAPTCHA non trouvé');
  }
  
  // Vérifier l'API route
  const apiPath = path.join(__dirname, '../app/api/admin/withdrawals/validate/route.ts');
  if (fs.existsSync(apiPath)) {
    const content = fs.readFileSync(apiPath, 'utf8');
    const hasSecretKeyUsage = content.includes('process.env.RECAPTCHA_SECRET_KEY');
    console.log(`✅ API route utilise RECAPTCHA_SECRET_KEY: ${hasSecretKeyUsage ? '✓' : '✗'}`);
  } else {
    console.log('❌ API route non trouvée');
  }
}

// Vérifier la configuration
const config = checkRecaptchaConfig();
checkRecaptchaUsage();

console.log('\n📊 Résumé de la configuration:');
console.log(`✅ Site Key défini: ${config.hasSiteKey ? '✓' : '✗'}`);
console.log(`✅ Secret Key défini: ${config.hasSecretKey ? '✓' : '✗'}`);
console.log(`✅ Format Site Key: ${config.isValidSiteKey ? '✓' : '✗'}`);
console.log(`✅ Format Secret Key: ${config.isValidSecretKey ? '✓' : '✗'}`);

if (!config.hasSiteKey || !config.hasSecretKey) {
  console.log('\n❌ PROBLÈME: Variables reCAPTCHA manquantes');
  console.log('💡 Solution: Ajoutez les variables dans .env.local');
} else if (!config.isValidSiteKey || !config.isValidSecretKey) {
  console.log('\n❌ PROBLÈME: Format des clés reCAPTCHA incorrect');
  console.log('💡 Solution: Remplacez par vos vraies clés reCAPTCHA');
} else {
  console.log('\n✅ Configuration reCAPTCHA correcte !');
}

console.log('\n🔧 Actions à effectuer:');
console.log('1. Ouvrez le fichier .env.local');
console.log('2. Remplacez les valeurs par vos vraies clés reCAPTCHA');
console.log('3. Redémarrez le serveur Next.js');
console.log('4. Testez le reCAPTCHA');

console.log('\n🔗 Pour obtenir les clés reCAPTCHA:');
console.log('1. Allez sur https://www.google.com/recaptcha/admin');
console.log('2. Sélectionnez votre site');
console.log('3. Copiez la "Clé du site" et la "Clé secrète"');
console.log('4. Collez-les dans .env.local');

