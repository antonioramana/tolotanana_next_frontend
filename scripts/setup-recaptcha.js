const fs = require('fs');
const path = require('path');

console.log('🔧 Configuration des clés reCAPTCHA...\n');

// Fonction pour mettre à jour les clés reCAPTCHA
function updateRecaptchaKeys(siteKey, secretKey) {
  const envPath = path.join(__dirname, '../.env.local');
  
  if (!fs.existsSync(envPath)) {
    console.log('❌ Fichier .env.local non trouvé');
    return false;
  }
  
  let content = fs.readFileSync(envPath, 'utf8');
  
  // Mettre à jour la clé site
  content = content.replace(
    /NEXT_PUBLIC_RECAPTCHA_SITE_KEY=.*/,
    `NEXT_PUBLIC_RECAPTCHA_SITE_KEY=${siteKey}`
  );
  
  // Mettre à jour la clé secrète
  content = content.replace(
    /RECAPTCHA_SECRET_KEY=.*/,
    `RECAPTCHA_SECRET_KEY=${secretKey}`
  );
  
  fs.writeFileSync(envPath, content, 'utf8');
  console.log('✅ Clés reCAPTCHA mises à jour !');
  return true;
}

// Fonction pour vérifier le format des clés
function validateRecaptchaKeys(siteKey, secretKey) {
  const errors = [];
  
  if (!siteKey || siteKey.length < 20) {
    errors.push('Site Key trop courte ou vide');
  }
  
  if (!secretKey || secretKey.length < 20) {
    errors.push('Secret Key trop courte ou vide');
  }
  
  if (!siteKey.startsWith('6Lf')) {
    errors.push('Site Key ne commence pas par "6Lf"');
  }
  
  if (!secretKey.startsWith('6Lf')) {
    errors.push('Secret Key ne commence pas par "6Lf"');
  }
  
  return errors;
}

// Fonction pour créer un script de test
function createTestScript() {
  const testScript = `
// Script de test reCAPTCHA
// À exécuter dans la console du navigateur

function testRecaptchaConfig() {
  console.log('🧪 Test de la configuration reCAPTCHA...');
  
  // Vérifier que la clé site est chargée
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  console.log('📝 Site Key:', siteKey ? siteKey.substring(0, 10) + '...' : 'Non définie');
  
  if (!siteKey) {
    console.log('❌ Site Key non définie');
    return;
  }
  
  // Vérifier le format
  if (!siteKey.startsWith('6Lf')) {
    console.log('❌ Format Site Key incorrect');
    return;
  }
  
  console.log('✅ Site Key correcte');
  
  // Test de chargement du script reCAPTCHA
  if (typeof grecaptcha !== 'undefined') {
    console.log('✅ Script reCAPTCHA chargé');
  } else {
    console.log('⚠️ Script reCAPTCHA non chargé');
  }
}

// Exécuter le test
testRecaptchaConfig();
`;

  const testPath = path.join(__dirname, '../test-recaptcha-config.js');
  fs.writeFileSync(testPath, testScript);
  console.log('📄 Script de test créé: test-recaptcha-config.js');
}

console.log('📋 Instructions pour configurer reCAPTCHA:');
console.log('\n1. 🔗 Obtenir les clés reCAPTCHA:');
console.log('   - Allez sur https://www.google.com/recaptcha/admin');
console.log('   - Sélectionnez votre site ou créez-en un nouveau');
console.log('   - Copiez la "Clé du site" (Site Key)');
console.log('   - Copiez la "Clé secrète" (Secret Key)');

console.log('\n2. 📝 Format des clés:');
console.log('   - Site Key: Commence par "6Lf..." (ex: 6LfAbCdEf...)');
console.log('   - Secret Key: Commence par "6Lf..." (ex: 6LfGhIjKl...)');
console.log('   - Les deux clés doivent correspondre au même site');

console.log('\n3. 🔧 Configuration:');
console.log('   - Ouvrez le fichier .env.local');
console.log('   - Remplacez les valeurs par vos vraies clés');
console.log('   - Sauvegardez le fichier');

console.log('\n4. 🔄 Redémarrage:');
console.log('   - Arrêtez le serveur Next.js (Ctrl+C)');
console.log('   - Relancez: npm run dev');
console.log('   - Testez le reCAPTCHA');

console.log('\n5. 🧪 Test:');
console.log('   - Ouvrez la console du navigateur (F12)');
console.log('   - Copiez le contenu de test-recaptcha-config.js');
console.log('   - Collez-le dans la console et appuyez sur Entrée');

console.log('\n💡 Problèmes courants:');
console.log('❌ "Clé de site non valide": Site Key incorrecte ou non définie');
console.log('❌ "Clé secrète non valide": Secret Key incorrecte ou non définie');
console.log('❌ "Site non autorisé": Site Key ne correspond pas au domaine');
console.log('❌ "reCAPTCHA non chargé": Problème de chargement du script');

console.log('\n🔧 Solutions:');
console.log('1. Vérifiez que les clés correspondent au bon site');
console.log('2. Vérifiez que le domaine est autorisé dans reCAPTCHA');
console.log('3. Redémarrez le serveur après modification');
console.log('4. Videz le cache du navigateur');

// Créer le script de test
createTestScript();

console.log('\n✨ Configuration terminée !');
console.log('🎯 Suivez les instructions ci-dessus pour configurer vos clés reCAPTCHA');

