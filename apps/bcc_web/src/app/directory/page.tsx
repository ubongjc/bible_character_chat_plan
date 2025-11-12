'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Filter, Star } from 'lucide-react';

interface Character {
  id: string;
  name: string;
  type: string;
  alignment: string;
  description: string;
  is_featured: boolean;
  featured_order: number;
  roles: string[];
  books: string[];
}

export default function DirectoryPage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [sort, setSort] = useState('featured');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCharacters();
  }, [filter, sort, search]);

  const fetchCharacters = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter) params.append('filter', filter);
      if (sort) params.append('sort', sort);
      if (search) params.append('search', search);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/characters?${params}`
      );
      const data = await response.json();
      setCharacters(data.characters || []);
    } catch (error) {
      console.error('Failed to fetch characters:', error);
    } finally {
      setLoading(false);
    }
  };

  const featuredCharacters = characters.filter((c) => c.is_featured);
  const otherCharacters = characters.filter((c) => !c.is_featured);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">📖</span>
            <h1 className="text-xl font-bold">Bible Character Chat</h1>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/directory">
              <Button variant="ghost">Directory</Button>
            </Link>
            <Link href="/threads">
              <Button variant="ghost">Threads</Button>
            </Link>
            <Link href="/profile">
              <Button variant="ghost">Profile</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="container px-4 py-8">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search characters..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <select
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="">All Types</option>
                <option value="type:person">People</option>
                <option value="type:divine">Divine</option>
                <option value="type:angel">Angels</option>
                <option value="type:demon">Demons</option>
                <option value="type:group">Groups</option>
              </select>
              <select
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="featured">Featured First</option>
                <option value="name">Name (A-Z)</option>
                <option value="influence">Influence</option>
                <option value="controversy">Controversy</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading characters...</p>
          </div>
        ) : (
          <>
            {/* Featured Characters */}
            {featuredCharacters.length > 0 && (
              <section className="mb-12">
                <h2 className="mb-6 text-3xl font-bold">Featured Characters</h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
                  {featuredCharacters.map((character) => (
                    <Link key={character.id} href={`/chat/${character.id}`}>
                      <Card className="h-full transition-all hover:shadow-lg">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-lg">{character.name}</CardTitle>
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          </div>
                          <CardDescription className="line-clamp-3">
                            {character.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-1">
                            {character.roles.slice(0, 2).map((role) => (
                              <span
                                key={role}
                                className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary"
                              >
                                {role}
                              </span>
                            ))}
                          </div>
                          {character.alignment === 'antagonist' && (
                            <div className="mt-2 text-xs text-destructive">⚠️ Antagonist</div>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* All Characters */}
            {otherCharacters.length > 0 && (
              <section>
                <h2 className="mb-6 text-3xl font-bold">All Characters</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {otherCharacters.map((character) => (
                    <Link key={character.id} href={`/chat/${character.id}`}>
                      <Card className="h-full transition-all hover:shadow-lg">
                        <CardHeader>
                          <CardTitle className="text-lg">{character.name}</CardTitle>
                          <CardDescription className="line-clamp-2">
                            {character.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-1">
                            {character.roles.slice(0, 3).map((role) => (
                              <span
                                key={role}
                                className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary"
                              >
                                {role}
                              </span>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {characters.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No characters found.</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
