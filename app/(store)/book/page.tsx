import Header from "@/components/layout/header"

export const metadata = { title: "Book a Service — Allio Cosmetics" }

const inputCls = "w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-sm"
const labelCls = "block text-sm font-medium text-foreground mb-1"

export default function BookPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-foreground mb-2">Book a Service</h1>
          <p className="text-muted-foreground">Fill in the details below and we&apos;ll confirm your booking.</p>
        </div>

        <form action="/api/orders" method="POST" className="space-y-8">
          {/* Bottle Details */}
          <section className="bg-card rounded-2xl p-6 border border-border">
            <h2 className="font-semibold text-foreground mb-4">Your Bottle</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label className={labelCls}>Brand *</label>
                <input name="brand" required placeholder="e.g. Chanel" className={inputCls} />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className={labelCls}>Fragrance Name *</label>
                <input name="fragrance" required placeholder="e.g. No. 5 Eau de Parfum" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Bottle Size</label>
                <select name="bottleSize" className={inputCls}>
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
                <label className={labelCls}>Current Condition</label>
                <select name="condition" className={inputCls}>
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
          <section className="bg-card rounded-2xl p-6 border border-border">
            <h2 className="font-semibold text-foreground mb-4">Service Required *</h2>
            <div className="space-y-3">
              {[
                { value: "full-reconditioning", label: "Full Reconditioning", price: "CA$49" },
                { value: "scent-refresh",        label: "Scent Refresh",       price: "CA$29" },
                { value: "bottle-restoration",   label: "Bottle Restoration",  price: "CA$19" },
                { value: "atomiser-service",     label: "Atomiser Service",    price: "CA$12" },
                { value: "custom-blending",      label: "Custom Blending",     price: "CA$79" },
              ].map((s) => (
                <label
                  key={s.value}
                  className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
                >
                  <input type="radio" name="service" value={s.value} required className="accent-primary" />
                  <span className="flex-1 font-medium text-foreground">{s.label}</span>
                  <span className="text-primary font-semibold">From {s.price}</span>
                </label>
              ))}
            </div>
          </section>

          {/* Delivery Method */}
          <section className="bg-card rounded-2xl p-6 border border-border">
            <h2 className="font-semibold text-foreground mb-4">How will you send the bottle? *</h2>
            <div className="space-y-3">
              {[
                { value: "MAIL_IN", label: "Mail it in",          desc: "Post your bottle to us. We'll send it back." },
                { value: "DROPOFF", label: "Drop off",            desc: "Bring it to our studio in person." },
                { value: "PICKUP",  label: "Collection service",  desc: "We collect from your address (CA$9.99)." },
              ].map((m) => (
                <label
                  key={m.value}
                  className="flex items-start gap-3 p-3 border border-border rounded-lg cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
                >
                  <input type="radio" name="orderType" value={m.value} required className="accent-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">{m.label}</p>
                    <p className="text-sm text-muted-foreground">{m.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </section>

          {/* Contact */}
          <section className="bg-card rounded-2xl p-6 border border-border">
            <h2 className="font-semibold text-foreground mb-4">Your Details</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Full Name *</label>
                  <input name="name" required className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Email *</label>
                  <input name="email" type="email" required className={inputCls} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Phone</label>
                <input name="phone" type="tel" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Additional Notes</label>
                <textarea
                  name="notes"
                  rows={3}
                  placeholder="Any specific concerns or instructions..."
                  className={`${inputCls} resize-none`}
                />
              </div>
            </div>
          </section>

          <button
            type="submit"
            className="w-full bg-primary hover:opacity-90 text-primary-foreground font-semibold py-4 rounded-xl transition-opacity"
          >
            Proceed to Payment
          </button>
        </form>
      </div>
    </div>
  )
}
