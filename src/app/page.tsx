'use client';

import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { type LucideIcon, ArrowRight, BookOpen, Award, Users, Shield } from 'lucide-react';
import { useWeb3Auth } from '@/hooks/useWeb3Auth';
import { useEffect, useState } from 'react';

/**
 * Platform Features - Static Data
 * Moved outside component to prevent recreation on every render
 */
interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

const PLATFORM_FEATURES: readonly Feature[] = [
  {
    icon: BookOpen,
    title: 'Conteúdo Especializado',
    description: 'Cursos criados por experts em blockchain, DeFi, NFTs e Web3',
  },
  {
    icon: Shield,
    title: 'Autenticação Web3',
    description: 'Login seguro com MetaMask, sem senhas ou dados pessoais',
  },
  {
    icon: Award,
    title: 'Certificados NFT',
    description: 'Receba certificados verificáveis na blockchain ao completar cursos',
  },
  {
    icon: Users,
    title: 'Comunidade Ativa',
    description: 'Conecte-se com outros entusiastas e profissionais do Web3',
  },
] as const;

/**
 * Home Page Component
 * Landing page with hero, features, and CTA sections
 */
export default function HomePage() {
  const { isAuthenticated, handleLogin } = useWeb3Auth();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch for auth-dependent UI
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="container py-24 sm:py-32">
          <div className="mx-auto max-w-[980px] text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Aprenda sobre o mundo{' '}
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Blockchain e Web3
              </span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground sm:text-xl max-w-[700px] mx-auto">
              Domine blockchain, criptomoedas, DeFi e desenvolvimento Web3 com cursos práticos
              e certificados verificáveis na blockchain.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
              {mounted ? (
                isAuthenticated ? (
                  <Button size="lg" className="gap-2" asChild>
                    <Link href="/courses">
                      Explorar Cursos
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                ) : (
                  <Button size="lg" onClick={handleLogin} className="gap-2">
                    Conectar Wallet
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )
              ) : (
                // Skeleton button during SSR
                <Button size="lg" disabled className="gap-2">
                  Carregando...
                </Button>
              )}
              <Button size="lg" variant="outline" asChild>
                <Link href="/courses">Ver Catálogo</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container py-24 sm:py-32">
          <div className="mx-auto max-w-[980px] text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Por que escolher nossa plataforma?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Combinamos o melhor da educação online com a tecnologia blockchain
            </p>
          </div>
          
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PLATFORM_FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group relative overflow-hidden rounded-lg border bg-background p-6 hover:bg-accent transition-all duration-200"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mt-4 font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA Section */}
        <section className="container py-24 sm:py-32">
          <div className="mx-auto max-w-[800px] rounded-lg border bg-card p-8 text-center sm:p-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Comece sua jornada Web3 hoje
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Junte-se a milhares de alunos que estão construindo o futuro descentralizado
            </p>
            <div className="mt-8">
              {mounted ? (
                isAuthenticated ? (
                  <Button size="lg" asChild>
                    <Link href="/dashboard">Acessar Dashboard</Link>
                  </Button>
                ) : (
                  <Button size="lg" onClick={handleLogin}>
                    Começar Agora
                  </Button>
                )
              ) : (
                <Button size="lg" disabled>
                  Carregando...
                </Button>
              )}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
