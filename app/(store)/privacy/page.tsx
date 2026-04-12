import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"

export const metadata = {
  title: "Privacy Policy — Allio Cosmetics",
  description: "How Allio Cosmetics collects, uses, and protects your personal information.",
}

const LAST_UPDATED = "April 12, 2026"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">Legal</p>
          <h1 className="text-4xl font-heading font-bold text-foreground mb-4">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>
        </div>

        <div className="prose prose-sm max-w-none space-y-10 text-foreground">

          <section>
            <p className="text-muted-foreground leading-relaxed">
              At Allio Cosmetics, we take your privacy seriously. This policy explains what personal information
              we collect, how we use it, and your rights regarding that information. By using our website or
              placing an order, you agree to the practices described here.
            </p>
          </section>

          <Section title="1. Information We Collect">
            <p>We collect information you provide directly to us, including:</p>
            <ul>
              <li><strong>Account information</strong> — name, email address, password, and phone number when you create an account.</li>
              <li><strong>Order information</strong> — billing name, shipping address, and order details when you place an order.</li>
              <li><strong>Payment information</strong> — credit card and payment details processed securely through Stripe. We never store your full card number.</li>
              <li><strong>Communications</strong> — messages you send us via email or contact forms.</li>
            </ul>
            <p>We also collect certain information automatically when you visit our site:</p>
            <ul>
              <li>Browser type, IP address, pages visited, and referring URLs via standard server logs.</li>
              <li>Session data managed through secure cookies.</li>
            </ul>
          </Section>

          <Section title="2. How We Use Your Information">
            <p>We use the information we collect to:</p>
            <ul>
              <li>Process and fulfil your orders, including sending order confirmations and shipping updates.</li>
              <li>Manage your account and authenticate you when you log in.</li>
              <li>Send transactional notifications (order status changes, delivery confirmations).</li>
              <li>Respond to your questions and support requests.</li>
              <li>Improve our website, products, and services.</li>
              <li>Comply with legal obligations.</li>
            </ul>
            <p>We do <strong>not</strong> sell your personal information to third parties, and we do not use it for targeted advertising.</p>
          </Section>

          <Section title="3. Sharing Your Information">
            <p>We share your information only with trusted third parties who help us operate our business:</p>
            <ul>
              <li><strong>Stripe</strong> — payment processing. Your payment data is handled directly by Stripe under their own privacy policy.</li>
              <li><strong>Shipping carriers</strong> — your name and address are shared with the carrier fulfilling your order.</li>
              <li><strong>Email service providers</strong> — used to send order confirmations and notifications.</li>
            </ul>
            <p>We may also disclose your information if required by law or to protect our legal rights.</p>
          </Section>

          <Section title="4. Data Retention">
            <p>
              We retain your personal information for as long as your account is active or as needed to provide
              our services. Order records are kept for a minimum of 7 years to comply with Canadian tax and
              accounting requirements. You may request deletion of your account at any time (see Section 6).
            </p>
          </Section>

          <Section title="5. Cookies">
            <p>
              We use essential cookies to keep you logged in and maintain your shopping cart. We do not use
              tracking or advertising cookies. You can disable cookies in your browser settings, but doing so
              may prevent you from logging in or completing a purchase.
            </p>
          </Section>

          <Section title="6. Your Rights">
            <p>Depending on your location, you may have the right to:</p>
            <ul>
              <li>Access the personal information we hold about you.</li>
              <li>Request correction of inaccurate information.</li>
              <li>Request deletion of your account and associated data.</li>
              <li>Withdraw consent for any processing based on consent.</li>
            </ul>
            <p>
              To exercise any of these rights, email us at{" "}
              <a href="mailto:privacy@alliocosmetics.com" className="text-primary hover:underline">
                privacy@alliocosmetics.com
              </a>
              . We will respond within 30 days.
            </p>
          </Section>

          <Section title="7. Security">
            <p>
              We use industry-standard measures to protect your information, including HTTPS encryption,
              secure password hashing, and access controls. However, no method of transmission over the
              internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </Section>

          <Section title="8. Children's Privacy">
            <p>
              Our website is not directed at children under the age of 13. We do not knowingly collect
              personal information from children. If you believe we have inadvertently collected such
              information, please contact us immediately.
            </p>
          </Section>

          <Section title="9. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. When we do, we will revise the
              "Last updated" date at the top of this page. Your continued use of our website after
              changes are posted constitutes acceptance of the updated policy.
            </p>
          </Section>

          <Section title="10. Contact Us">
            <p>
              If you have any questions about this Privacy Policy, please contact us at:{" "}
              <a href="mailto:privacy@alliocosmetics.com" className="text-primary hover:underline">
                privacy@alliocosmetics.com
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
