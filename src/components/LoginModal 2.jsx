import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'

export default function LoginModal({ isOpen, onClose }) {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[100]" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md sm:p-6">
                <div className="absolute right-0 top-0 pr-4 pt-4">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500"
                    onClick={onClose}
                  >
                    <span className="sr-only">Fermer</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
                    {isLogin ? 'Connexion à votre compte' : 'Créer un compte'}
                  </h2>

                  <form className="space-y-6">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Adresse email
                      </label>
                      <div className="mt-1">
                        <input
                          id="email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          required
                          className="input-field"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        Mot de passe
                      </label>
                      <div className="mt-1">
                        <input
                          id="password"
                          name="password"
                          type="password"
                          autoComplete="current-password"
                          required
                          className="input-field"
                        />
                      </div>
                    </div>

                    {!isLogin && (
                      <div>
                        <label htmlFor="password-confirm" className="block text-sm font-medium text-gray-700">
                          Confirmer le mot de passe
                        </label>
                        <div className="mt-1">
                          <input
                            id="password-confirm"
                            name="password-confirm"
                            type="password"
                            required
                            className="input-field"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <button
                        type="submit"
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        {isLogin ? 'Se connecter' : 'S\'inscrire'}
                      </button>
                    </div>
                  </form>

                  <div className="mt-6">
                    <p className="text-center text-sm text-gray-600">
                      {isLogin ? (
                        <>
                          Pas encore de compte ?{' '}
                          <button
                            onClick={() => setIsLogin(false)}
                            className="font-medium text-primary-600 hover:text-primary-500"
                          >
                            S'inscrire
                          </button>
                        </>
                      ) : (
                        <>
                          Déjà un compte ?{' '}
                          <button
                            onClick={() => setIsLogin(true)}
                            className="font-medium text-primary-600 hover:text-primary-500"
                          >
                            Se connecter
                          </button>
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
