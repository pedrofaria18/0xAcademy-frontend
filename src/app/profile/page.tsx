'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/header';
import { useWeb3Auth } from '@/hooks/useWeb3Auth';
import { userAPI, coursesAPI } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Wallet,
  Mail,
  Globe,
  Award,
  BookOpen,
  Settings,
  Save
} from 'lucide-react';
import toast from 'react-hot-toast';

interface UserProfile {
  display_name: string;
  email: string;
  bio: string;
  website: string;
  wallet_address: string;
  role: string;
  created_at: string;
  total_courses: number;
  total_certificates: number;
}

export default function ProfilePage() {
  const { user, isAuthenticated } = useWeb3Auth();
  const [profile, setProfile] = useState<UserProfile>({
    display_name: '',
    email: '',
    bio: '',
    website: '',
    wallet_address: '',
    role: 'student',
    created_at: '',
    total_courses: 0,
    total_certificates: 0,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadProfile();
    }
  }, [isAuthenticated, user]);

  const loadProfile = async () => {
    try {
      setLoading(true);

      // Carregar perfil do usuário
      const { user: profileData } = await userAPI.getProfile();

      // Carregar cursos matriculados para contagem
      let totalCourses = 0;
      let totalCertificates = 0;
      try {
        const enrolled = await coursesAPI.getEnrolled();
        totalCourses = enrolled.enrollments?.length || 0;

        const certificates = await userAPI.getCertificates();
        totalCertificates = certificates.certificates?.length || 0;
      } catch (e) {
        console.log('Could not load counts');
      }

      setProfile({
        display_name: profileData.display_name || '',
        email: '', // Email não está disponível no backend ainda
        bio: profileData.bio || '',
        website: (profileData.social_links as any)?.website || '',
        wallet_address: profileData.wallet_address || '',
        role: 'student', // Role não está disponível no backend
        created_at: profileData.created_at || '',
        total_courses: totalCourses,
        total_certificates: totalCertificates,
      });
    } catch (error) {
      toast.error('Erro ao carregar perfil');
      console.error('Profile error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await userAPI.updateProfile({
        display_name: profile.display_name,
        bio: profile.bio,
        social_links: {
          website: profile.website,
        },
      });

      toast.success('Perfil atualizado com sucesso!');
      setIsEditing(false);
    } catch (error) {
      toast.error('Erro ao atualizar perfil');
      console.error('Update profile error:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <>
        <Header />
        <main className="flex-1 container py-24">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Acesso Negado</h1>
            <p className="mt-4 text-muted-foreground">
              Por favor, conecte sua wallet para acessar seu perfil
            </p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="container py-8 max-w-4xl">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Meu Perfil</h1>
              <p className="mt-2 text-muted-foreground">
                Gerencie suas informações pessoais
              </p>
            </div>
            <Button
              variant={isEditing ? 'outline' : 'default'}
              onClick={() => {
                if (isEditing) {
                  loadProfile(); // Cancel and reload
                }
                setIsEditing(!isEditing);
              }}
            >
              {isEditing ? 'Cancelar' : <><Settings className="mr-2 h-4 w-4" /> Editar</>}
            </Button>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Profile Card */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="h-24 w-24 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white text-3xl font-bold mb-4">
                      {profile.display_name.charAt(0).toUpperCase()}
                    </div>
                    <h2 className="text-xl font-bold">{profile.display_name}</h2>
                    <Badge className="mt-2" variant="secondary">
                      {profile.role === 'instructor' ? 'Instrutor' : 'Estudante'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Stats Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Estatísticas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Cursos</span>
                    </div>
                    <span className="font-bold">{profile.total_courses}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Award className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Certificados</span>
                    </div>
                    <span className="font-bold">{profile.total_certificates}</span>
                  </div>
                  <div className="pt-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      Membro desde
                    </div>
                    <div className="font-medium">
                      {new Date(profile.created_at).toLocaleDateString('pt-BR', {
                        month: 'long',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Informações Pessoais</CardTitle>
                  <CardDescription>
                    Atualize suas informações de perfil
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>Nome de Exibição</span>
                    </label>
                    <Input
                      value={profile.display_name}
                      onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Seu nome"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span>Email</span>
                    </label>
                    <Input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      disabled={!isEditing}
                      placeholder="seu@email.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center space-x-2">
                      <Globe className="h-4 w-4" />
                      <span>Website</span>
                    </label>
                    <Input
                      value={profile.website}
                      onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                      disabled={!isEditing}
                      placeholder="https://seusite.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Bio</label>
                    <textarea
                      className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={profile.bio}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Conte um pouco sobre você..."
                    />
                  </div>

                  {isEditing && (
                    <Button onClick={handleSave} className="w-full">
                      <Save className="mr-2 h-4 w-4" />
                      Salvar Alterações
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Wallet Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Informações da Wallet</CardTitle>
                  <CardDescription>
                    Sua carteira conectada
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center space-x-2">
                      <Wallet className="h-4 w-4" />
                      <span>Endereço da Wallet</span>
                    </label>
                    <div className="flex items-center space-x-2">
                      <Input
                        value={profile.wallet_address}
                        disabled
                        className="font-mono text-xs"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(profile.wallet_address);
                          toast.success('Endereço copiado!');
                        }}
                      >
                        Copiar
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Seu endereço de wallet não pode ser alterado
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Certificates */}
              <Card>
                <CardHeader>
                  <CardTitle>Certificados NFT</CardTitle>
                  <CardDescription>
                    Seus certificados conquistados na blockchain
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {profile.total_certificates === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Award className="mx-auto h-12 w-12 mb-4" />
                      <p>Você ainda não possui certificados</p>
                      <p className="text-sm">Complete cursos para ganhar certificados NFT</p>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>Seus certificados aparecerão aqui em breve</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
