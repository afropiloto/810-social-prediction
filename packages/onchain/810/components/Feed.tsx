'use client';

import { useState } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, TrendingUp, TrendingDown, Check, Play } from 'lucide-react';
import TradeModal from './TradeModal';

const FEED_ITEMS = [
  {
    id: "1",
    creator: "@growth_guru",
    isVerified: true,
    title: "Viral Prediction #142",
    question: "Will @tech_tuber reach 10M subs by Friday night?",
    description: "Current growth: +15k/hour. Trending on Twitter and TikTok right now. Milestone imminent.",
    videoUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCWn_F6V2tqcZokaLrQ54YJMRuanTzHrXTesViG2RBgF5WNHJvLALgA4uyeu0DfycjVR1qgjsGq-FwJfilQzXiOSGBxeYlUXMhUAr-fQ3NtKwGN_a8IQ5aGnRYZQ_qAFxW2BVpR8J3L7sxfLXi8rS2rMPGlwAMetRODSmpByN9SISFpabQq5Od84W5RbxXUcMYKfRnoM3k9E7DNgm6g3k0kSkf-x6Gol-BrRncudTNQH3ZezmeHW8QYUd-K-ebTzJpzLz1-seAWrB-X",
    avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDMHeeWCjdk-QrgrAXZ0U0sQiU_6ivf3heO07A3jNGNKlsnTwbB2MXtODChZPkf7cX18-RyPGJQjQulko73PUXQUrDYQGwFVMt4EdblbP966Cqa0hVdfptmDn1WcgXnLMicRyprMO86sCKflddNFryYrQQM2aFUSaJh3-YaDkNTcX2onCs8x1j-nHv_omEqIipVsw-HUMWwC7H0lEsHuDis4XnQPjFlShtQczAcl_W5ycHi-QP9hqzhH_ldmbgsgVeBgnx7EImSvxKO",
    likes: "42.8K",
    comments: "1.2K",
    shares: "500",
    bookmarks: "89",
    progress: 33,
  },
  {
    id: "2",
    creator: "@tech_leakz",
    isVerified: false,
    title: "Product Launch Prediction",
    question: "Will Apple drop a foldable phone next month?",
    description: "Supply chain rumors are heating up. Screen manufacturers are ramping up production.",
    videoUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAgPBuWnZ8ZUcq80RGarMYWTnWdnicFosU41tJ2OVbyBGQr-uyT_Aefk6hLWUK8UvTfLa02OyCnnt825Cp1HdMuvzdHMvHo7L_I3wCOVzWXAeZY_g2j6b9yK8HyfErTPzQOLlTf39ZGKdbR1bXxy4lQ855lctP4Gyw3w7B19gT13fZ5wCulAeJ8bix12aXRMZ7_k3OL4BQ0f-ayuj7FylcGvvP2_eJcmqKdfSvl7xgWTfCO8vocbiDwRSNVqTCAyBkQ5Z9_RnzdARbJ",
    avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuC-WTxQzayNqmzJnJHcMuS8cdXrmsFmqhwk-df5Awf7Da3KSXd-sO1EGhJia3t4cggY6Bjo1uHLQJtChefsyJAeo9N0KQwNCLjR7iwgD9ba0rp2Eh4mDg98GZOt6PwDdisD83EKuIf3hkd6v9nCTcUhK592YOTcI0N8btYp8Gbxdugk62w-qztVP0BHCJkyxh-vKFoh16CBfTnzwOzaEjA6NgXqGEgIG5ZMzcoHZpSB3zkrHi_KJ1C8WHwZCLnHpp4WA4BmBukbr1qk",
    likes: "15.2K",
    comments: "492",
    shares: "1.1K",
    bookmarks: "34",
    progress: 66,
  }
];

export default function Feed() {
  const [selectedMarket, setSelectedMarket] = useState<any>(null);

  return (
    <div className="relative h-full w-full snap-y snap-mandatory overflow-y-scroll scrollbar-hide bg-black">
      {FEED_ITEMS.map((item) => (
        <section key={item.id} className="relative h-full w-full snap-start bg-black">
          {/* Background Content */}
          <div 
            className="absolute inset-0 bg-cover bg-center" 
            style={{ backgroundImage: `url("${item.videoUrl}")` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40"></div>
          </div>
          
          {/* Play Button Overlay (for static images acting as videos) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
             <button className="flex shrink-0 items-center justify-center rounded-full h-20 w-20 bg-accent/20 backdrop-blur-md text-white border border-accent/50 group hover:scale-110 transition-transform pointer-events-auto">
                <Play className="h-10 w-10 fill-white text-white ml-1" />
             </button>
          </div>

          {/* Content Overlay */}
          <div className="absolute inset-0 flex flex-col justify-end p-6 pb-24">
            <div className="flex items-end justify-between gap-4">
              
              {/* Left Side: Info & Prediction */}
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="h-12 w-12 rounded-full border-2 border-accent bg-cover bg-center shadow-lg" 
                    style={{ backgroundImage: `url("${item.avatarUrl}")` }}
                  ></div>
                  <div>
                    <div className="flex items-center gap-1">
                      <h3 className="font-bold text-lg text-white drop-shadow-md">{item.creator}</h3>
                      {item.isVerified && (
                        <div className="flex h-4 w-4 items-center justify-center rounded-full bg-accent text-black">
                          <Check className="h-3 w-3" />
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-300 font-medium drop-shadow-md">{item.title}</p>
                  </div>
                  <button className="ml-auto bg-white/20 backdrop-blur-md text-white px-4 py-1.5 rounded-full font-bold text-xs hover:bg-white/30 transition-colors border border-white/10">
                    Follow
                  </button>
                </div>
                
                <div className="bg-black/60 backdrop-blur-md p-5 rounded-xl border border-white/10 shadow-2xl">
                  <p className="text-xl font-bold text-white mb-2 leading-tight">{item.question}</p>
                  <p className="text-gray-300 text-sm line-clamp-2 mb-4">{item.description}</p>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setSelectedMarket(item)}
                      className="flex-1 bg-accent text-black font-black py-3 rounded-lg text-center tracking-widest hover:scale-105 transition-transform active:scale-95 shadow-[0_4px_20px_rgba(223,255,0,0.3)] flex items-center justify-center gap-2"
                    >
                      <TrendingUp className="h-5 w-5" /> YES
                    </button>
                    <button 
                      onClick={() => setSelectedMarket(item)}
                      className="flex-1 bg-transparent border-2 border-accent text-accent font-black py-3 rounded-lg text-center tracking-widest hover:bg-accent/10 transition-colors active:scale-95 flex items-center justify-center gap-2"
                    >
                      <TrendingDown className="h-5 w-5" /> NO
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Side: Social Actions */}
              <div className="flex flex-col items-center gap-6 mb-2">
                <div className="flex flex-col items-center gap-1 group">
                  <div className="bg-black/40 p-3 rounded-full backdrop-blur-md border border-white/10 group-hover:bg-accent/20 transition-colors cursor-pointer">
                    <Heart className="h-7 w-7 text-white" />
                  </div>
                  <span className="text-xs font-bold text-white drop-shadow-md">{item.likes}</span>
                </div>
                <div className="flex flex-col items-center gap-1 group">
                  <div className="bg-black/40 p-3 rounded-full backdrop-blur-md border border-white/10 group-hover:bg-accent/20 transition-colors cursor-pointer">
                    <MessageCircle className="h-7 w-7 text-white" />
                  </div>
                  <span className="text-xs font-bold text-white drop-shadow-md">{item.comments}</span>
                </div>
                <div className="flex flex-col items-center gap-1 group">
                  <div className="bg-black/40 p-3 rounded-full backdrop-blur-md border border-white/10 group-hover:bg-accent/20 transition-colors cursor-pointer">
                    <Bookmark className="h-7 w-7 text-white" />
                  </div>
                  <span className="text-xs font-bold text-white drop-shadow-md">{item.bookmarks}</span>
                </div>
                <div className="flex flex-col items-center gap-1 group">
                  <div className="bg-black/40 p-3 rounded-full backdrop-blur-md border border-white/10 group-hover:bg-accent/20 transition-colors cursor-pointer">
                    <Share2 className="h-7 w-7 text-white" />
                  </div>
                  <span className="text-xs font-bold text-white drop-shadow-md">{item.shares}</span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="absolute bottom-20 left-0 right-0 px-6">
              <div className="h-1 w-full bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-accent" style={{ width: `${item.progress}%` }}></div>
              </div>
            </div>
          </div>
        </section>
      ))}
      <TradeModal market={selectedMarket} isOpen={!!selectedMarket} onClose={() => setSelectedMarket(null)} />
    </div>
  );
}
