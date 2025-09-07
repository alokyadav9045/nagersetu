import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Code, Zap, Palette } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-black via-zinc-900 to-black min-h-screen flex items-center py-20 sm:py-32">
      <div className="absolute inset-0 bg-grid-zinc-800/25 [mask-image:linear-gradient(0deg,transparent,rgba(255,255,255,0.1))] -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium bg-zinc-800/50 text-zinc-300 ring-1 ring-inset ring-zinc-700/20 mb-8">
            <Zap className="w-4 h-4 mr-2" />
            Next.js 15 + shadcn/ui + Tailwind CSS
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
            Build faster with our{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-400">
              Next.js Template
            </span>
          </h1>

          {/* Subheading */}
          <p className="mt-6 text-lg leading-8 text-zinc-300 max-w-3xl mx-auto">
            A production-ready Next.js template with TypeScript, Tailwind CSS, and shadcn/ui components.
            Skip the setup and start building your next project in minutes.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link href="/login">
              <Button size="lg" className="text-base px-8 py-3 bg-zinc-800 hover:bg-zinc-700 text-white">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="https://github.com/AhqafCoder/NEXTJS-TEMPLATE" target="_blank">
              <Button variant="outline" size="lg" className="text-base px-8 py-3 border-zinc-700 text-zinc-800 hover:bg-zinc-800 hover:text-white">
                View on GitHub
              </Button>
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}