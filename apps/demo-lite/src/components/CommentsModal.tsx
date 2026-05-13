import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Heart, MessageCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface Comment {
  id: string;
  user: {
    name: string;
    username: string;
    avatar: string;
  };
  text: string;
  likes: number;
  timestamp: Date;
  isLiked?: boolean;
}

interface CommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  marketId: string;
}

// Mock temporary comments
const MOCK_COMMENTS: Comment[] = [
  {
    id: '1',
    user: {
      name: 'Crypto King',
      username: 'cryptoking',
      avatar: 'https://api.dicebear.com/7.x/avatars/svg?seed=cryptoking'
    },
    text: 'This market is going to the moon! 🚀',
    likes: 24,
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    isLiked: true
  },
  {
    id: '2',
    user: {
      name: 'Alpha Seeker',
      username: 'alphaseeker',
      avatar: 'https://api.dicebear.com/7.x/avatars/svg?seed=alphaseeker'
    },
    text: 'Liquidity looks a bit thin right now, waiting for a better entry.',
    likes: 12,
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: '3',
    user: {
      name: 'Just Hodl',
      username: 'justhodl',
      avatar: 'https://api.dicebear.com/7.x/avatars/svg?seed=justhodl'
    },
    text: 'What was the source on this? Need to verify before throwing size at it.',
    likes: 5,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
  }
];

export function CommentsModal({ isOpen, onClose, marketId }: CommentsModalProps) {
  const [comments, setComments] = useState<Comment[]>(MOCK_COMMENTS);
  const [newComment, setNewComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Math.random().toString(),
      user: {
        name: 'You',
        username: 'currentUser',
        avatar: 'https://api.dicebear.com/7.x/avatars/svg?seed=You' // Mock current user
      },
      text: newComment,
      likes: 0,
      timestamp: new Date(),
    };

    setComments([comment, ...comments]);
    setNewComment('');
  };

  const handleLike = (commentId: string) => {
    setComments(comments.map(c => {
      if (c.id === commentId) {
        const isLiked = !c.isLiked;
        return {
          ...c,
          isLiked,
          likes: c.likes + (isLiked ? 1 : -1)
        };
      }
      return c;
    }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[60] bg-black/60 backdrop-blur-sm"
            onClick={(e) => { e.stopPropagation(); onClose(); }}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute bottom-0 left-0 right-0 z-[70] h-[70vh] bg-zinc-900 rounded-t-3xl border-t border-white/10 flex flex-col pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-2 text-white font-bold">
                <MessageCircle className="w-5 h-5" />
                <span>Comments ({comments.length})</span>
              </div>
              <button 
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Comment List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <img 
                    src={comment.user.avatar} 
                    alt={comment.user.username} 
                    className="w-8 h-8 rounded-full bg-zinc-800"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white/80 font-bold text-sm">{comment.user.name}</span>
                      <span className="text-white/40 text-xs">@{comment.user.username}</span>
                      <span className="text-white/40 text-xs">· {formatDistanceToNow(comment.timestamp)} ago</span>
                    </div>
                    <p className="text-white text-sm mb-2 leading-relaxed">
                      {comment.text}
                    </p>
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => handleLike(comment.id)}
                        className="flex items-center gap-1.5 group"
                      >
                        <Heart className={cn(
                          "w-4 h-4 transition-colors",
                          comment.isLiked ? "fill-rose-500 text-rose-500" : "text-white/40 group-hover:text-rose-500"
                        )} />
                        <span className={cn(
                          "text-xs transition-colors",
                          comment.isLiked ? "text-rose-500" : "text-white/40 group-hover:text-rose-500"
                        )}>{comment.likes}</span>
                      </button>
                      <button className="text-white/40 hover:text-white text-xs transition-colors">
                        Reply
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/10 bg-zinc-900 pb-safe">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input 
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 bg-zinc-800 text-white placeholder:text-white/40 rounded-full px-4 py-3 outline-none focus:ring-2 focus:ring-neon/50 text-sm"
                />
                <button 
                  type="submit"
                  disabled={!newComment.trim()}
                  className="w-11 h-11 rounded-full bg-neon flex items-center justify-center text-black disabled:opacity-50 transition-opacity"
                >
                  <Send className="w-5 h-5 ml-1" />
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
