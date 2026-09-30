import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import '../../src/index.css'
import '../../src/App.css'
import { VideoAnalysisPanel } from '../../src/components/VideoAnalysisPanel'
import { DEFAULT_VIDEO_ANALYSIS, type VideoAnalysisResult } from '../../src/lib/video-analysis'
const result: VideoAnalysisResult = { source: new Blob(), signature: 'fixture', duration: 45, fps: 30, passes: 1, samples: Array.from({length: 360}, (_, i) => ({ timeSec: i / 8, zones: [] })), timeline: [], fullFrameCoverage: false,
  review: [{ id: '1', startSec: 2, endSec: 4, reasons: ['Low detection confidence'] }, { id: '2', startSec: 12, endSec: 18, reasons: ['Movement or lost tracking'] }] }
export function Check() {
  const [settings, setSettings] = useState(DEFAULT_VIDEO_ANALYSIS)
  const [action, setAction] = useState('Ready')
  return <main style={{maxWidth:960,margin:'30px auto',padding:12}}>
    <h2>Video analysis component check</h2>
    <div style={{background:'#252925',height:'25vh',display:'grid',placeItems:'center'}}>Video preview placeholder</div>
    <VideoAnalysisPanel settings={settings} onSettings={setSettings} result={result} disabled={false}
      onAdditionalPass={()=>setAction('Additional pass requested')} onSeek={(time)=>setAction(`Seek ${time}s`)} onDrawRange={(range)=>setAction(`Mask ${range.startSec}–${range.endSec}s`)} />
    <p role="status">{action}</p>
  </main>
}
createRoot(document.getElementById('root')!).render(<Check />)
