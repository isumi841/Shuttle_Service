import React from 'react';
import { Link } from 'react-router-dom';
import { PhoneIcon, MailIcon, MapPinIcon, Bus as ShuttleIcon } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { path: "/busroutes", label: "Bus Routes" },
    { path: "/my-bookings", label: "My Bookings" },
    { path: "/", label: "Home" },
    { path: "/support", label: "Support" },
  ];

  const popularRoutes = [
    "Colombo - Malabe",
    "Kandy - Malabe",
    "Galle - Malabe",
    "Negombo - Malabe",
    "Kurunegala - Malabe",
  ];

  return (
    <footer className="relative bg-slate-950 text-white overflow-hidden">
      {/* Decorative gradient orb */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top gradient line */}
      <div className="h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />

      <div className="relative container mx-auto px-4 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link to="/busroutes" className="inline-flex items-center gap-2 mb-5 group">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <ShuttleIcon size={18} className="text-white" />
              </div>
              <span className="text-xl font-black text-white tracking-tight">UniRoute</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              The most reliable shuttle booking platform in Sri Lanka. Book your
              journey with ease and travel with comfort.
            </p>
            <div className="flex space-x-3">
              {/* Facebook */}
              <a
                href="#"
                className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 hover:scale-110 hover:-translate-y-0.5 transition-all duration-300"
                aria-label="Facebook"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              {/* Twitter */}
              <a
                href="#"
                className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-sky-500 hover:text-white hover:border-sky-500 hover:scale-110 hover:-translate-y-0.5 transition-all duration-300"
                aria-label="Twitter"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              {/* Instagram */}
              <a
                href="#"
                className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-500 hover:text-white hover:border-transparent hover:scale-110 hover:-translate-y-0.5 transition-all duration-300"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold tracking-widest uppercase text-white/90 mb-6 relative inline-block">
              Quick Links
              <span className="absolute -bottom-2 left-0 w-1/2 h-0.5 bg-indigo-500 rounded-full" />
            </h3>
            <ul className="space-y-4">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-slate-400 hover:text-white text-sm flex items-center group transition-all duration-300"
                  >
                    <span className="w-0 group-hover:w-2 h-px bg-indigo-500 mr-0 group-hover:mr-2 transition-all duration-300" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular Routes */}
          <div>
            <h3 className="text-sm font-bold tracking-widest uppercase text-white/90 mb-6 relative inline-block">
              Popular Routes
              <span className="absolute -bottom-2 left-0 w-1/2 h-0.5 bg-cyan-500 rounded-full" />
            </h3>
            <ul className="space-y-4">
              {popularRoutes.map((route) => (
                <li key={route}>
                  <Link
                    to="/busroutes"
                    className="text-slate-400 hover:text-white text-sm flex items-center group transition-all duration-300"
                  >
                    <span className="w-0 group-hover:w-2 h-px bg-cyan-500 mr-0 group-hover:mr-2 transition-all duration-300" />
                    {route}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-bold tracking-widest uppercase text-white/90 mb-6 relative inline-block">
              Contact Us
              <span className="absolute -bottom-2 left-0 w-1/2 h-0.5 bg-purple-500 rounded-full" />
            </h3>
            <div className="space-y-5">
              <div className="flex items-start space-x-3 group">
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-600/20 group-hover:border-indigo-500/30 transition-all duration-300">
                  <MapPinIcon size={14} className="text-indigo-400" />
                </div>
                <span className="text-slate-400 text-sm leading-relaxed">
                  123 Main Street, Colombo 03, Sri Lanka
                </span>
              </div>
              <div className="flex items-center space-x-3 group">
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-600/20 group-hover:border-indigo-500/30 transition-all duration-300">
                  <PhoneIcon size={14} className="text-indigo-400" />
                </div>
                <span className="text-slate-400 text-sm">+94 11 234 5678</span>
              </div>
              <div className="flex items-center space-x-3 group">
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-600/20 group-hover:border-indigo-500/30 transition-all duration-300">
                  <MailIcon size={14} className="text-indigo-400" />
                </div>
                <span className="text-slate-400 text-sm">info@uniroute.lk</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-400 text-sm">
              &copy; {currentYear} UniRoute. All rights reserved.
            </p>
            <div className="flex items-center space-x-6">
              <a href="#" className="text-slate-400 hover:text-slate-300 text-sm transition-colors duration-300">
                Privacy Policy
              </a>
              <a href="#" className="text-slate-400 hover:text-slate-300 text-sm transition-colors duration-300">
                Terms of Service
              </a>
              <a href="#" className="text-slate-400 hover:text-slate-300 text-sm transition-colors duration-300">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;