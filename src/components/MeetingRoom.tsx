'use client';
import { useState, useEffect } from 'react';
import {
  CallControls,
  CallParticipantsList,
  CallStatsButton,
  CallingState,
  PaginatedGridLayout,
  SpeakerLayout,
  useCallStateHooks,
  useCall
} from '@stream-io/video-react-sdk';
import { useRouter, useSearchParams } from 'next/navigation';
import { Users, LayoutList, MessageSquare, BellRing, X, StickyNote, Activity } from 'lucide-react';
import { Channel, MessageList, MessageComposer, Window, useChatContext } from 'stream-chat-react';
import type { Channel as StreamChannel } from 'stream-chat';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import Loader from './Loader';
import EndCallButton from './EndCallButton';
import { cn } from '@/lib/utils';
import { useToast } from './ui/use-toast';
import { CustomMessage } from './CustomMessage';

type CallLayoutType = 'grid' | 'speaker-left' | 'speaker-right';

const MeetingRoom = () => {
  const searchParams = useSearchParams();
  const isPersonalRoom = !!searchParams.get('personal');
  const router = useRouter();
  const [layout, setLayout] = useState<CallLayoutType>('speaker-left');
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  
  const { useCallCallingState, useLocalParticipant } = useCallStateHooks();
  const callingState = useCallCallingState();
  const localParticipant = useLocalParticipant();
  const call = useCall();
  const { toast } = useToast();
  
  // Stream Chat integration hooks
  const { client: chatClient } = useChatContext();
  const [channel, setChannel] = useState<StreamChannel>();
  const [buzzedUsers, setBuzzedUsers] = useState<string[]>([]);
  const [hasUnread, setHasUnread] = useState(false);

  // Shared Notes State
  const [notes, setNotes] = useState('');
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  // Setup Common Chat Channel specifically for this Meeting ID
  useEffect(() => {
    if (chatClient && call?.id) {
      const channelId = call.id;
      const newChannel = chatClient.channel('messaging', channelId, {
        name: `Meeting ${channelId}`,
      });
      newChannel.watch().then(() => setChannel(newChannel));
    }
  }, [chatClient, call?.id]);

  // Unread Badge Logic
  useEffect(() => {
    if (!channel) return;
    const handleNewMessage = (e: any) => {
      if (e.message?.user?.id !== localParticipant?.userId) {
        if (!showChat) {
          setHasUnread(true);
        }
      }
    };
    channel.on('message.new', handleNewMessage);
    return () => {
      channel.off('message.new', handleNewMessage);
    };
  }, [channel, showChat, localParticipant]);

  useEffect(() => {
    if (showChat) setHasUnread(false);
  }, [showChat]);

  // Listen for Custom Events and Call Updates (for Shared Notes)
  useEffect(() => {
    if (!call) return;
    
    // Initialize notes if already exist
    setNotes(call.state.custom?.notes || '');
    
    const unsubscribeCustom = call.on('custom', (event) => {
      if (event.type === 'buzz') {
        const userId = event.user?.id || 'Someone';
        toast({ title: `🐝 ${userId} Buzzed!` });
        
        setBuzzedUsers((prev) => [...prev, userId]);
        setTimeout(() => {
          setBuzzedUsers((prev) => prev.filter((id) => id !== userId));
        }, 3000); // Amber glow pulse lasts for 3 seconds
      }
    });

    const unsubscribeUpdate = call.on('call.updated', (event) => {
      if (event.call?.custom?.notes !== undefined) {
        setNotes(event.call.custom.notes);
      }
    });

    return () => {
      unsubscribeCustom();
      unsubscribeUpdate();
    };
  }, [call, toast]);

  const handleBuzz = () => {
    if (call && localParticipant) {
      call.sendCustomEvent({ type: 'buzz' });
      toast({ title: 'You buzzed! 🐝' });
    }
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNotes(val);
    
    if (typingTimeout) clearTimeout(typingTimeout);
    
    const timeout = setTimeout(() => {
      if (call) {
        call.update({ custom: { ...call.state.custom, notes: val } });
      }
    }, 1000); // sync every 1s of typing pause
    setTypingTimeout(timeout);
  };

  if (callingState !== CallingState.JOINED) return <Loader />;

  const CallLayout = () => {
    switch (layout) {
      case 'grid':
        return <PaginatedGridLayout />;
      case 'speaker-right':
        return <SpeakerLayout participantsBarPosition="left" />;
      default:
        return <SpeakerLayout participantsBarPosition="right" />;
    }
  };

  // Stability Logic: Extract networkQuality or connectionQuality
  const networkQuality = (call as any)?.state?.networkQuality || localParticipant?.connectionQuality || 'Unknown';

  return (
    <section className="relative h-screen w-full overflow-hidden pt-4 text-white bg-dark-1">
      {/* Global CSS for the Buzz Pulse Effect & Chat Theme Overrides */}
      {buzzedUsers.length > 0 && (
        <style>{`
          .str-video__participant-view { transition: all 0.3s ease; }
          .str-video__participant-details { box-shadow: 0 0 20px rgba(255,191,0,0.8) !important; border: 2px solid #FFBF00 !important; border-radius: 12px; }
        `}</style>
      )}

      {/* Connection Health Indicator */}
      <div className="absolute top-4 left-4 z-50 glass px-4 py-2 rounded-full flex items-center gap-2">
        <Activity size={18} className={cn("text-green-500", {
          'text-yellow-500': networkQuality === 'Poor' || networkQuality === 'Fair',
          'text-red-500': networkQuality === 'Bad'
        })} />
        <span className="text-sm font-medium">Health: {networkQuality}</span>
      </div>

      <div className="relative flex size-full items-center justify-center pb-24">
        <div className="flex size-full max-w-[1000px] items-center">
          <CallLayout />
        </div>
        
        {/* Right Side Toggleable Panels */}
        <div className="flex h-[calc(100vh-120px)] ml-2 gap-4 mr-4">
          <div className={cn('hidden h-full rounded-2xl glass', { 'show-block': showParticipants })}>
            <CallParticipantsList onClose={() => setShowParticipants(false)} />
          </div>

          {/* Common Chat Panel */}
          {showChat && channel && (
            <div className="w-[320px] h-full flex flex-col rounded-2xl overflow-hidden glass-panel str-chat__theme-dark">
              <Channel channel={channel}>
                <Window>
                  <div className="p-4 bg-dark-2/50 backdrop-blur-xl text-primary font-bold text-lg border-b border-white/10 flex justify-between items-center">
                    <span>Bee-Chat</span>
                    <button onClick={() => setShowChat(false)} className="text-white hover:text-primary transition-colors">
                      <X size={20} />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto bg-transparent custom-chat-list">
                    <MessageList Message={CustomMessage} />
                  </div>
                  <div className="bg-dark-2/80 backdrop-blur-xl border-t border-white/10 p-2">
                    <MessageComposer />
                  </div>
                </Window>
              </Channel>
            </div>
          )}

          {/* Honey-Notes Panel */}
          {showNotes && (
            <div className="w-[320px] h-full flex flex-col rounded-2xl overflow-hidden glass-panel">
              <div className="p-4 bg-dark-2/50 backdrop-blur-xl text-primary font-bold text-lg border-b border-white/10 flex justify-between items-center">
                <span>Honey-Notes 🍯</span>
                <button onClick={() => setShowNotes(false)} className="text-white hover:text-primary transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 p-4 bg-dark-1/50">
                <textarea
                  className="w-full h-full bg-transparent text-white placeholder-white/50 focus:outline-none resize-none"
                  placeholder="Type shared meeting notes here... (syncs automatically)"
                  value={notes}
                  onChange={handleNotesChange}
                />
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Floating Glass Control Bar */}
      <div className="fixed bottom-0 left-0 flex w-full items-center justify-center gap-5 glass-panel py-4 rounded-t-3xl z-50 border-t border-white/20">
        <CallControls onLeave={() => router.push(`/`)} />

        <button onClick={handleBuzz} className="cursor-pointer rounded-2xl bg-primary px-4 py-2 hover:bg-primary/80 transition-all hover:shadow-[0_0_15px_rgba(255,191,0,0.6)] hover:-translate-y-1">
          <BellRing size={24} className="text-dark-1" />
        </button>

        <DropdownMenu>
          <div className="flex items-center">
            <DropdownMenuTrigger className="cursor-pointer rounded-2xl bg-white/10 px-4 py-2 hover:bg-white/20 transition-all">
              <LayoutList size={24} className="text-white" />
            </DropdownMenuTrigger>
          </div>
          <DropdownMenuContent className="border-white/10 bg-dark-1/90 backdrop-blur-md text-white">
            {['Grid', 'Speaker-Left', 'Speaker-Right'].map((item, index) => (
              <div key={index}>
                <DropdownMenuItem className="hover:bg-primary/20 hover:text-primary cursor-pointer" onClick={() => setLayout(item.toLowerCase() as CallLayoutType)}>
                  {item}
                </DropdownMenuItem>
                <DropdownMenuSeparator className="border-white/10" />
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <CallStatsButton />
        
        <button onClick={() => setShowParticipants((prev) => !prev)}>
          <div className="cursor-pointer rounded-2xl bg-white/10 px-4 py-2 hover:bg-white/20 transition-all">
            <Users size={24} className="text-white" />
          </div>
        </button>
        
        <button onClick={() => setShowChat((prev) => !prev)} className="relative">
          <div className="cursor-pointer rounded-2xl bg-white/10 px-4 py-2 hover:bg-white/20 transition-all hover:text-primary">
            <MessageSquare size={24} className="text-white" />
          </div>
          {hasUnread && (
            <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>
          )}
        </button>

        <button onClick={() => setShowNotes((prev) => !prev)}>
          <div className="cursor-pointer rounded-2xl bg-white/10 px-4 py-2 hover:bg-white/20 transition-all hover:text-primary">
            <StickyNote size={24} className="text-white" />
          </div>
        </button>

        {!isPersonalRoom && <EndCallButton />}
      </div>
    </section>
  );
};

export default MeetingRoom;
