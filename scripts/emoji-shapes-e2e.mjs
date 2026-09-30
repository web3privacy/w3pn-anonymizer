import { chromium } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
const out = 'docs/emoji-ui-2026-09-30'
await mkdir(out, { recursive: true })
const browser = await chromium.launch()
try {
  const page = await browser.newPage()
  await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle' })
  const result = await page.evaluate(async () => {
    const { applyEffectRect, applyEffectBrush, EMOJI_POOL, pickEmojiFromSeed, previewEffectBrush } = await import('/src/lib/effects.ts')
    const { drawVideoZones } = await import('/src/lib/video.ts')
    const check = (ok, message) => { if (!ok) throw new Error(message) }
    const make = () => { const c=document.createElement('canvas');c.width=120;c.height=120;return c }
    const rows=[]
    const sheet=document.createElement('canvas');sheet.width=600;sheet.height=Math.ceil(EMOJI_POOL.length/5)*140
    const sc=sheet.getContext('2d');sc.fillStyle='#303735';sc.fillRect(0,0,sheet.width,sheet.height)
    for (const [i,emoji] of EMOJI_POOL.entries()) {
      const c=make(),ctx=c.getContext('2d')
      applyEffectRect(ctx,'emoji',20,20,80,80,.48,emoji)
      const data=ctx.getImageData(0,0,120,120).data
      const alpha=(x,y)=>data[(y*120+x)*4+3]
      check([[20,20],[99,20],[20,99],[99,99]].some(([x,y])=>alpha(x,y)===0),`${emoji}: an opaque backing remains`)
      check(alpha(60,60)===255,`${emoji}: center of face is exposed`)
      let opaque=0,total=0
      for(let y=30;y<90;y++)for(let x=30;x<90;x++)if(((x-60)/24)**2+((y-60)/27)**2<1){total++;if(alpha(x,y)===255)opaque++}
      check(opaque/total>.98,`${emoji}: compact face core has gaps (${opaque/total})`)
      sc.drawImage(c,(i%5)*120,Math.floor(i/5)*140)
      sc.font='12px sans-serif';sc.fillStyle='white';sc.textAlign='center';sc.fillText(emoji,(i%5)*120+60,Math.floor(i/5)*140+132)
      for (const mode of ['brush','video-rectangle','video-circle']) {
        ctx.clearRect(0,0,120,120)
        if(mode==='brush')applyEffectBrush(ctx,'emoji',60,60,40,.48,emoji)
        else drawVideoZones(ctx,[{id:'same-face',x:1/6,y:1/6,width:2/3,height:2/3,effect:'emoji',emoji,maskShape:mode==='video-circle'?'circle':'rectangle'}],120,120,.48)
        check(ctx.getImageData(60,60,1,1).data[3]===255,`${emoji}: ${mode} center exposed`)
        check([[21,21],[98,21],[21,98],[98,98]].some(([x,y])=>ctx.getImageData(x,y,1,1).data[3]===0),`${emoji}: ${mode} backing remains`)
      }
      rows.push({emoji,coreCoverage:opaque/total})
    }
    const removed=['🫥','🛰️','🐈‍⬛','👽','🦊','🙈','🥸','🤠','🐶','🐺','🐮','🦁']
    check(removed.every(e=>!EMOJI_POOL.includes(e)),'Unsuitable shapes remain in picker')
    check(pickEmojiFromSeed('face-123')===pickEmojiFromSeed('face-123'),'Random face emoji changes between renders')
    // Preview uses the same centering and silhouette as the brush stamp.
    const src=make(),preview=make()
    previewEffectBrush(preview.getContext('2d'),src,'emoji',60,60,40,.48,'🙂',{drawX:0,drawY:0,drawWidth:120,drawHeight:120,scale:1})
    check(preview.getContext('2d').getImageData(60,60,1,1).data[3]>=180,'Brush preview glyph is missing')
    check(preview.getContext('2d').getImageData(21,21,1,1).data[3]===0,'Brush preview retains an opaque backing')
    return {rows, removed, sheet:sheet.toDataURL('image/png')}
  })
  await writeFile(`${out}/emoji-contact-sheet.png`,Buffer.from(result.sheet.split(',')[1],'base64'))
  delete result.sheet
  await writeFile(`${out}/emoji-checks.json`,JSON.stringify(result,null,2))
  console.log(JSON.stringify(result))
} finally { await browser.close() }
