import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Send, Download, Image as ImageIcon, LogOut, Menu } from 'lucide-react';
import ConversationSidebar from '@/components/ConversationSidebar';
import FileUpload from '@/components/FileUpload';
import VoiceInterface from '@/components/VoiceInterface';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  image?: string;
  fileUrl?: string;
  fileName?: string;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate('/');
    });
  }, [navigate]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const loadConversation = async (conversationId: string) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading messages:', error);
      return;
    }

    setMessages(data.map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
      image: msg.image_url || undefined,
      fileUrl: msg.file_url || undefined,
      fileName: msg.file_name || undefined,
    })));
    setCurrentConversationId(conversationId);
  };

  const createNewConversation = async (firstMessage: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const title = firstMessage.slice(0, 50) + (firstMessage.length > 50 ? '...' : '');
    
    const { data, error } = await supabase
      .from('conversations')
      .insert({ user_id: user.id, title })
      .select()
      .single();

    if (error) {
      console.error('Error creating conversation:', error);
      return null;
    }

    return data.id;
  };

  const saveMessage = async (conversationId: string, message: Message) => {
    const { error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        role: message.role,
        content: message.content,
        image_url: message.image,
        file_url: message.fileUrl,
        file_name: message.fileName,
      });

    if (error) {
      console.error('Error saving message:', error);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please enter a message',
        variant: 'destructive',
      });
      return;
    }

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      let convId = currentConversationId;
      if (!convId) {
        convId = await createNewConversation(input);
        if (convId) setCurrentConversationId(convId);
      }

      if (convId) {
        await saveMessage(convId, userMessage);
      }

      const { data, error } = await supabase.functions.invoke('chat', {
        body: { messages: [...messages, userMessage] }
      });

      if (error) throw error;

      const assistantMessage: Message = { role: 'assistant', content: data.content };
      setMessages(prev => [...prev, assistantMessage]);

      if (convId) {
        await saveMessage(convId, assistantMessage);
      }
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
    if (!input.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please enter a prompt',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      let convId = currentConversationId;
      if (!convId) {
        convId = await createNewConversation(`Image: ${input}`);
        if (convId) setCurrentConversationId(convId);
      }

      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: { prompt: input }
      });

      if (error) throw error;

      const userMsg: Message = { role: 'user', content: `Generate image: ${input}` };
      const assistantMsg: Message = { role: 'assistant', content: 'Image generated:', image: data.imageUrl };
      
      setMessages(prev => [...prev, userMsg, assistantMsg]);

      if (convId) {
        await saveMessage(convId, userMsg);
        await saveMessage(convId, assistantMsg);
      }

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

  const handleFileUploaded = (url: string, fileName: string) => {
    const fileMessage: Message = {
      role: 'user',
      content: `Uploaded file: ${fileName}`,
      fileUrl: url,
      fileName,
    };
    setMessages(prev => [...prev, fileMessage]);
    
    if (currentConversationId) {
      saveMessage(currentConversationId, fileMessage);
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
      link.download = 'gromo-chat-export.pdf';
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

  const handleNewConversation = () => {
    setCurrentConversationId(null);
    setMessages([]);
  };

  const handleVoiceTranscript = async (text: string, isUser: boolean) => {
    if (isUser) {
      // User spoke
      const userMessage: Message = { role: 'user', content: text };
      setMessages(prev => [...prev, userMessage]);

      // Create or get conversation ID
      let convId = currentConversationId;
      if (!convId) {
        convId = await createNewConversation(text);
        if (convId) setCurrentConversationId(convId);
      }

      if (convId) {
        await saveMessage(convId, userMessage);
      }
    } else {
      // AI responded
      const aiMessage: Message = { role: 'assistant', content: text };
      setMessages(prev => [...prev, aiMessage]);

      if (currentConversationId) {
        await saveMessage(currentConversationId, aiMessage);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark flex">
      {sidebarOpen && (
        <ConversationSidebar
          currentConversationId={currentConversationId}
          onSelectConversation={loadConversation}
          onNewConversation={handleNewConversation}
        />
      )}

      <div className="flex-1 flex flex-col">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-bold bg-gradient-cyber bg-clip-text text-transparent">
                Gromo GPT
              </h1>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={handleExportPDF} disabled={messages.length === 0}>
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        <div className="border-b border-border bg-card/50 backdrop-blur-sm p-4">
          <div className="container mx-auto max-w-4xl flex justify-center">
            <VoiceInterface onTranscript={handleVoiceTranscript} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="container mx-auto max-w-4xl space-y-6">
            {messages.length === 0 && (
              <div className="text-center py-20 animate-fade-in">
                <h2 className="text-3xl font-bold mb-4 bg-gradient-cyber bg-clip-text text-transparent">
                  Welcome to Gromo GPT
                </h2>
                <p className="text-muted-foreground">Start a conversation or generate an image</p>
              </div>
            )}
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
                  {message.fileUrl && (
                    <a 
                      href={message.fileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      📎 {message.fileName}
                    </a>
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
              <FileUpload onFileUploaded={handleFileUploaded} />
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
                className="bg-input border-border resize-none focus:ring-2 focus:ring-primary"
                rows={3}
              />
              <div className="flex flex-col gap-2">
                <Button onClick={handleSend} disabled={isLoading} size="icon" className="bg-gradient-cyber hover:shadow-glow-cyan">
                  <Send className="h-4 w-4" />
                </Button>
                <Button onClick={handleGenerateImage} disabled={isLoading} size="icon" variant="secondary" className="hover:shadow-glow-purple">
                  <ImageIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
