import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { RealtimeChat } from '@/utils/RealtimeAudio';
import { Mic, MicOff, Loader2 } from 'lucide-react';

interface VoiceInterfaceProps {
  onTranscript?: (text: string, isUser: boolean) => void;
}

export default function VoiceInterface({ onTranscript }: VoiceInterfaceProps) {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const chatRef = useRef<RealtimeChat | null>(null);
  const [userTranscript, setUserTranscript] = useState('');
  const [aiTranscript, setAiTranscript] = useState('');

  const handleMessage = (event: any) => {
    console.log('Received message:', event.type);
    
    // Handle different event types
    if (event.type === 'response.audio_transcript.delta') {
      setAiTranscript(prev => prev + event.delta);
      setIsSpeaking(true);
    } else if (event.type === 'response.audio_transcript.done') {
      if (aiTranscript && onTranscript) {
        onTranscript(aiTranscript, false);
      }
      setAiTranscript('');
      setIsSpeaking(false);
    } else if (event.type === 'conversation.item.input_audio_transcription.completed') {
      const text = event.transcript;
      if (text && onTranscript) {
        onTranscript(text, true);
      }
      setUserTranscript('');
    } else if (event.type === 'input_audio_buffer.speech_started') {
      console.log('User started speaking');
    } else if (event.type === 'input_audio_buffer.speech_stopped') {
      console.log('User stopped speaking');
    } else if (event.type === 'error') {
      console.error('Realtime API error:', event);
      toast({
        title: "Error",
        description: event.error?.message || 'An error occurred',
        variant: "destructive",
      });
    }
  };

  const startConversation = async () => {
    setIsConnecting(true);
    try {
      // Request microphone permission first
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      chatRef.current = new RealtimeChat(handleMessage);
      await chatRef.current.init();
      setIsConnected(true);
      
      toast({
        title: "Voice Chat Active",
        description: "You can now speak with the AI",
      });
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to start voice chat',
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const endConversation = () => {
    chatRef.current?.disconnect();
    chatRef.current = null;
    setIsConnected(false);
    setIsSpeaking(false);
    setUserTranscript('');
    setAiTranscript('');
    
    toast({
      title: "Voice Chat Ended",
      description: "Conversation disconnected",
    });
  };

  useEffect(() => {
    return () => {
      chatRef.current?.disconnect();
    };
  }, []);

  return (
    <div className="flex items-center gap-3">
      {!isConnected ? (
        <Button 
          onClick={startConversation}
          disabled={isConnecting}
          className="bg-gradient-cyber hover:shadow-glow-cyan"
          size="lg"
        >
          {isConnecting ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Mic className="h-5 w-5 mr-2" />
              Start Voice Chat
            </>
          )}
        </Button>
      ) : (
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            isSpeaking ? 'bg-primary/20 animate-pulse' : 'bg-card'
          } border border-border`}>
            <div className={`w-3 h-3 rounded-full ${
              isSpeaking ? 'bg-primary animate-pulse' : 'bg-green-500'
            }`} />
            <span className="text-sm font-medium">
              {isSpeaking ? 'AI Speaking...' : 'Voice Active'}
            </span>
          </div>
          
          <Button 
            onClick={endConversation}
            variant="outline"
            size="lg"
          >
            <MicOff className="h-5 w-5 mr-2" />
            End Voice Chat
          </Button>
        </div>
      )}
    </div>
  );
}
