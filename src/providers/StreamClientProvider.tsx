'use client';

import { ReactNode, useEffect, useState } from 'react';
import { StreamVideoClient, StreamVideo } from '@stream-io/video-react-sdk';
import { StreamChat } from 'stream-chat';
import { Chat } from 'stream-chat-react';
import 'stream-chat-react/dist/css/index.css';
import { useUser } from '@clerk/nextjs';

import { tokenProvider } from '@/actions/stream.actions';
import Loader from '@/components/Loader';

const API_KEY = process.env.NEXT_PUBLIC_STREAM_API_KEY;

const StreamClientProvider = ({ children }: { children: ReactNode }) => {
  const [videoClient, setVideoClient] = useState<StreamVideoClient>();
  const [chatClient, setChatClient] = useState<StreamChat>();
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (!isLoaded || !user) return;
    if (!API_KEY) throw new Error('Stream API key is missing');

    const setupClients = async () => {
      // 1. Initialize Stream Video Client
      const vClient = new StreamVideoClient({
        apiKey: API_KEY,
        user: {
          id: user?.id,
          name: user?.username || user?.firstName || user?.id,
          image: user?.imageUrl,
        },
        tokenProvider,
      });
      setVideoClient(vClient);

      // 2. Initialize Stream Chat Client (The Bee-Client)
      const cClient = StreamChat.getInstance(API_KEY);
      
      // Fetch the user token dynamically using the existing tokenProvider
      const token = await tokenProvider();
      
      // Connect user to Chat Client with their Clerk Profile
      await cClient.connectUser(
        {
          id: user?.id,
          name: user?.username || user?.firstName || user?.id,
          image: user?.imageUrl,
        },
        token
      );
      
      setChatClient(cClient);
    };

    setupClients();

    return () => {
      // Optional: Cleanup logic to disconnect chat client on unmount
      if (chatClient) {
        chatClient.disconnectUser();
      }
    };
  }, [user, isLoaded]); // intentionally left out chatClient from dependency array

  // Validation: Show success message when both clients are ready
  useEffect(() => {
    if (videoClient && chatClient) {
      console.log('🐝 Bee-Client Initialized: Both Stream Video and Chat are ready!');
    }
  }, [videoClient, chatClient]);


  // Wait until both clients are fully loaded
  if (!videoClient || !chatClient) return <Loader />;

  return (
    <StreamVideo client={videoClient}>
      <Chat client={chatClient}>
        {children}
      </Chat>
    </StreamVideo>
  );
};

export default StreamClientProvider;
