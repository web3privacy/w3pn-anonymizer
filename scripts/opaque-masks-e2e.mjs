import { chromium } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
const out = 'docs/prism-source-2026-09-30'
await mkdir(out, { recursive: true })
const browser = await chromium.launch()
try {
  const page = await browser.newPage()
  await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle' })
  const result = await page.evaluate(async () => {
    const { applyEffectRect, applyEffectBrush, previewEffectBrush } = await import('/src/lib/effects.ts')
    const { drawVideoZones } = await import('/src/lib/video.ts')
    const check = (ok, message) => { if (!ok) throw new Error(message) }
    const canvas = () => { const c=document.createElement('canvas');c.width=120;c.height=100;return c }
    const a=canvas(),b=canvas(),ctxA=a.getContext('2d'),ctxB=b.getContext('2d')
    const fill=(ctx,color)=>{ctx.fillStyle=color;ctx.fillRect(0,0,120,100)}
    const data=ctx=>ctx.getImageData(0,0,120,100).data
    const pattern=ctx=>{
      const d=ctx.createImageData(120,100)
      for(let y=0;y<100;y++)for(let x=0;x<120;x++){const p=(y*120+x)*4;d.data[p]=(x*17+y*13)%256;d.data[p+1]=(x*5+y*19)%256;d.data[p+2]=(x*11+y*7)%256;d.data[p+3]=255}
      ctx.putImageData(d,0,0)
    }
    let checks=0
    const variations=[]
    for(const strength of [0,.01,.4,1,NaN]){
      // Output must follow the source palette instead of using generated colors.
      fill(ctxA,'#ed1769');fill(ctxB,'#23d7e8')
      for(const ctx of [ctxA,ctxB])applyEffectRect(ctx,'prism',20,15,70,65,strength,'🙂',{zoneId:'fixed'})
      const da=data(ctxA),db=data(ctxB)
      for(let y=15;y<80;y++)for(let x=20;x<90;x++){
        const p=(y*120+x)*4
        check(da[p+3]===255&&db[p+3]===255,'Prism leaves transparent seams')
        check(Math.abs(da[p]-237)<=1&&Math.abs(da[p+1]-23)<=1&&Math.abs(da[p+2]-105)<=1,'Prism lost warm source palette')
        check(Math.abs(db[p]-35)<=1&&Math.abs(db[p+1]-215)<=1&&Math.abs(db[p+2]-232)<=1,'Cached source leaks into a different photo/frame')
      }
      pattern(ctxA);const original=data(ctxA).slice()
      applyEffectRect(ctxA,'prism',20,15,70,65,strength,'🙂',{zoneId:'fixed'})
      const changed=data(ctxA);let same=0,total=0
      for(let y=0;y<100;y++)for(let x=0;x<120;x++){
        const p=(y*120+x)*4,eq=[0,1,2].every(i=>changed[p+i]===original[p+i])
        if(x>=20&&x<90&&y>=15&&y<80){total++;if(eq)same++}else check(eq,'Prism changes pixels outside selection')
      }
      check(same/total<.01,'Prism retains unprocessed fine detail')
      variations.push({strength:Number.isFinite(strength)?strength:'NaN',unchangedFraction:same/total})
      checks+=3
    }
    for(const strength of [0,.4,1])for(const mode of ['brush','rectangle','circle']){
      pattern(ctxA);const original=data(ctxA).slice()
      if(mode==='brush')applyEffectBrush(ctxA,'prism',60,50,30,strength,'🙂',{seed:'fixed'})
      else drawVideoZones(ctxA,[{id:'track-id',x:.25,y:.2,width:.5,height:.6,effect:'prism',emoji:'🙂',maskShape:mode}],120,100,strength)
      const rendered=data(ctxA);let changed=0
      for(let y=0;y<100;y++)for(let x=0;x<120;x++){
        const p=(y*120+x)*4,r2=(x+.5-60)**2+(y+.5-50)**2
        const eq=[0,1,2,3].every(i=>rendered[p+i]===original[p+i])
        const outside=mode==='rectangle'?(x<30||x>=90||y<20||y>=80):r2>31.5**2
        if(outside)check(eq,`${mode} paints outside footprint`)
        if(r2<27**2){check(rendered[p+3]===255,`${mode} has nonopaque core`);if(!eq)changed++}
      }
      check(changed>2000,`${mode} effect missing`);checks++
    }
    pattern(ctxA);applyEffectRect(ctxA,'prism',20,15,70,65,.4,'🙂',{zoneId:'repeat'});const first=data(ctxA).slice()
    pattern(ctxA);applyEffectRect(ctxA,'prism',20,15,70,65,.4,'🙂',{zoneId:'repeat'})
    check(first.every((v,i)=>v===data(ctxA)[i]),'Prism flickers for an identical source/track')
    pattern(ctxA);applyEffectRect(ctxA,'prism',20,15,70,65,1,'🙂',{zoneId:'repeat'})
    check(first.some((v,i)=>v!==data(ctxA)[i]),'Strength does not change refraction')
    ctxA.clearRect(0,0,120,100);applyEffectRect(ctxA,'prism',-10,-5,30,25,1,'🙂')
    check([...ctxA.getImageData(0,0,20,20).data].filter((_,i)=>i%4===3).every(v=>v===255),'Clipped/transparent source leaves holes')
    // Same actual image and settings yield the same brush preview and stamp.
    pattern(ctxA);const source=canvas();source.getContext('2d').drawImage(a,0,0)
    const preview=canvas();previewEffectBrush(preview.getContext('2d'),source,'prism',60,50,30,.4,'🙂',{drawX:0,drawY:0,drawWidth:120,drawHeight:100,scale:1},{seed:'fixed'})
    applyEffectBrush(ctxA,'prism',60,50,30,.4,'🙂',{seed:'fixed'})
    const stamp=ctxA.getImageData(60,50,1,1).data,pre=preview.getContext('2d').getImageData(60,50,1,1).data
    check([0,1,2].every(i=>Math.abs(stamp[i]-pre[i])<3),'Prism brush preview differs from applied stamp')
    checks+=4
    // Render visual comparison from an actual bundled photo.
    const image=await new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=reject;i.src='/demo/demo-5.png'})
    const sheet=document.createElement('canvas');sheet.width=1000;sheet.height=650
    const sc=sheet.getContext('2d');sc.fillStyle='#101010';sc.fillRect(0,0,1000,650)
    for(let i=0;i<4;i++){
      const tile=document.createElement('canvas');tile.width=tile.height=480;const tc=tile.getContext('2d')
      tc.drawImage(image,image.width*.05,image.height*.50,image.width*.65,image.height*.50,0,0,480,480)
      if(i)applyEffectRect(tc,'prism',0,0,480,480,[0,.1,.4,1][i],'🙂',{zoneId:'visual'})
      sc.drawImage(tile,(i%2)*500,Math.floor(i/2)*325,480,285)
      sc.fillStyle='#fff';sc.font='14px sans-serif';sc.fillText(['Original','Prism 10%','Prism 40%','Prism 100%'][i],(i%2)*500+8,Math.floor(i/2)*325+309)
    }
    const crowd=document.createElement('canvas');crowd.width=1000;crowd.height=800;const cc=crowd.getContext('2d',{willReadFrequently:true})
    const times=[]
    for(let pass=0;pass<12;pass++){
      cc.drawImage(image,0,0,1000,800);const started=performance.now()
      for(let i=0;i<100;i++)applyEffectRect(cc,'prism',(i%10)*100,Math.floor(i/10)*80,80,70,.4,'🙂',{zoneId:`face-${i}`})
      if(pass>=2)times.push(performance.now()-started)
    }
    return {checks,variations,msPer100Faces:times.reduce((a,b)=>a+b,0)/times.length,sheet:sheet.toDataURL('image/png')}
  })
  await writeFile(`${out}/prism-comparison.png`,Buffer.from(result.sheet.split(',')[1],'base64'));delete result.sheet
  await writeFile(`${out}/prism-checks.json`,JSON.stringify(result,null,2));console.log(result)
} finally { await browser.close() }
