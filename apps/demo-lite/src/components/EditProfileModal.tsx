import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload } from 'lucide-react';
import { User } from '../types';

interface EditProfileModalProps {
  user: User;
  onClose: () => void;
  onSave: (updatedUser: Partial<User>) => void;
}

export function EditProfileModal({ user, onClose, onSave }: EditProfileModalProps) {
  const [username, setUsername] = useState(user.username);
  const [avatar, setAvatar] = useState(user.avatar);
  const [bio, setBio] = useState(user.bio || '');
  const [twitter, setTwitter] = useState(user.socials?.twitter || '');
  const [tiktok, setTiktok] = useState(user.socials?.tiktok || '');

  const handleSave = () => {
    onSave({ 
      username, 
      avatar, 
      bio, 
      socials: { twitter, tiktok } 
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 backdrop-blur-md p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 400, mass: 0.8 }}
          className="w-full max-w-sm relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl bg-zinc-900/90 backdrop-blur-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative z-10 p-5">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-black text-white">Edit Profile</h3>
              <button onClick={onClose} className="p-1.5 bg-white/5 rounded-full hover:bg-white/10 text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Avatar URL</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={avatar} 
                    onChange={(e) => setAvatar(e.target.value)}
                    className="flex-1 bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-neon/50"
                  />
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10">
                    <img src={avatar} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Username</label>
                <input 
                  type="text" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-neon/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-neon/50 h-20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Twitter (@)</label>
                  <input 
                    type="text" 
                    value={twitter} 
                    onChange={(e) => setTwitter(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-neon/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">TikTok (@)</label>
                  <input 
                    type="text" 
                    value={tiktok} 
                    onChange={(e) => setTiktok(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-neon/50"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleSave}
              className="w-full py-3 mt-6 rounded-xl font-black text-base bg-neon hover:bg-[#b3e600] text-black transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(204,255,0,0.3)]"
            >
              Save Profile
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
