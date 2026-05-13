import { GoogleGenAI } from '@google/genai';

async function run() {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    console.log('Fetching image...');
    const imgRes = await fetch('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80');
    const arrayBuffer = await imgRes.arrayBuffer();
    const base64EncodeString = Buffer.from(arrayBuffer).toString('base64');

    console.log('Generating video...');
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-lite-generate-preview',
      prompt: 'A cinematic, engaging social media hype video of this person talking directly to the camera, dynamic lighting, neon accents, highly realistic',
      image: {
        imageBytes: base64EncodeString,
        mimeType: 'image/jpeg',
      },
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '9:16'
      }
    });

    console.log('Polling...');
    let attempts = 0;
    while (!operation.done && attempts < 30) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({operation: operation});
      console.log(`Still polling... attempt ${attempts}`);
      attempts++;
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    console.log('Video URI:', downloadLink);
  } catch (e) {
    console.error('Error:', e);
  }
}

run();
