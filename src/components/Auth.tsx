import { Auth as SupabaseAuth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

export default function Auth() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showFirebaseConfig, setShowFirebaseConfig] = useState(false);
  const [firebaseConfig, setFirebaseConfig] = useState({
    apiKey: 'AIzaSyDsJxpNa_PKylt-HhPLrnPmSMDi6ssYsqc',
    authDomain: 'fir-e02e2.firebaseapp.com',
    projectId: 'fir-e02e2',
    storageBucket: 'fir-e02e2.firebasestorage.app',
    messagingSenderId: '304693076469',
    appId: '1:304693076469:web:a8dcb552bc65a5cbe580bc',
    measurementId: 'G-3SH8Q93E9P'
  });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate('/chat');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const saveFirebaseConfig = () => {
    localStorage.setItem('firebase_config', JSON.stringify(firebaseConfig));
    toast({
      title: 'Firebase Config Saved',
      description: 'Google OAuth will be available on next login',
    });
    setShowFirebaseConfig(false);
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
            Built with OpenAI • Image Generation • PDF Export
          </p>
        </div>
        
        <div className="bg-card/80 border border-border rounded-2xl p-8 shadow-glow-cyan backdrop-blur-md animate-fade-in">
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

          <div className="mt-6 text-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFirebaseConfig(!showFirebaseConfig)}
              className="text-xs"
            >
              {showFirebaseConfig ? 'Hide' : 'Configure'} Firebase Google OAuth
            </Button>
          </div>

          {showFirebaseConfig && (
            <div className="mt-4 space-y-3 animate-fade-in">
              <p className="text-xs text-muted-foreground">
                Firebase configuration for Google sign-in:
              </p>
              <Input
                placeholder="Firebase API Key"
                value={firebaseConfig.apiKey}
                onChange={(e) => setFirebaseConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                className="bg-input border-border"
              />
              <Input
                placeholder="Auth Domain"
                value={firebaseConfig.authDomain}
                onChange={(e) => setFirebaseConfig(prev => ({ ...prev, authDomain: e.target.value }))}
                className="bg-input border-border"
              />
              <Input
                placeholder="Project ID"
                value={firebaseConfig.projectId}
                onChange={(e) => setFirebaseConfig(prev => ({ ...prev, projectId: e.target.value }))}
                className="bg-input border-border"
              />
              <Input
                placeholder="Storage Bucket"
                value={firebaseConfig.storageBucket}
                onChange={(e) => setFirebaseConfig(prev => ({ ...prev, storageBucket: e.target.value }))}
                className="bg-input border-border"
              />
              <Input
                placeholder="Messaging Sender ID"
                value={firebaseConfig.messagingSenderId}
                onChange={(e) => setFirebaseConfig(prev => ({ ...prev, messagingSenderId: e.target.value }))}
                className="bg-input border-border"
              />
              <Input
                placeholder="App ID"
                value={firebaseConfig.appId}
                onChange={(e) => setFirebaseConfig(prev => ({ ...prev, appId: e.target.value }))}
                className="bg-input border-border"
              />
              <Input
                placeholder="Measurement ID"
                value={firebaseConfig.measurementId}
                onChange={(e) => setFirebaseConfig(prev => ({ ...prev, measurementId: e.target.value }))}
                className="bg-input border-border"
              />
              <Button
                onClick={saveFirebaseConfig}
                className="w-full bg-gradient-cyber hover:shadow-glow-cyan"
                size="sm"
              >
                Save Firebase Config
              </Button>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground/50 mt-6">
          Secure authentication powered by Lovable Cloud
        </p>
      </div>
    </div>
  );
}
