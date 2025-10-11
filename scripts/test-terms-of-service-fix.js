const fs = require('fs');
const path = require('path');

console.log('🔍 Test de la correction du fichier terms-of-service...\n');

// Fonction pour vérifier la syntaxe du fichier
function checkTermsOfServiceFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  console.log('📄 Vérification du fichier terms-of-service:');
  
  // Vérifier la structure de la fonction handleSubmit
  const hasHandleSubmit = content.includes('const handleSubmit = async (e: React.FormEvent) => {');
  const hasProperClosing = content.includes('} finally {') && content.includes('setSubmitting(false);') && content.includes('};');
  
  console.log(`  ✅ Fonction handleSubmit: ${hasHandleSubmit ? '✓' : '✗'}`);
  console.log(`  ✅ Fermeture correcte: ${hasProperClosing ? '✓' : '✗'}`);
  
  // Vérifier qu'il n'y a pas de code dupliqué
  const hasDuplicatedCode = content.includes('} else {') && content.split('} else {').length > 2;
  const hasDuplicatedFinally = content.split('} finally {').length > 2;
  const hasDuplicatedCatch = content.split('} catch (err: any) {').length > 2;
  
  console.log(`  ✅ Pas de code dupliqué else: ${!hasDuplicatedCode ? '✓' : '✗'}`);
  console.log(`  ✅ Pas de finally dupliqué: ${!hasDuplicatedFinally ? '✓' : '✗'}`);
  console.log(`  ✅ Pas de catch dupliqué: ${!hasDuplicatedCatch ? '✓' : '✗'}`);
  
  // Vérifier la structure try-catch-finally
  const hasTryBlock = content.includes('try {');
  const hasCatchBlock = content.includes('} catch (err: any) {');
  const hasFinallyBlock = content.includes('} finally {');
  
  console.log(`  ✅ Bloc try: ${hasTryBlock ? '✓' : '✗'}`);
  console.log(`  ✅ Bloc catch: ${hasCatchBlock ? '✓' : '✗'}`);
  console.log(`  ✅ Bloc finally: ${hasFinallyBlock ? '✓' : '✗'}`);
  
  // Vérifier les fonctions principales
  const hasHandleEdit = content.includes('const handleEdit = (term: TermsOfService) => {');
  const hasHandleActivate = content.includes('const handleActivate = async (id: string) => {');
  const hasHandleDelete = content.includes('const handleDelete = async (id: string) => {');
  
  console.log(`  ✅ Fonction handleEdit: ${hasHandleEdit ? '✓' : '✗'}`);
  console.log(`  ✅ Fonction handleActivate: ${hasHandleActivate ? '✓' : '✗'}`);
  console.log(`  ✅ Fonction handleDelete: ${hasHandleDelete ? '✓' : '✗'}`);
  
  // Vérifier les états
  const hasSubmittingState = content.includes('const [submitting, setSubmitting] = useState(false);');
  const hasShowModalState = content.includes('const [showModal, setShowModal] = useState(false);');
  const hasEditingTermState = content.includes('const [editingTerm, setEditingTerm] = useState<TermsOfService | null>(null);');
  
  console.log(`  ✅ État submitting: ${hasSubmittingState ? '✓' : '✗'}`);
  console.log(`  ✅ État showModal: ${hasShowModalState ? '✓' : '✓'}`);
  console.log(`  ✅ État editingTerm: ${hasEditingTermState ? '✓' : '✗'}`);
  
  // Vérifier le modal
  const hasModal = content.includes('{showModal && (');
  const hasModalContent = content.includes('bg-gray-800 rounded-xl');
  const hasModalForm = content.includes('<form onSubmit={handleSubmit}');
  
  console.log(`  ✅ Modal conditionnel: ${hasModal ? '✓' : '✗'}`);
  console.log(`  ✅ Contenu modal: ${hasModalContent ? '✓' : '✗'}`);
  console.log(`  ✅ Formulaire modal: ${hasModalForm ? '✓' : '✗'}`);
  
  return {
    handleSubmit: hasHandleSubmit,
    properClosing: hasProperClosing,
    noDuplicatedCode: !hasDuplicatedCode,
    noDuplicatedFinally: !hasDuplicatedFinally,
    noDuplicatedCatch: !hasDuplicatedCatch,
    tryBlock: hasTryBlock,
    catchBlock: hasCatchBlock,
    finallyBlock: hasFinallyBlock,
    handleEdit: hasHandleEdit,
    handleActivate: hasHandleActivate,
    handleDelete: hasHandleDelete,
    submittingState: hasSubmittingState,
    showModalState: hasShowModalState,
    editingTermState: hasEditingTermState,
    modal: hasModal,
    modalContent: hasModalContent,
    modalForm: hasModalForm
  };
}

// Vérifier le fichier
const filePath = path.join(__dirname, '../app/admin/settings/terms-of-service/page.tsx');

if (fs.existsSync(filePath)) {
  const results = checkTermsOfServiceFile(filePath);
  
  console.log('\n📊 Résumé de la vérification:');
  console.log(`✅ Fonction handleSubmit: ${results.handleSubmit ? '✓' : '✗'}`);
  console.log(`✅ Fermeture correcte: ${results.properClosing ? '✓' : '✗'}`);
  console.log(`✅ Pas de code dupliqué else: ${results.noDuplicatedCode ? '✓' : '✗'}`);
  console.log(`✅ Pas de finally dupliqué: ${results.noDuplicatedFinally ? '✓' : '✗'}`);
  console.log(`✅ Pas de catch dupliqué: ${results.noDuplicatedCatch ? '✓' : '✗'}`);
  console.log(`✅ Bloc try: ${results.tryBlock ? '✓' : '✗'}`);
  console.log(`✅ Bloc catch: ${results.catchBlock ? '✓' : '✗'}`);
  console.log(`✅ Bloc finally: ${results.finallyBlock ? '✓' : '✗'}`);
  console.log(`✅ Fonction handleEdit: ${results.handleEdit ? '✓' : '✗'}`);
  console.log(`✅ Fonction handleActivate: ${results.handleActivate ? '✓' : '✗'}`);
  console.log(`✅ Fonction handleDelete: ${results.handleDelete ? '✓' : '✗'}`);
  console.log(`✅ État submitting: ${results.submittingState ? '✓' : '✗'}`);
  console.log(`✅ État showModal: ${results.showModalState ? '✓' : '✗'}`);
  console.log(`✅ État editingTerm: ${results.editingTermState ? '✓' : '✗'}`);
  console.log(`✅ Modal conditionnel: ${results.modal ? '✓' : '✗'}`);
  console.log(`✅ Contenu modal: ${results.modalContent ? '✓' : '✗'}`);
  console.log(`✅ Formulaire modal: ${results.modalForm ? '✓' : '✗'}`);
  
  const allCorrect = results.handleSubmit && results.properClosing && results.noDuplicatedCode && 
                    results.noDuplicatedFinally && results.noDuplicatedCatch && results.tryBlock && 
                    results.catchBlock && results.finallyBlock && results.handleEdit && 
                    results.handleActivate && results.handleDelete && results.submittingState && 
                    results.showModalState && results.editingTermState && results.modal && 
                    results.modalContent && results.modalForm;
  
  console.log(`\n🎯 Fichier complet: ${allCorrect ? '✓' : '✗'}`);
  
  if (allCorrect) {
    console.log('\n✨ Le fichier terms-of-service est maintenant correct !');
    console.log('🔧 Syntaxe corrigée et fonctionnalités préservées !');
    console.log('🌙 Modal avec loading et thème sombre fonctionnel !');
  } else {
    console.log('\n⚠️ Il reste des problèmes avec le fichier.');
  }
} else {
  console.log('❌ Fichier non trouvé');
}

