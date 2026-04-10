import Header from "@/components/layout/header"

export const metadata = { title: "Book a Service" }

export default function BookPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Book a Service</h1>
          <p className="text-gray-500">Fill in the details below and we&apos;ll confirm your booking.</p>
        </div>

        <form action="/api/orders" method="POST" className="space-y-8">
          {/* Bottle Details */}
          <section className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Your Bottle</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Brand *</label>
                <input
                  name="brand"
                  required
                  placeholder="e.g. Chanel"
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fragrance Name *</label>
                <input
                  name="fragrance"
                  required
                  placeholder="e.g. No. 5 Eau de Parfum"
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bottle Size</label>
                <select
                  name="bottleSize"
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="">Select size</option>
                  <option>30ml</option>
                  <option>50ml</option>
                  <option>75ml</option>
                  <option>100ml</option>
                  <option>150ml</option>
                  <option>200ml+</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Condition</label>
                <select
                  name="condition"
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="">Select condition</option>
                  <option value="good">Good — minor fading</option>
                  <option value="fair">Fair — needs refresh</option>
                  <option value="poor">Poor — significant wear</option>
                  <option value="empty">Empty bottle</option>
                </select>
              </div>
            </div>
          </section>

          {/* Service Selection */}
          <section className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Service Required *</h2>
            <div className="space-y-3">
              {[
                { value: "full-reconditioning", label: "Full Reconditioning", price: "£49" },
                { value: "scent-refresh", label: "Scent Refresh", price: "£29" },
                { value: "bottle-restoration", label: "Bottle Restoration", price: "£19" },
                { value: "atomiser-service", label: "Atomiser Service", price: "£12" },
                { value: "custom-blending", label: "Custom Blending", price: "£79" },
              ].map((s) => (
                <label key={s.value} className="flex items-center gap-3 p-3 border border-gray-100 dark:border-gray-700 rounded-lg cursor-pointer hover:border-rose-300 transition-colors">
                  <input type="radio" name="service" value={s.value} required className="text-rose-600" />
                  <span className="flex-1 font-medium text-gray-900 dark:text-white">{s.label}</span>
                  <span className="text-rose-600 font-semibold">From {s.price}</span>
                </label>
              ))}
            </div>
          </section>

          {/* Delivery Method */}
          <section className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">How will you send the bottle? *</h2>
            <div className="space-y-3">
              {[
                { value: "MAIL_IN", label: "Mail it in", desc: "Post your bottle to us. We&apos;ll send it back." },
                { value: "DROPOFF", label: "Drop off", desc: "Bring it to our studio in person." },
                { value: "PICKUP", label: "Collection service", desc: "We collect from your address (£9.99)." },
              ].map((m) => (
                <label key={m.value} className="flex items-start gap-3 p-3 border border-gray-100 dark:border-gray-700 rounded-lg cursor-pointer hover:border-rose-300 transition-colors">
                  <input type="radio" name="orderType" value={m.value} required className="text-rose-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{m.label}</p>
                    <p className="text-sm text-gray-500">{m.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </section>

          {/* Contact */}
          <section className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Your Details</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name *</label>
                  <input
                    name="name"
                    required
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email *</label>
                  <input
                    name="email"
                    type="email"
                    required
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                <input
                  name="phone"
                  type="tel"
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Additional Notes</label>
                <textarea
                  name="notes"
                  rows={3}
                  placeholder="Any specific concerns or instructions..."
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
                />
              </div>
            </div>
          </section>

          <button
            type="submit"
            className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-4 rounded-xl transition-colors"
          >
            Proceed to Payment
          </button>
        </form>
      </div>
    </div>
  )
}
