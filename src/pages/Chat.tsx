import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Send, Settings, Download, Image as ImageIcon, LogOut } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  image?: string;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate('/');
    });

    const stored = localStorage.getItem('openai_api_key');
    if (stored) setApiKey(stored);
  }, [navigate]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !apiKey) {
      toast({
        title: 'Missing Information',
        description: !apiKey ? 'Please set your OpenAI API key in settings' : 'Please enter a message',
        variant: 'destructive',
      });
      return;
    }

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('chat', {
        body: { messages: [...messages, userMessage], apiKey }
      });

      if (error) throw error;

      setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to get response',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!input.trim() || !apiKey) {
      toast({
        title: 'Missing Information',
        description: !apiKey ? 'Please set your OpenAI API key' : 'Please enter a prompt',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: { prompt: input, apiKey }
      });

      if (error) throw error;

      setMessages(prev => [...prev, 
        { role: 'user', content: `Generate image: ${input}` },
        { role: 'assistant', content: 'Image generated:', image: data.imageUrl }
      ]);
      setInput('');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate image',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('export-pdf', {
        body: { messages }
      });

      if (error) throw error;

      const link = document.createElement('a');
      link.href = `data:application/pdf;base64,${data.pdf}`;
      link.download = 'chat-export.pdf';
      link.click();

      toast({
        title: 'Success',
        description: 'Chat exported to PDF',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to export PDF',
        variant: 'destructive',
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const saveApiKey = () => {
    localStorage.setItem('openai_api_key', apiKey);
    setShowSettings(false);
    toast({
      title: 'Success',
      description: 'API key saved',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-dark flex flex-col">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-cyber bg-clip-text text-transparent">
            Gromo GPT
          </h1>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={() => setShowSettings(!showSettings)}>
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleExportPDF} disabled={messages.length === 0}>
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {showSettings && (
        <div className="border-b border-border bg-card/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="container mx-auto max-w-2xl">
            <label className="block mb-2 text-sm font-medium">OpenAI API Key</label>
            <div className="flex gap-2">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="flex-1 bg-input border border-border rounded-lg px-4 py-2"
                placeholder="sk-..."
              />
              <Button onClick={saveApiKey}>Save</Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4">
        <div className="container mx-auto max-w-4xl space-y-6">
          {messages.map((message, i) => (
            <div
              key={i}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-6 py-4 ${
                  message.role === 'user'
                    ? 'bg-gradient-cyber text-primary-foreground shadow-glow-cyan'
                    : 'bg-card border border-border shadow-glow-purple'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                {message.image && (
                  <img src={message.image} alt="Generated" className="mt-4 rounded-lg max-w-full" />
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start animate-fade-in">
              <div className="bg-card border border-border rounded-2xl px-6 py-4">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t border-border bg-card/50 backdrop-blur-sm p-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Type your message..."
              className="bg-input border-border resize-none"
              rows={3}
            />
            <div className="flex flex-col gap-2">
              <Button onClick={handleSend} disabled={isLoading} size="icon">
                <Send className="h-4 w-4" />
              </Button>
              <Button onClick={handleGenerateImage} disabled={isLoading} size="icon" variant="secondary">
                <ImageIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
