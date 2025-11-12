import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📖</span>
            <h1 className="text-xl font-bold">Bible Character Chat</h1>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="container flex flex-col items-center justify-center gap-8 px-4 py-24 text-center">
          <div className="space-y-4">
            <h2 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
              Converse with Scripture-Grounded Personas
            </h2>
            <p className="mx-auto max-w-[700px] text-lg text-muted-foreground md:text-xl">
              Engage in authentic conversations with biblical characters. Every response is
              backed by Scripture citations and educational context.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <Link href="/directory">
              <Button size="lg" className="w-full sm:w-auto">
                Browse Characters
              </Button>
            </Link>
            <Link href="/about">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Learn More
              </Button>
            </Link>
          </div>
        </section>

        {/* Featured Characters */}
        <section className="border-t bg-muted/50 py-16">
          <div className="container px-4">
            <h3 className="mb-8 text-center text-3xl font-bold">Featured Characters</h3>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
              {[
                { name: 'Jesus of Nazareth', emoji: '✝️' },
                { name: 'Moses', emoji: '📜' },
                { name: 'King David', emoji: '👑' },
                { name: 'Paul the Apostle', emoji: '✍️' },
                { name: 'Mary', emoji: '🕊️' },
                { name: 'Esther', emoji: '⭐' },
                { name: 'Judas Iscariot', emoji: '⚠️' },
                { name: 'Satan', emoji: '😈' },
                { name: 'Michael', emoji: '⚔️' },
                { name: 'God', emoji: '✨' },
              ].map((character) => (
                <Link
                  key={character.name}
                  href="/directory"
                  className="flex flex-col items-center gap-3 rounded-lg border bg-card p-6 transition-colors hover:bg-accent"
                >
                  <span className="text-4xl">{character.emoji}</span>
                  <span className="text-center font-medium">{character.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16">
          <div className="container px-4">
            <h3 className="mb-12 text-center text-3xl font-bold">Key Features</h3>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-3">
                <div className="text-4xl">📚</div>
                <h4 className="text-xl font-semibold">Scripture-Grounded</h4>
                <p className="text-muted-foreground">
                  Every response includes verse citations and is faithful to canonical texts.
                </p>
              </div>
              <div className="space-y-3">
                <div className="text-4xl">🎭</div>
                <h4 className="text-xl font-semibold">Authentic Personas</h4>
                <p className="text-muted-foreground">
                  Characters speak with their biblical voice, including complex and
                  antagonistic figures.
                </p>
              </div>
              <div className="space-y-3">
                <div className="text-4xl">🔍</div>
                <h4 className="text-xl font-semibold">Educational Context</h4>
                <p className="text-muted-foreground">
                  Deception flags, counter-voice overlays, and scholarly annotations.
                </p>
              </div>
              <div className="space-y-3">
                <div className="text-4xl">🎙️</div>
                <h4 className="text-xl font-semibold">Voice Calls</h4>
                <p className="text-muted-foreground">
                  Have real-time voice conversations with characters, complete with
                  transcripts.
                </p>
              </div>
              <div className="space-y-3">
                <div className="text-4xl">👥</div>
                <h4 className="text-xl font-semibold">Group Panels</h4>
                <p className="text-muted-foreground">
                  Experience conversations between multiple biblical figures simultaneously.
                </p>
              </div>
              <div className="space-y-3">
                <div className="text-4xl">🌍</div>
                <h4 className="text-xl font-semibold">Multilingual</h4>
                <p className="text-muted-foreground">
                  Converse in your language while preserving original Scripture quotations.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container px-4 text-center text-sm text-muted-foreground">
          <p>
            Bible Character Chat is an educational tool. Not a replacement for clergy,
            scholarship, or personal study.
          </p>
          <p className="mt-2">© 2024 Bible Character Chat. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
