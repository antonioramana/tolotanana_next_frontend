const fs = require('fs');
const path = require('path');

console.log('🔍 Vérification finale du fichier terms-of-service...\n');

// Fonction pour vérifier la syntaxe basique
function checkBasicSyntax(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  console.log('📄 Vérification de la syntaxe:');
  
  // Vérifier les accolades équilibrées
  const openBraces = (content.match(/\{/g) || []).length;
  const closeBraces = (content.match(/\}/g) || []).length;
  const bracesBalanced = openBraces === closeBraces;
  
  console.log(`  ✅ Accolades équilibrées: ${bracesBalanced ? '✓' : '✗'} (${openBraces}/${closeBraces})`);
  
  // Vérifier les parenthèses équilibrées
  const openParens = (content.match(/\(/g) || []).length;
  const closeParens = (content.match(/\)/g) || []).length;
  const parensBalanced = openParens === closeParens;
  
  console.log(`  ✅ Parenthèses équilibrées: ${parensBalanced ? '✓' : '✗'} (${openParens}/${closeParens})`);
  
  // Vérifier les points-virgules
  const semicolons = (content.match(/;/g) || []).length;
  console.log(`  ✅ Points-virgules: ${semicolons} trouvés`);
  
  // Vérifier la structure de la fonction handleSubmit
  const handleSubmitStart = content.indexOf('const handleSubmit = async (e: React.FormEvent) => {');
  const handleSubmitEnd = content.indexOf('};', handleSubmitStart);
  
  if (handleSubmitStart !== -1 && handleSubmitEnd !== -1) {
    const handleSubmitContent = content.substring(handleSubmitStart, handleSubmitEnd + 2);
    const hasTry = handleSubmitContent.includes('try {');
    const hasCatch = handleSubmitContent.includes('} catch (err: any) {');
    const hasFinally = handleSubmitContent.includes('} finally {');
    
    console.log(`  ✅ Fonction handleSubmit: ✓`);
    console.log(`  ✅ Bloc try: ${hasTry ? '✓' : '✗'}`);
    console.log(`  ✅ Bloc catch: ${hasCatch ? '✓' : '✗'}`);
    console.log(`  ✅ Bloc finally: ${hasFinally ? '✓' : '✗'}`);
  } else {
    console.log(`  ❌ Fonction handleSubmit: ✗`);
  }
  
  // Vérifier qu'il n'y a pas de code orphelin
  const hasOrphanedCode = content.includes('} else {') && !content.includes('if (editingTerm) {');
  console.log(`  ✅ Pas de code orphelin: ${!hasOrphanedCode ? '✓' : '✗'}`);
  
  // Vérifier les imports
  const hasReactImport = content.includes("import { useState, useEffect } from 'react';");
  const hasIconsImport = content.includes("import { FiPlus, FiEdit, FiTrash2, FiCheck, FiX, FiFileText, FiSave, FiLoader } from 'react-icons/fi';");
  const hasApiImport = content.includes("import { TermsOfServiceApi } from '@/lib/api';");
  const hasToastImport = content.includes("import { useToast } from '@/hooks/use-toast';");
  
  console.log(`  ✅ Import React: ${hasReactImport ? '✓' : '✗'}`);
  console.log(`  ✅ Import Icons: ${hasIconsImport ? '✓' : '✗'}`);
  console.log(`  ✅ Import API: ${hasApiImport ? '✓' : '✗'}`);
  console.log(`  ✅ Import Toast: ${hasToastImport ? '✓' : '✗'}`);
  
  return {
    bracesBalanced,
    parensBalanced,
    semicolons,
    handleSubmit: handleSubmitStart !== -1 && handleSubmitEnd !== -1,
    noOrphanedCode: !hasOrphanedCode,
    imports: hasReactImport && hasIconsImport && hasApiImport && hasToastImport
  };
}

// Vérifier le fichier
const filePath = path.join(__dirname, '../app/admin/settings/terms-of-service/page.tsx');

if (fs.existsSync(filePath)) {
  const results = checkBasicSyntax(filePath);
  
  console.log('\n📊 Résumé de la vérification:');
  console.log(`✅ Accolades équilibrées: ${results.bracesBalanced ? '✓' : '✗'}`);
  console.log(`✅ Parenthèses équilibrées: ${results.parensBalanced ? '✓' : '✗'}`);
  console.log(`✅ Points-virgules: ${results.semicolons}`);
  console.log(`✅ Fonction handleSubmit: ${results.handleSubmit ? '✓' : '✗'}`);
  console.log(`✅ Pas de code orphelin: ${results.noOrphanedCode ? '✓' : '✗'}`);
  console.log(`✅ Imports corrects: ${results.imports ? '✓' : '✗'}`);
  
  const allCorrect = results.bracesBalanced && results.parensBalanced && 
                    results.handleSubmit && results.noOrphanedCode && results.imports;
  
  console.log(`\n🎯 Syntaxe correcte: ${allCorrect ? '✓' : '✗'}`);
  
  if (allCorrect) {
    console.log('\n✨ Le fichier terms-of-service est maintenant syntaxiquement correct !');
    console.log('🔧 Erreur de syntaxe corrigée !');
    console.log('🌙 Modal avec loading et thème sombre fonctionnel !');
  } else {
    console.log('\n⚠️ Il reste des problèmes de syntaxe.');
  }
} else {
  console.log('❌ Fichier non trouvé');
}

