import Link from "next/link"
import Header from "@/components/layout/header"
import { Button } from "@/components/ui/button"

const services = [
  {
    name: "Full Reconditioning",
    icon: "✨",
    description: "Complete restoration — fragrance refresh, bottle cleaning, and presentation polish.",
    price: "From £49",
    color: "from-rose-50 to-pink-50",
  },
  {
    name: "Scent Refresh",
    icon: "🌸",
    description: "Top up your fragrance concentration to its original intensity.",
    price: "From £29",
    color: "from-purple-50 to-violet-50",
  },
  {
    name: "Bottle Restoration",
    icon: "💎",
    description: "Deep clean, descale, and restore the bottle to showroom condition.",
    price: "From £19",
    color: "from-amber-50 to-yellow-50",
  },
  {
    name: "Custom Blending",
    icon: "🧪",
    description: "Work with our perfumers to create a bespoke fragrance blend for your bottle.",
    price: "From £79",
    color: "from-emerald-50 to-teal-50",
  },
]

const steps = [
  { step: "01", title: "Book Online", description: "Choose your service and submit your order in minutes." },
  { step: "02", title: "Send Your Bottle", description: "Drop off, mail in, or request a collection at your door." },
  { step: "03", title: "Expert Reconditioning", description: "Our specialists assess and restore your fragrance." },
  { step: "04", title: "Returned to You", description: "Your bottle is returned looking and smelling brand new." },
]

const brands = ["Chanel", "Dior", "YSL", "Gucci", "Tom Ford", "Hermès", "Lancôme", "Versace"]

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Header />

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 py-24 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-rose-200 rounded-full opacity-20 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-200 rounded-full opacity-20 blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <span className="inline-block bg-rose-100 text-rose-700 px-4 py-2 rounded-full text-sm font-semibold">
                Expert Perfume Reconditioning
              </span>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                Give Your Fragrance
                <span className="text-rose-600"> New Life</span>
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                Specialist reconditioning for designer perfume bottles. We restore, refresh, and revive your most loved fragrances — so they last a lifetime.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" className="bg-rose-600 hover:bg-rose-700 text-white">
                  <Link href="/services">Explore Services</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/book">Book Now</Link>
                </Button>
              </div>
              <div className="flex items-center gap-10 pt-2">
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">500+</div>
                  <div className="text-sm text-gray-500">Bottles Restored</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">4.9★</div>
                  <div className="text-sm text-gray-500">Customer Rating</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">5-day</div>
                  <div className="text-sm text-gray-500">Turnaround</div>
                </div>
              </div>
            </div>
            <div className="relative hidden md:block">
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-10 text-center">
                <div className="text-8xl mb-4">🌹</div>
                <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">Featured Service</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">Full Reconditioning</p>
                <p className="text-rose-600 font-semibold mt-1">From £49</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted brands */}
      <section className="py-10 bg-gray-50 dark:bg-gray-900 border-y border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500 mb-6 uppercase tracking-wide font-medium">
            We work with bottles from all major houses
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            {brands.map((brand) => (
              <span key={brand} className="text-gray-400 dark:text-gray-500 font-semibold text-lg">
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-24 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Our Services</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Professional reconditioning packages tailored to your bottle&apos;s needs.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service) => (
              <Link key={service.name} href="/services" className="group">
                <div className={`bg-gradient-to-br ${service.color} dark:from-gray-800 dark:to-gray-800 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1 h-full`}>
                  <div className="text-5xl mb-4">{service.icon}</div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{service.name}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 leading-relaxed">{service.description}</p>
                  <span className="text-rose-600 font-semibold text-sm">{service.price}</span>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-10">
            <Button asChild variant="outline" size="lg">
              <Link href="/services">View All Services</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">How It Works</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">Four simple steps to a restored fragrance.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((s, i) => (
              <div key={s.step} className="relative text-center">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-0.5 bg-rose-100 dark:bg-gray-700" />
                )}
                <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-600 text-white text-xl font-bold mb-4">
                  {s.step}
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{s.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-r from-rose-600 to-pink-600">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to restore your favourite scent?</h2>
          <p className="text-white/90 text-lg mb-8">Book online in minutes. 5-day turnaround. Free returns on orders over £75.</p>
          <Button asChild size="lg" className="bg-white text-rose-600 hover:bg-gray-100">
            <Link href="/book">Book a Service</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-10 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 bg-rose-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">A</span>
                </div>
                <span className="text-xl font-bold">Allio Cosmetics</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">Specialist designer perfume reconditioning. Restore what you love.</p>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-sm uppercase tracking-wide">Services</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/services" className="hover:text-white transition-colors">All Services</Link></li>
                <li><Link href="/services/reconditioning" className="hover:text-white transition-colors">Full Reconditioning</Link></li>
                <li><Link href="/services/scent-refresh" className="hover:text-white transition-colors">Scent Refresh</Link></li>
                <li><Link href="/services/bottle-restoration" className="hover:text-white transition-colors">Bottle Restoration</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-sm uppercase tracking-wide">Company</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/track" className="hover:text-white transition-colors">Track Order</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-sm uppercase tracking-wide">Account</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/login" className="hover:text-white transition-colors">Login</Link></li>
                <li><Link href="/register" className="hover:text-white transition-colors">Create Account</Link></li>
                <li><Link href="/profile/orders" className="hover:text-white transition-colors">My Orders</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm gap-4">
            <p>&copy; 2026 Allio Cosmetics. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

