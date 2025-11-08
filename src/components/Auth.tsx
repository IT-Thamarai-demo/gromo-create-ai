import { Auth as SupabaseAuth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Auth() {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate('/chat');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-5xl font-bold mb-3 bg-gradient-cyber bg-clip-text text-transparent">
            Gromo GPT
          </h1>
          <p className="text-muted-foreground">AI-Powered Chat & Creation Platform</p>
        </div>
        
        <div className="bg-card border border-border rounded-2xl p-8 shadow-glow-cyan backdrop-blur-sm">
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
            providers={['google']}
            redirectTo={window.location.origin}
          />
        </div>
      </div>
    </div>
  );
}
