import Link from 'next/link';
import { Sparkles, Mail, Building2, GraduationCap, Hospital } from 'lucide-react';
import { useModal } from '@/contexts/modal-context';

export default function Footer() {
  const { openContactModal } = useModal();
  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-green-950 to-emerald-950 dark:from-gray-950 dark:via-indigo-950 dark:to-purple-950 text-white py-12 sm:py-16 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 mb-8 sm:mb-12">
          {/* Logo & Description */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-green-600 via-lime-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="text-white w-5 h-5" />
              </div>
              <span className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-lime-400 to-emerald-400">
                Diltak.ai
              </span>
            </div>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed max-w-sm">
              Transforming mental wellness through AI-powered insights and compassionate care.
            </p>
          </div>

          {/* Integration */}
          <div>
            <h4 className="font-bold mb-4 text-base sm:text-lg flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-green-400" />
              <span>Integration</span>
            </h4>
            <ul className="space-y-3 text-sm sm:text-base">
              <li>
                <Link href="#" className="text-gray-300 hover:text-green-400 transition-colors flex items-center space-x-2 group">
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full group-hover:scale-150 transition-transform"></span>
                  <span>HR Systems</span>
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-green-400 transition-colors flex items-center space-x-2 group">
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full group-hover:scale-150 transition-transform"></span>
                  <span>Communication Tools</span>
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-green-400 transition-colors flex items-center space-x-2 group">
                  <GraduationCap className="w-4 h-4 text-emerald-400" />
                  <span>Universities & Schools</span>
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-green-400 transition-colors flex items-center space-x-2 group">
                  <Hospital className="w-4 h-4 text-lime-400" />
                  <span>Hospitals & Clinics</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold mb-4 text-base sm:text-lg flex items-center space-x-2">
              <Mail className="w-5 h-5 text-emerald-400" />
              <span>Contact</span>
            </h4>
            <ul className="space-y-3 text-sm sm:text-base">
              <li>
                <button 
                  onClick={openContactModal} 
                  className="text-gray-300 hover:text-emerald-400 transition-colors text-left flex items-center space-x-2 group"
                >
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full group-hover:scale-150 transition-transform"></span>
                  <span>Technical Support</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={openContactModal} 
                  className="text-gray-300 hover:text-emerald-400 transition-colors text-left flex items-center space-x-2 group"
                >
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full group-hover:scale-150 transition-transform"></span>
                  <span>Customer Success</span>
                </button>
              </li>
              <li>
                <a 
                  href="mailto:info@diltak.ai" 
                  className="text-gray-300 hover:text-emerald-400 transition-colors flex items-center space-x-2 group"
                >
                  <Mail className="w-4 h-4 text-lime-400" />
                  <span>info@diltak.ai</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-700/50 pt-6 sm:pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <p className="text-gray-400 text-xs sm:text-sm">
              © 2025 Diltak.ai. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 text-xs sm:text-sm">
              <Link href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
