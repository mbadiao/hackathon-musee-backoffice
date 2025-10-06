import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface LoginFormProps {
  onLogin?: () => void;
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success && data.user) {
        // Mettre à jour le contexte d'authentification
        login(data.user);
        
        // Stocker les informations de l'utilisateur si "se souvenir de moi" est coché
        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        }
        
        // Déclencher le callback optionnel de connexion réussie
        if (onLogin) {
          onLogin();
        }
      } else {
        setError(data.message || 'Erreur lors de la connexion');
      }
    } catch (err) {
      console.error('Erreur de connexion:', err);
      setError('Erreur de connexion au serveur. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left side - Museum image with gradient overlay */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <ImageWithFallback
          src="/imageDf1.png"
          alt="Musée"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/75 to-[#1a1a1a]/85" />
        
        {/* Subtle clay overlay effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#D2691E]/5 via-transparent to-transparent" />
        
        <div className="relative z-10 flex flex-col justify-center px-12 text-foreground">
          <div className="mb-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#D2691E]/20 to-[#E07A5F]/10 border border-[#D2691E]/40 flex items-center justify-center mb-6 backdrop-blur-sm">
              <svg
                className="w-10 h-10 text-[#D2691E]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
          </div>
          
          <h1 className="mb-4 text-4xl font-medium tracking-tight text-white">
            Museum <span className="text-[#D2691E]">Admin</span>
          </h1>
          <p className="text-lg text-gray-300 leading-relaxed max-w-md">
            Advanced collection management platform with AI-powered insights and real-time analytics
          </p>
          
          {/* Decorative clay line */}
          <div className="mt-8 w-24 h-px bg-gradient-to-r from-[#D2691E] to-transparent"></div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center px-8 py-12 relative bg-gray-50">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_#f8f9fa_0%,_#ffffff_100%)]"></div>
        
        <div className="w-full max-w-md relative z-10">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="mb-2 text-3xl font-medium text-foreground">Welcome Back</h2>
            <p className="text-[#8AA79B]">
              Access your admin dashboard
            </p>
          </div>

          {/* Login Card */}
          <Card className="border border-gray-200 bg-white/80 backdrop-blur-xl shadow-2xl shadow-black/5">
            <CardContent className="p-8">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700">Email Address</Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@museum.org"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-12 bg-white border-gray-200 focus:border-[#D2691E] focus:ring-[#D2691E]/20 text-gray-900 placeholder:text-gray-400 transition-all duration-200"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 bg-white border-gray-200 focus:border-[#D2691E] focus:ring-[#D2691E]/20 text-gray-900 placeholder:text-gray-400 transition-all duration-200"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                      className="border-gray-300 data-[state=checked]:bg-[#D2691E] data-[state=checked]:border-[#D2691E]"
                    />
                    <Label htmlFor="remember" className="text-sm text-gray-600">
                      Remember me
                    </Label>
                  </div>
                  
                  <Button
                    type="button"
                    variant="link"
                    className="px-0 h-auto text-sm text-[#D2691E] hover:text-[#E07A5F] transition-colors"
                  >
                    Forgot password?
                  </Button>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-[#D2691E] hover:bg-[#E07A5F] text-white font-medium transition-all duration-200 shadow-lg shadow-[#D2691E]/20 hover:shadow-[#D2691E]/30 hover:shadow-xl"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Authenticating...</span>
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="text-center text-sm text-gray-600">
                  <p className="mb-2">Need assistance?</p>
                  <Button 
                    variant="link" 
                    className="px-0 h-auto text-sm text-[#D2691E] hover:text-[#E07A5F] transition-colors"
                  >
                    Contact IT Support
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Security notice */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Secured with end-to-end encryption
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}