
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
