import { Auth as SupabaseAuth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function Auth() {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate('/chat');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/chat'
        }
      });

      if (error) throw error;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to sign in with Google. Make sure Google OAuth is configured in your backend settings.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8 animate-fade-in">
          <div className="mb-6">
            <div className="inline-block">
              <h1 className="text-6xl font-bold mb-3 bg-gradient-cyber bg-clip-text text-transparent animate-scale-in">
                Gromo GPT
              </h1>
              <div className="h-1 bg-gradient-cyber rounded-full w-full animate-slide-in-right" />
            </div>
          </div>
          <p className="text-muted-foreground text-lg">AI-Powered Chat & Creation Platform</p>
          <p className="text-sm text-muted-foreground/70 mt-2">
            Built with Lovable AI • Image Generation • PDF Export
          </p>
        </div>
        
        <div className="bg-card/80 border border-border rounded-2xl p-8 shadow-glow-cyan backdrop-blur-md animate-fade-in">
          <div className="mb-6">
            <Button
              onClick={handleGoogleSignIn}
              className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 flex items-center justify-center gap-3"
              size="lg"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </Button>
            
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-card text-muted-foreground">Or continue with email</span>
              </div>
            </div>
          </div>
          
          <SupabaseAuth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: 'hsl(189 100% 50%)',
                    brandAccent: 'hsl(262 83% 58%)',
                    brandButtonText: 'hsl(217 33% 6%)',
                    defaultButtonBackground: 'hsl(217 32% 17%)',
                    defaultButtonBackgroundHover: 'hsl(217 32% 20%)',
                    inputBackground: 'hsl(217 32% 17%)',
                    inputBorder: 'hsl(217 32% 17%)',
                    inputBorderHover: 'hsl(189 100% 50%)',
                    inputBorderFocus: 'hsl(189 100% 50%)',
                  },
                },
              },
            }}
            providers={[]}
            redirectTo={window.location.origin}
          />

          <p className="text-center text-xs text-muted-foreground mt-6">
            <strong>To enable Google sign-in:</strong><br />
            Go to backend settings → Users → Auth Settings → Google Settings
          </p>
        </div>

        <p className="text-center text-xs text-muted-foreground/50 mt-6">
          Secure authentication powered by Lovable Cloud
        </p>
      </div>
    </div>
  );
}
