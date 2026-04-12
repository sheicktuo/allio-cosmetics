import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"

export const metadata = {
  title: "Terms & Conditions — Allio Cosmetics",
  description: "The terms and conditions governing your use of Allio Cosmetics and purchases made on our platform.",
}

const LAST_UPDATED = "April 12, 2026"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">Legal</p>
          <h1 className="text-4xl font-heading font-bold text-foreground mb-4">Terms & Conditions</h1>
          <p className="text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>
        </div>

        <div className="prose prose-sm max-w-none space-y-10 text-foreground">

          <section>
            <p className="text-muted-foreground leading-relaxed">
              These Terms & Conditions govern your use of the Allio Cosmetics website and any purchases you
              make through it. By accessing our site or placing an order, you agree to be bound by these terms.
              Please read them carefully.
            </p>
          </section>

          <Section title="1. About Us">
            <p>
              Allio Cosmetics is an online retailer of premium fragrances, operating in Canada. References to
              &quot;we&quot;, &quot;us&quot;, or &quot;our&quot; refer to Allio Cosmetics. References to &quot;you&quot; or &quot;your&quot; refer to the
              customer using our website.
            </p>
          </Section>

          <Section title="2. Eligibility">
            <p>
              You must be at least 18 years old and capable of forming a legally binding contract to place an
              order. By using this site, you confirm that you meet these requirements.
            </p>
          </Section>

          <Section title="3. Products & Pricing">
            <ul>
              <li>All prices are displayed in Canadian Dollars (CAD) and include applicable taxes unless stated otherwise.</li>
              <li>We reserve the right to change prices at any time. Prices shown at the time of your order are the prices you will be charged.</li>
              <li>Product images are for illustrative purposes. Actual products may vary slightly in appearance.</li>
              <li>We reserve the right to discontinue any product at any time.</li>
            </ul>
          </Section>

          <Section title="4. Orders & Payment">
            <ul>
              <li>Placing an order constitutes an offer to purchase. We reserve the right to accept or decline any order.</li>
              <li>Once payment is successfully processed, you will receive an order confirmation by email.</li>
              <li>Payments are processed securely through Stripe. We accept major credit and debit cards.</li>
              <li>You are responsible for ensuring your payment information is accurate and up to date.</li>
              <li>In the event of a pricing error, we will notify you and offer the option to proceed at the correct price or cancel your order.</li>
            </ul>
          </Section>

          <Section title="5. Shipping & Delivery">
            <ul>
              <li>We ship within Canada. Shipping options and estimated delivery times are shown at checkout.</li>
              <li>Orders over CA$75 qualify for free standard shipping.</li>
              <li>Delivery times are estimates only and are not guaranteed. We are not liable for delays caused by carriers or circumstances beyond our control.</li>
              <li>Risk of loss and title for products pass to you upon delivery to the carrier.</li>
            </ul>
          </Section>

          <Section title="6. Returns & Refunds">
            <ul>
              <li>You may return unused, unopened products within <strong>30 days</strong> of delivery for a full refund.</li>
              <li>Opened or used products are not eligible for return unless they are defective or damaged.</li>
              <li>To initiate a return, contact us at{" "}
                <a href="mailto:returns@alliocosmetics.com" className="text-primary hover:underline">
                  returns@alliocosmetics.com
                </a>{" "}
                with your order number and reason for return.
              </li>
              <li>Refunds will be issued to your original payment method within 5–10 business days of receiving the returned item.</li>
              <li>Return shipping costs are the responsibility of the customer unless the item was defective or incorrectly sent.</li>
            </ul>
          </Section>

          <Section title="7. Promo Codes & Discounts">
            <ul>
              <li>Promo codes must be entered at checkout and cannot be applied retroactively.</li>
              <li>Only one promo code may be used per order.</li>
              <li>We reserve the right to cancel orders where promo codes are used fraudulently or in violation of their terms.</li>
            </ul>
          </Section>

          <Section title="8. Accounts">
            <ul>
              <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
              <li>You are responsible for all activity that occurs under your account.</li>
              <li>Notify us immediately if you suspect unauthorised access to your account.</li>
              <li>We reserve the right to suspend or terminate accounts that violate these terms.</li>
            </ul>
          </Section>

          <Section title="9. Intellectual Property">
            <p>
              All content on this website — including text, images, logos, and product descriptions — is
              owned by or licensed to Allio Cosmetics and is protected by applicable copyright and trademark
              laws. You may not reproduce, distribute, or create derivative works from our content without
              prior written permission.
            </p>
          </Section>

          <Section title="10. Limitation of Liability">
            <p>
              To the fullest extent permitted by law, Allio Cosmetics shall not be liable for any indirect,
              incidental, special, or consequential damages arising from your use of our website or products.
              Our total liability for any claim shall not exceed the amount you paid for the relevant order.
            </p>
          </Section>

          <Section title="11. Governing Law">
            <p>
              These terms are governed by and construed in accordance with the laws of the Province of Ontario
              and the federal laws of Canada applicable therein. Any disputes shall be subject to the exclusive
              jurisdiction of the courts of Ontario.
            </p>
          </Section>

          <Section title="12. Changes to These Terms">
            <p>
              We may update these Terms & Conditions at any time. Changes take effect when posted on this page.
              Your continued use of our website after changes are posted constitutes your acceptance of the
              updated terms.
            </p>
          </Section>

          <Section title="13. Contact Us">
            <p>
              For questions about these terms, please contact us at:{" "}
              <a href="mailto:legal@alliocosmetics.com" className="text-primary hover:underline">
                legal@alliocosmetics.com
              </a>
            </p>
          </Section>

        </div>
      </div>

      <Footer />
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-heading font-bold text-foreground mb-3">{title}</h2>
      <div className="space-y-3 text-muted-foreground leading-relaxed text-sm [&_strong]:text-foreground [&_a]:text-primary [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5">
        {children}
      </div>
    </section>
  )
}
