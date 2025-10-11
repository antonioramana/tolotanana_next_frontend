const fs = require('fs');
const path = require('path');

const envContent = `# Configuration reCAPTCHA
# Remplacez ces valeurs par vos vraies clés reCAPTCHA
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI
RECAPTCHA_SECRET_KEY=6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe

# Configuration API
NEXT_PUBLIC_API_BASE=http://localhost:4750`;

const envPath = path.join(__dirname, '..', '.env.local');

try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Fichier .env.local créé avec succès !');
  console.log('📝 N\'oubliez pas de remplacer les clés reCAPTCHA par vos vraies clés :');
  console.log('   - NEXT_PUBLIC_RECAPTCHA_SITE_KEY');
  console.log('   - RECAPTCHA_SECRET_KEY');
  console.log('🔗 Obtenez vos clés sur : https://www.google.com/recaptcha/admin');
} catch (error) {
  console.error('❌ Erreur lors de la création du fichier .env.local:', error.message);
}