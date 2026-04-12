import Link from "next/link"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "About Us",
  description: "The story behind Allio Cosmetics and our passion for designer perfume reconditioning.",
}

const values = [
  {
    emoji: "🌹",
    title: "Craftsmanship First",
    description:
      "Every bottle that comes through our door is treated with the same care as a fine piece of jewellery. No shortcuts, no compromises.",
  },
  {
    emoji: "🌿",
    title: "Sustainably Minded",
    description:
      "Reconditioning is the most sustainable choice you can make for your fragrance. We help extend the life of what you already own.",
  },
  {
    emoji: "🔬",
    title: "Expert Knowledge",
    description:
      "Our team includes trained perfumers and restoration specialists with a combined 40+ years of experience in fine fragrance.",
  },
  {
    emoji: "💛",
    title: "Customer Obsessed",
    description:
      "We obsess over every detail of your experience — from how your booking is confirmed to how your bottle is returned.",
  },
]

const team = [
  {
    name: "Amélie Fontenay",
    role: "Founder & Head Perfumer",
    bio: "Trained at ISIPCA in Versailles, Amélie founded Allio after seeing how many beloved designer fragrances were discarded simply because the bottle had aged.",
    emoji: "👩‍🔬",
  },
  {
    name: "Marcus Webb",
    role: "Head of Restoration",
    bio: "A former watchmaker turned bottle restoration specialist, Marcus brings the same precision to Allio's hardware work as he did to Swiss timepieces.",
    emoji: "🧑‍🔧",
  },
  {
    name: "Priya Nair",
    role: "Customer Experience Lead",
    bio: "Priya oversees every customer touchpoint — from the first booking to the unboxing moment when a restored bottle arrives back at your door.",
    emoji: "👩‍💼",
  },
]

const milestones = [
  { year: "2020", event: "Allio Cosmetics founded in London by Amélie Fontenay" },
  { year: "2021", event: "First 100 bottles restored — with a 100% satisfaction rate" },
  { year: "2022", event: "Launched the Bespoke Blending service" },
  { year: "2023", event: "Expanded to mail-in orders across the UK" },
  { year: "2024", event: "Reached 500 restorations and launched online booking" },
  { year: "2025", event: "Introduced same-week express reconditioning" },
  { year: "2026", event: "Launched the Allio digital platform — shop, track & book online" },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative bg-linear-to-br from-background via-muted to-accent overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary rounded-full opacity-10 blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20 mb-6">
            Our Story
          </span>
          <h1 className="text-5xl md:text-6xl font-heading font-bold text-foreground leading-[1.1] mb-6">
            Restoring the fragrances<br />
            <span className="text-primary">you love most</span>
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Allio Cosmetics was born from a simple belief — that the best perfumes deserve a second life.
            We are London&apos;s specialist designer perfume reconditioning studio.
          </p>
        </div>
      </section>

      {/* ── Origin story ─────────────────────────────────────────────── */}
      <section className="py-20 bg-card border-y border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="aspect-square bg-linear-to-br from-primary/20 via-muted to-accent rounded-3xl flex items-center justify-center text-9xl">
                🌹
              </div>
            </div>
            <div className="space-y-6">
              <h2 className="text-3xl font-heading font-bold text-foreground">
                Born from a love of fragrance
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                In 2020, our founder Amélie Fontenay noticed something troubling — people were throwing away
                their most prized designer perfumes not because the fragrance was gone, but because the bottle
                had aged, the spray had weakened, or the concentration had faded.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                As a trained perfumer, she knew these bottles could be saved. So she started Allio — a studio
                dedicated to giving designer fragrances the care and craftsmanship they deserve.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Six years later, we&apos;ve restored over 500 bottles and built a team of specialists who share
                the same obsession with doing things properly.
              </p>
              <div className="flex gap-4 pt-2">
                <Button asChild className="bg-primary text-primary-foreground hover:opacity-90">
                  <Link href="/shop">Shop Now</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/book">Book a Service</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Values ───────────────────────────────────────────────────── */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-heading font-bold text-foreground mb-3">What we stand for</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Four principles guide every decision we make — from how we handle your bottle to how we talk to you.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => (
              <div
                key={v.title}
                className="bg-card border border-border rounded-2xl p-7 hover:border-primary/30 hover:shadow-md transition-all"
              >
                <div className="text-4xl mb-4">{v.emoji}</div>
                <h3 className="font-heading font-bold text-foreground mb-2">{v.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Timeline ─────────────────────────────────────────────────── */}
      <section className="py-20 bg-muted/50 border-y border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-heading font-bold text-foreground mb-3">Our journey</h2>
            <p className="text-muted-foreground">Six years of restoring what matters.</p>
          </div>
          <div className="space-y-0">
            {milestones.map((m, i) => (
              <div key={m.year} className="flex gap-6">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-heading font-bold text-xs shrink-0">
                    {m.year.slice(2)}
                  </div>
                  {i < milestones.length - 1 && (
                    <div className="w-px flex-1 bg-primary/20 my-1" />
                  )}
                </div>
                <div className="pb-8 pt-1.5">
                  <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-0.5">{m.year}</p>
                  <p className="text-foreground leading-relaxed">{m.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team ─────────────────────────────────────────────────────── */}
      <section className="py-20 bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-heading font-bold text-foreground mb-3">Meet the team</h2>
            <p className="text-muted-foreground">The specialists behind every restoration.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member) => (
              <div
                key={member.name}
                className="bg-card border border-border rounded-2xl p-8 text-center hover:border-primary/30 hover:shadow-md transition-all"
              >
                <div className="w-20 h-20 rounded-full bg-linear-to-br from-primary/20 to-muted flex items-center justify-center text-4xl mx-auto mb-4">
                  {member.emoji}
                </div>
                <h3 className="font-heading font-bold text-foreground mb-0.5">{member.name}</h3>
                <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-3">{member.role}</p>
                <p className="text-muted-foreground text-sm leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <section className="py-20 bg-primary">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-heading font-bold text-primary-foreground mb-4">
            Ready to restore your bottle?
          </h2>
          <p className="text-primary-foreground/80 mb-8 leading-relaxed">
            Browse our collections or book directly — we turn around most orders in under 5 days.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/shop"
              className="bg-primary-foreground text-primary font-semibold px-8 py-3.5 rounded-xl hover:opacity-90 transition-opacity"
            >
              Shop Now
            </Link>
            <Link
              href="/contact"
              className="border border-primary-foreground/40 text-primary-foreground font-semibold px-8 py-3.5 rounded-xl hover:bg-primary-foreground/10 transition-colors"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
