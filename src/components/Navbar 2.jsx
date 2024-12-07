import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Disclosure } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import LoginModal from './LoginModal'

const navigation = [
  { name: 'Rechercher', href: '/search' },
  { name: 'Mes réservations', href: '/bookings' },
  { name: 'Propriétaires solidaires', href: '/solidary-owners' },
  { name: 'Labels', href: '/labels' },
  { name: 'Support', href: '/support' },
]

function Navbar() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  return (
    <>
      <Disclosure as="nav" className={`${isHomePage ? 'absolute w-full' : 'relative'} ${!isHomePage ? 'bg-white shadow-lg' : ''}`}>
        {({ open }) => (
          <>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="h-16 flex items-center justify-between">
                {/* Logo - Left Section */}
                <div className="flex-shrink-0">
                  <Link to="/" className={`text-2xl font-bold ${isHomePage ? 'text-white' : 'text-primary-600'}`}>
                    SeasonStay
                  </Link>
                </div>

                {/* Navigation - Center Section */}
                <div className="hidden sm:block flex-grow">
                  <div className="flex justify-center space-x-8">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                          location.pathname === item.href
                            ? isHomePage
                              ? 'bg-white/10 text-white'
                              : 'bg-primary-50 text-primary-600'
                            : isHomePage
                              ? 'text-white hover:bg-white/10'
                              : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600'
                        }`}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Auth - Right Section */}
                <div className="hidden sm:flex items-center space-x-4">
                  <button
                    onClick={() => setIsLoginModalOpen(true)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                      isHomePage
                        ? 'text-primary-700 bg-white hover:bg-gray-100'
                        : 'text-white bg-primary-600 hover:bg-primary-700'
                    }`}
                  >
                    Connexion
                  </button>
                </div>

                {/* Mobile menu button */}
                <div className="flex items-center sm:hidden">
                  <Disclosure.Button className={`inline-flex items-center justify-center p-2 rounded-md ${
                    isHomePage
                      ? 'text-white hover:text-gray-200 hover:bg-white/10'
                      : 'text-gray-400 hover:text-gray-500 hover:bg-gray-100'
                  }`}>
                    <span className="sr-only">Ouvrir le menu</span>
                    {open ? (
                      <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </Disclosure.Button>
                </div>
              </div>
            </div>

            {/* Mobile menu */}
            <Disclosure.Panel className={`sm:hidden ${isHomePage ? 'bg-black/80 backdrop-blur-sm' : 'bg-white'}`}>
              <div className="px-2 pt-2 pb-3 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`block px-3 py-2 text-base font-medium rounded-md ${
                      location.pathname === item.href
                        ? isHomePage
                          ? 'bg-white/20 text-white'
                          : 'bg-primary-50 text-primary-600'
                        : isHomePage
                          ? 'text-white hover:bg-white/10'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className={`w-full text-left px-3 py-2 text-base font-medium rounded-md ${
                    isHomePage
                      ? 'bg-white text-primary-700 hover:bg-gray-100'
                      : 'bg-primary-600 text-white hover:bg-primary-700'
                  }`}
                >
                  Connexion
                </button>
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>

      <LoginModal 
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  )
}

export default Navbar
