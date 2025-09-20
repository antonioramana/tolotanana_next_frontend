export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Contactez-nous</h1>
          <p className="mt-3 text-gray-600">Nous sommes là pour vous aider. Envoyez-nous un message et nous vous répondrons rapidement.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 bg-white shadow-2xl rounded-2xl p-6 sm:p-8">
            <form className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                  <input type="text" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" placeholder="Votre prénom" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                  <input type="text" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" placeholder="Votre nom" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input type="email" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" placeholder="vous@email.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                  <input type="tel" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" placeholder="Votre numéro" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sujet</label>
                <input type="text" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" placeholder="Sujet de votre message" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea rows={5} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" placeholder="Écrivez votre message ici..." />
              </div>

              <div className="flex justify-center lg:justify-end">
                <button type="submit" className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors">Envoyer</button>
              </div>
            </form>
          </div>

          <div className="space-y-6">
            <div className="bg-white shadow-2xl rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-gray-900">Informations</h2>
              <p className="mt-2 text-sm text-gray-600">Pour toute question concernant les campagnes, les dons ou votre compte.</p>
              <div className="mt-4 space-y-2 text-sm text-gray-700">
                <p><span className="font-medium">Email:</span> contact@tolotanana.com</p>
                <p><span className="font-medium">Téléphone:</span> +261 34 00 000 00</p>
                <p><span className="font-medium">Adresse:</span> Antananarivo, Madagascar</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl p-6">
              <h3 className="text-lg font-semibold">Vous souhaitez lancer une campagne ?</h3>
              <p className="mt-2 text-sm text-orange-50">Créez votre campagne en quelques minutes et commencez à collecter des fonds.</p>
              <a href="/dashboard/create-campaign" className="inline-block mt-4 bg-white text-orange-600 font-semibold px-4 py-2 rounded-lg hover:bg-orange-50">Créer une campagne</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


