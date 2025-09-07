import Link from "next/link";
import { Github, Twitter, Linkedin, Mail, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-black border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="text-2xl font-bold text-white mb-4 block">
              NextTemplate
            </Link>
            <p className="text-zinc-400 mb-6 max-w-md">
              A production-ready Next.js template with TypeScript, Tailwind CSS, and shadcn/ui components. 
              Built for developers who want to ship fast.
            </p>
            <div className="flex space-x-4">
              <Link 
                href="https://github.com/yourusername/nextjs-template" 
                className="text-zinc-400 hover:text-white transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="h-5 w-5" />
              </Link>
              <Link 
                href="https://twitter.com/yourusername" 
                className="text-zinc-400 hover:text-white transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Twitter className="h-5 w-5" />
              </Link>
              <Link 
                href="https://linkedin.com/in/yourusername" 
                className="text-zinc-400 hover:text-white transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Linkedin className="h-5 w-5" />
              </Link>
              <Link 
                href="mailto:hello@nexttemplate.com" 
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <Mail className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/features" className="text-zinc-400 hover:text-white transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/docs" className="text-zinc-400 hover:text-white transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/examples" className="text-zinc-400 hover:text-white transition-colors">
                  Examples
                </Link>
              </li>
              <li>
                <Link href="/changelog" className="text-zinc-400 hover:text-white transition-colors">
                  Changelog
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/blog" className="text-zinc-400 hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-zinc-400 hover:text-white transition-colors">
                  Support
                </Link>
              </li>
              <li>
                <Link href="/community" className="text-zinc-400 hover:text-white transition-colors">
                  Community
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-zinc-400 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-zinc-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-zinc-400 text-sm mb-4 md:mb-0">
            © 2025 NextTemplate. All rights reserved.
          </div>
          
          <div className="flex items-center space-x-6 text-sm">
            <Link href="/privacy" className="text-zinc-400 hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-zinc-400 hover:text-white transition-colors">
              Terms of Service
            </Link>
            <div className="flex items-center text-zinc-400">
              Made with <Heart className="h-4 w-4 mx-1 text-red-500" /> by developers
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}