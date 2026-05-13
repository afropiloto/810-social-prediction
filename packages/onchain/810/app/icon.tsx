import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 512, height: 512 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#DFFF00', borderRadius: '20%' }}>
        <span style={{ fontSize: 320, fontWeight: 'bold', color: '#000000', fontFamily: 'sans-serif' }}>8</span>
      </div>
    ),
    { ...size }
  )
}
