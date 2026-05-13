import { Market, User, Position } from '../types';
import { addDays } from 'date-fns';

export const currentUser: User = {
  id: 'u1',
  username: 'trader_joe',
  avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400&q=80',
  balance: 1500.50,
  bio: 'Prediction market degenerate. Betting on the future, one trade at a time.',
  socials: {
    twitter: 'trader_joe',
    tiktok: 'trader_joe_official',
  },
  stats: {
    winRate: 68,
    totalProfit: 4250.00,
    marketsCreated: 12,
    trades: 145,
  },
  badges: ['Early Adopter', 'Whale', 'Pro Trader'],
};

const avatars = [
  '1534528741775-53994a69daeb', '1506794778202-cad84cf45f1d', '1531746020798-e6953c6e8e04', '1570295999919-56ceb5ecca61', '1560250097-0b93528c311a',
  '1519085360753-af0119f7cbe7', '1522075469751-3a6694fb2f61', '1500648767791-00dcc994a43e', '1507003211169-0a1dd7228f2d', '1544005313-94ddf0286df2'
];

const backgrounds = [
  '1540039155732-68473678c4b5', '1470229722913-7c090b332f7f', '1515886657613-9f3515b0c78f', '1522337360788-8b13dee7a37e', '1518605368461-1ee123dc3c52',
  '1504450758481-7338eba7524a', '1579952363873-27f3bade9f55', '1598550874175-4d0ef436c909', '1589903308904-1010c2294adc', '1611162617474-5b21e879e113'
];

const rawData = [
  // Influencers (Kim K first with video)
  { u: 'kimkardashian', q: 'Will Kim\'s next TikTok break 50M views in 12 hours?', m: 'Views', v: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', c: 'Lifestyle' },
  { u: 'kyliejenner', q: 'Will Kylie Cosmetics sell out the entire new line in 60 minutes?', m: 'Sales', v: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', c: 'Lifestyle' },
  { u: 'charlidamelio', q: 'Will Charli\'s next dance video hit 100M views in 24h?', m: 'Views', v: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', c: 'Lifestyle' },
  
  // Musicians
  { u: 'taylorswift', q: 'Will the Eras Tour movie trailer hit 100M views in 12h?', m: 'Views', v: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', c: 'Music' },
  { u: 'drake', q: 'Will Drake\'s surprise drop get 50M streams by midnight?', m: 'Streams', v: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4', c: 'Music' },
  { u: 'theweeknd', q: 'Will The Weeknd\'s new single stay at #1 for 10 consecutive weeks?', m: 'Chart Position', v: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4', c: 'Music' },
  { u: 'billieeilish', q: 'Will Billie\'s next album announcement get 20M likes in 24h?', m: 'Likes', v: 'https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', c: 'Music' },
  { u: 'badbunny', q: 'Will Bad Bunny\'s next tour sell out globally in under 10 minutes?', m: 'Sales', v: 'https://storage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4', c: 'Music' },
  { u: 'postmalone', q: 'Will Post Malone\'s country album break the all-time 24h streaming record?', m: 'Streams', v: 'https://storage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4', c: 'Music' },
  { u: 'dualipaofficial', q: 'Will Dua Lipa\'s next TikTok dance challenge hit 5B views this week?', m: 'Views', v: 'https://storage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4', c: 'Music' },
  { u: 'oliviarodrigo', q: 'Will Olivia\'s next music video hit 50M views in 12h?', m: 'Views', v: 'https://storage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4', c: 'Music' },
  { u: 'travisscott', q: 'Will Travis Scott\'s next merch drop sell out in 60 seconds?', m: 'Sales', c: 'Music' },
  { u: 'icespice', q: 'Will Ice Spice\'s next single debut at #1 on the Billboard Hot 100?', m: 'Chart Position', c: 'Music' },

  // Rest of Influencers
  { u: 'addisonrae', q: 'Will Addison\'s next single break the Spotify 24h streaming record?', m: 'Streams', c: 'Lifestyle' },
  { u: 'khabylame', q: 'Will Khaby\'s next reaction video hit 20M likes in 12h?', m: 'Likes', c: 'Lifestyle' },
  { u: 'bellapoarch', q: 'Will Bella\'s next TikTok hit 50M likes in 48h?', m: 'Likes', c: 'Lifestyle' },
  { u: 'alixearle', q: 'Will Alix\'s next GRWM TikTok hit 50M views in 24h?', m: 'Views', c: 'Lifestyle' },
  { u: 'emmachamberlain', q: 'Will Emma\'s next YouTube vlog hit 20M views in 12h?', m: 'Views', c: 'Lifestyle' },
  { u: 'loganpaul', q: 'Will Logan Paul\'s next Crypto project hit a $1B market cap in 1 week?', m: 'Price', c: 'Lifestyle' },
  { u: 'jakepaul', q: 'Will Jake\'s next fight announcement get 500M impressions in 24h?', m: 'Impressions', c: 'Lifestyle' },

  // Creators (OnlyFans/Models)
  { u: 'amouranth', q: 'Will Amouranth\'s next Twitch stream peak at 50k viewers?', m: 'Viewers', c: 'Gaming' },
  { u: 'corinnakopf', q: 'Will Corinna\'s next Instagram post hit 2M likes?', m: 'Likes', c: 'Lifestyle' },
  { u: 'tanamongeau', q: 'Will Tana\'s next podcast episode hit 1M views on YouTube?', m: 'Views', c: 'Lifestyle' },
  { u: 'sommerray', q: 'Will Sommer\'s next workout reel hit 10M views?', m: 'Views', c: 'Lifestyle' },
  { u: 'demirose', q: 'Will Demi\'s next photoshoot post get 1M likes?', m: 'Likes', c: 'Lifestyle' },
  { u: 'thenewclassic', q: 'Will Iggy\'s next single hit 5M streams in week 1?', m: 'Streams', c: 'Music' },
  { u: 'blacchyna', q: 'Will Blac Chyna\'s next interview clip hit 5M views?', m: 'Views', c: 'Lifestyle' },
  { u: 'bhadbhabie', q: 'Will Bhad Bhabie\'s next TikTok hit 10M views?', m: 'Views', c: 'Lifestyle' },
  { u: 'lottiemoss', q: 'Will Lottie\'s next Instagram reel hit 1M views?', m: 'Views', c: 'Lifestyle' },
  { u: 'carmenelectra', q: 'Will Carmen\'s next throwback post get 500k likes?', m: 'Likes', c: 'Lifestyle' },

  // Footballers
  { u: 'cristiano', q: 'Will Cristiano\'s next Instagram reel hit 50M views?', m: 'Views', c: 'Sports' },
  { u: 'leomessi', q: 'Will Messi\'s next match highlight hit 20M views?', m: 'Views', c: 'Sports' },
  { u: 'kmbappe', q: 'Will Mbappe\'s next goal clip hit 10M views on TikTok?', m: 'Views', c: 'Sports' },
  { u: 'erlinghaaland', q: 'Will Haaland\'s next post-match interview hit 5M views?', m: 'Views', c: 'Sports' },
  { u: 'neymarjr', q: 'Will Neymar\'s next skill compilation hit 15M views?', m: 'Views', c: 'Sports' },
  { u: 'judebellingham', q: 'Will Jude\'s next celebration post get 5M likes?', m: 'Likes', c: 'Sports' },
  { u: 'vinijr', q: 'Will Vini\'s next match highlight hit 10M views?', m: 'Views', c: 'Sports' },
  { u: 'kevindebruyne', q: 'Will KDB\'s next assist clip hit 5M views?', m: 'Views', c: 'Sports' },
  { u: 'mosalah', q: 'Will Salah\'s next goal clip hit 8M views?', m: 'Views', c: 'Sports' },
  { u: 'iamzlatanibrahimovic', q: 'Will Zlatan\'s next quote tweet hit 100k retweets?', m: 'Retweets', c: 'Sports' },

  // YouTubers
  { u: 'mrbeast', q: 'Will MrBeast\'s next video hit 100M views in 24h?', m: 'Views', c: 'Entertainment' },
  { u: 'pewdiepie', q: 'Will PewDiePie\'s next vlog hit 5M views in 48h?', m: 'Views', c: 'Gaming' },
  { u: 'mkbhd', q: 'Will MKBHD\'s iPhone 16 review hit 5M views in a week?', m: 'Views', c: 'Entertainment' },
  { u: 'ishowspeed', q: 'Will Speed\'s next stream peak at 200k concurrent viewers?', m: 'Viewers', c: 'Gaming' },
  { u: 'kai_cenat', q: 'Will Kai\'s subathon stream break 350k concurrent viewers?', m: 'Viewers', c: 'Gaming' },
  { u: 'xqc', q: 'Will xQc average 60k viewers during his next 24h stream?', m: 'Viewers', c: 'Gaming' },
  { u: 'markiplier', q: 'Will Markiplier\'s next horror game video hit 3M views?', m: 'Views', c: 'Gaming' },
  { u: 'jacksepticeye', q: 'Will Jack\'s next video hit 2M views in 24h?', m: 'Views', c: 'Gaming' },
  { u: 'sidemen', q: 'Will the next Sidemen Sunday video hit 10M views in 24h?', m: 'Views', c: 'Entertainment' },
  { u: 'dudeperfect', q: 'Will Dude Perfect\'s next trick shot video hit 15M views?', m: 'Views', c: 'Sports' },

  // Netflix Shows/Movies
  { u: 'strangerthings', q: 'Will the Season 5 trailer hit 50M views in 24h?', m: 'Views', c: 'Entertainment' },
  { u: 'squidgame', q: 'Will Season 2 trailer hit 100M views in 48h?', m: 'Views', c: 'Entertainment' },
  { u: 'wednesdaynetflix', q: 'Will Wednesday Season 2 teaser get 10M likes?', m: 'Likes', c: 'Entertainment' },
  { u: 'witchernetflix', q: 'Will the next Witcher trailer hit 20M views?', m: 'Views', c: 'Entertainment' },
  { u: 'bridgerton', q: 'Will the next Bridgerton teaser hit 15M views?', m: 'Views', c: 'Entertainment' },
  { u: 'moneyheist', q: 'Will the spin-off trailer hit 10M views?', m: 'Views', c: 'Entertainment' },
  { u: 'blackmirror', q: 'Will the next Black Mirror episode teaser hit 5M views?', m: 'Views', c: 'Entertainment' },
  { u: 'cobrakaiseries', q: 'Will the final season trailer hit 15M views?', m: 'Views', c: 'Entertainment' },
  { u: 'obx', q: 'Will the next Outer Banks trailer hit 20M views?', m: 'Views', c: 'Entertainment' },
  { u: 'thecrownnetflix', q: 'Will the next The Crown teaser hit 5M views?', m: 'Views', c: 'Entertainment' },

  // Games/Gaming
  { u: 'rockstargames', q: 'Will the next GTA VI trailer hit 100M views in 24h?', m: 'Views', c: 'Gaming' },
  { u: 'fortnite', q: 'Will the next Fortnite season trailer hit 20M views?', m: 'Views', c: 'Gaming' },
  { u: 'minecraft', q: 'Will the next Minecraft update video hit 10M views?', m: 'Views', c: 'Gaming' },
  { u: 'roblox', q: 'Will the next Roblox event trailer hit 5M views?', m: 'Views', c: 'Gaming' },
  { u: 'playvalorant', q: 'Will the next Valorant agent trailer hit 10M views?', m: 'Views', c: 'Gaming' },
  { u: 'leagueoflegends', q: 'Will the next LoL cinematic hit 30M views?', m: 'Views', c: 'Gaming' },
  { u: 'callofduty', q: 'Will the next CoD trailer hit 25M views?', m: 'Views', c: 'Gaming' },
  { u: 'playapex', q: 'Will the next Apex Legends trailer hit 5M views?', m: 'Views', c: 'Gaming' },
  { u: 'cyberpunkgame', q: 'Will the next Cyberpunk update video hit 3M views?', m: 'Views', c: 'Gaming' },
  { u: 'eldenring', q: 'Will the next Elden Ring DLC trailer hit 15M views?', m: 'Views', c: 'Gaming' },
  { u: 'playstation', q: 'Will the PS5 Pro reveal trailer hit 20M views in 48h?', m: 'Views', c: 'Gaming' },
  { u: 'nintendo', q: 'Will the Nintendo Switch 2 announcement tweet get 1M retweets?', m: 'Retweets', c: 'Gaming' },
  { u: 'xbox', q: 'Will the next Halo trailer hit 10M views?', m: 'Views', c: 'Gaming' },

  // F1 & Motorsports
  { u: 'f1', q: 'Will the Monaco GP highlights hit 5M views in 24h?', m: 'Views', c: 'Sports' },
  { u: 'lewishamilton', q: 'Will Lewis Hamilton win a race with Ferrari in 2025?', m: 'Wins', c: 'Sports' },
  { u: 'maxverstappen1', q: 'Will Max Verstappen\'s next onboard clip hit 2M views?', m: 'Views', c: 'Sports' },
  { u: 'charles_leclerc', q: 'Will Charles Leclerc\'s next pole lap video hit 3M views?', m: 'Views', c: 'Sports' },
  { u: 'landonorris', q: 'Will Lando Norris\'s next Twitch stream peak at 50k viewers?', m: 'Viewers', c: 'Sports' },
  { u: 'mercedesamgf1', q: 'Will the Mercedes W16 car reveal hit 2M concurrent viewers?', m: 'Viewers', c: 'Sports' },

  // Luxury Brands
  { u: 'rolex', q: 'Will the new Rolex Daytona reveal video hit 5M views?', m: 'Views', c: 'Lifestyle' },
  { u: 'louisvuitton', q: 'Will the next LV Men\'s show hit 10M views on YouTube?', m: 'Views', c: 'Lifestyle' },
  { u: 'gucci', q: 'Will the next Gucci campaign post get 1M likes?', m: 'Likes', c: 'Lifestyle' },
  { u: 'porsche', q: 'Will the Porsche 911 hybrid reveal get 2M likes on Instagram?', m: 'Likes', c: 'Lifestyle' },
  { u: 'ferrari', q: 'Will the new Ferrari SUV trailer hit 10M views?', m: 'Views', c: 'Lifestyle' },
  { u: 'audemarspiguet', q: 'Will the next Royal Oak drop sell out in under 1 hour?', m: 'Sales', c: 'Lifestyle' },
  { u: 'patekphilippe', q: 'Will the Nautilus discontinuation tweet get 50k reposts?', m: 'Reposts', c: 'Lifestyle' },
  { u: 'balenciaga', q: 'Will the next Balenciaga runway video hit 5M views?', m: 'Views', c: 'Lifestyle' },

  // Other Sports
  { u: 'kingjames', q: 'Will LeBron\'s next podcast episode get 5M views this week?', m: 'Views', c: 'Sports' },
  { u: 'stephencurry30', q: 'Will Steph\'s next highlight reel hit 10M views?', m: 'Views', c: 'Sports' },
  { u: 'thenotoriousmma', q: 'Will Conor\'s next fight announcement hit 50M impressions?', m: 'Impressions', c: 'Sports' },
  { u: 'jonnybones', q: 'Will Jon Jones\' next training video hit 5M views?', m: 'Views', c: 'Sports' },
  { u: 'patrickmahomes', q: 'Will Mahomes\' next highlight clip hit 10M views?', m: 'Views', c: 'Sports' },
  { u: 'killatrav', q: 'Will Travis Kelce\'s next podcast clip hit 15M views?', m: 'Views', c: 'Sports' },
  { u: 'maxverstappen1', q: 'Will Max\'s next race win post get 3M likes?', m: 'Likes', c: 'Sports' },
  { u: 'lewishamilton', q: 'Will Lewis\' next fashion post get 2M likes?', m: 'Likes', c: 'Sports' },
  { u: 'tigerwoods', q: 'Will Tiger\'s next swing video hit 10M views?', m: 'Views', c: 'Sports' },
  { u: 'simonebiles', q: 'Will Simone\'s next routine video hit 20M views?', m: 'Views', c: 'Sports' },
];

export const mockMarkets: Market[] = rawData.map((data, i) => {
  const avatarUrl = `https://unavatar.io/tiktok/${data.u}?fallback=https://picsum.photos/seed/${data.u}/400/400`;

  const creator: User = {
    id: `c${i + 1}`,
    username: data.u,
    avatar: avatarUrl,
    balance: 0
  };

  const marketCreator: User = {
    id: `mc${i + 1}`,
    username: `user_${Math.floor(Math.random() * 10000)}`,
    avatar: `https://picsum.photos/seed/mc${i}/150/150`,
    balance: Math.floor(Math.random() * 10000)
  };

  const yesPrice = 0.2 + (Math.random() * 0.6);
  const noPrice = 1 - yesPrice;

  const imgUrl = avatarUrl; // Main social image is also the main image for the market page

  return {
    id: `m${i + 1}`,
    creator: creator,
    marketCreator: marketCreator,
    contentUrl: data.v || imgUrl,
    imageUrl: imgUrl,
    contentType: data.v ? 'video' : 'image',
    question: data.q,
    metricLabel: data.m,
    targetValue: Math.floor(Math.random() * 10000000) + 100000,
    currentValue: Math.floor(Math.random() * 5000000),
    endTime: addDays(new Date(), Math.random() * 7).toISOString(),
    yesPrice,
    noPrice,
    volume: Math.floor(Math.random() * 5000000) + 10000,
    liquidity: Math.floor(Math.random() * 500000) + 10000,
    category: data.c || 'Lifestyle',
    whales: [],
  };
});

export const mockPositions: Position[] = [];
