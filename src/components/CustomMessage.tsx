import React from 'react';
import { useMessageContext, Avatar, MessageReactions } from 'stream-chat-react';
import { cn } from '@/lib/utils';

export const CustomMessage = () => {
  const { message, isMyMessage } = useMessageContext();

  const formattedTime = new Date(message.created_at || Date.now()).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={cn("flex flex-col gap-1 mb-6 w-full px-2", isMyMessage() ? "items-end" : "items-start")}>
      <div className={cn("flex items-end gap-2 w-full", isMyMessage() ? "flex-row-reverse" : "flex-row")}>
        
        {/* Avatar */}
        <div className="shrink-0 mb-1">
          <Avatar image={message.user?.image} name={message.user?.name} size="sm" className="rounded-full ring-1 ring-white/20" />
        </div>

        {/* Message Content */}
        <div className={cn(
          "max-w-[75%] flex flex-col gap-1",
          isMyMessage() ? "items-end" : "items-start"
        )}>
          
          {/* Metadata (Name & Timestamp) */}
          <div className={cn("flex items-center gap-2 text-[10px]", isMyMessage() ? "flex-row-reverse" : "flex-row")}>
            <span className="font-semibold text-white/80">{message.user?.name || message.user?.id}</span>
            <span className="text-white/40">{formattedTime}</span>
          </div>

          {/* Bubble */}
          <div className={cn(
            "px-4 py-2 rounded-2xl relative group",
            isMyMessage() 
              ? "bg-[#38BDF8] text-black rounded-br-sm shadow-glow-soft"
              : "glass-panel text-white rounded-bl-sm"
          )}>
            <p className="text-sm break-words leading-relaxed font-medium">{message.text}</p>
            
            {/* Reactions rendering (using Stream Chat default) */}
            <div className={cn("absolute -bottom-4 z-10", isMyMessage() ? "left-0" : "right-0")}>
               <MessageReactions />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
