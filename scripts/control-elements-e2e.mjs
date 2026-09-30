import { chromium } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
const base = process.env.SMOKE_BASE_URL ?? 'http://127.0.0.1:5173'
const out = process.env.CONTROL_AUDIT_OUT ?? 'docs/controls-2026-09-30/screenshots'
await mkdir(out, { recursive: true })
const check = (ok, message) => { if (!ok) throw new Error(message) }
const browser = await chromium.launch()
const reports = []
try {
  for (const [width, height] of (process.env.CONTROL_VIEWPORTS?JSON.parse(process.env.CONTROL_VIEWPORTS):[[320,568],[390,844],[768,1024],[844,390],[1024,768],[1025,560],[1200,560],[1440,900],[1920,1080]])) {
    const mobile = width <= 1024
    const page = await browser.newPage({viewport:{width,height},isMobile:mobile,hasTouch:mobile})
    const errors=[];page.on('pageerror',e=>errors.push(e.message))
    const visible=locator=>locator.filter({visible:true})
    const shot=async(name)=>{await page.waitForTimeout(250);if(process.env.CONTROL_SCREENSHOTS !== '0')await page.screenshot({path:`${out}/${width}-${name}.png`})}
    const handles=async()=>{
      const labels=await visible(page.locator('.mobile-range-thumb-label')).evaluateAll(es=>es.map(e=>{
        const style=getComputedStyle(e),r=e.getBoundingClientRect(),range=document.createRange();range.selectNodeContents(e);const t=range.getBoundingClientRect()
        return {white:style.backgroundColor==='rgb(255, 255, 255)',radius:style.borderRadius,fit:t.left>=r.left+2&&t.right<=r.right-2}
      }))
      check(labels.length>0&&labels.every(l=>l.white&&l.radius==='8px'&&l.fit),`${width}: mismatched/overflowing slider handles ${JSON.stringify(labels)}`)
    }
    await page.goto(base,{waitUntil:'networkidle'})
    await page.getByRole('button',{name:/LOAD DEMO/i}).click()
    await page.locator('.viewer canvas').first().waitFor()
    await page.waitForTimeout(500)
    await page.getByRole('slider',{name:mobile?'Strength':'Effect strength',exact:true}).fill(mobile?'52':'52')
    await handles()
    if(mobile)check(JSON.stringify(await page.locator('.mobile-sliders-row .mobile-slider-label').allTextContents())===JSON.stringify(['BRUSH','SIZE']), 'Incorrect brush labels')
    await shot('brush')
    const effects=()=>visible(page.getByRole('button',{name:/^Effect(s)?:/i}))
    await effects().click()
    const grid=visible(page.locator('.ts-effect-grid')).first()
    await grid.waitFor()
    const gridMetrics=await grid.evaluate(e=>{
      const columns=getComputedStyle(e).gridTemplateColumns.split(' ').length
      const tiles=[...e.querySelectorAll('.ts-effect-tile')].map(t=>{
        const label=t.querySelector('.ts-effect-tile-label'),b=t.getBoundingClientRect(),range=document.createRange();range.selectNodeContents(label);const r=range.getBoundingClientRect()
        return {name:label.textContent,height:b.height,fit:r.left>=b.left&&r.right<=b.right,icon:!!t.querySelector('.ts-effect-tile-icon .material-symbols-outlined')}
      })
      return{columns,tiles}
    })
    check(gridMetrics.columns===3&&gridMetrics.tiles.every(t=>t.height>=63.9&&t.fit&&t.icon),`${width}: effect grid lacks spacing/icons or clips text ${JSON.stringify(gridMetrics)}`)
    check(await grid.evaluate(e=>getComputedStyle(e.querySelector('.ts-effect-tile')).justifyContent)==='center','Effect icon and text are not centered')
    await shot('effects')
    await grid.locator('.ts-effect-tile').filter({has:page.locator('.ts-effect-tile-label',{hasText:/^Prism$/i})}).click()
    await page.waitForTimeout(400)
    check(await effects().getAttribute('aria-label')?.then(s=>/prism/i.test(s)), 'Prism selection did not reach toolbar')
    check(await effects().locator('.material-symbols-outlined').innerText()==='diamond','Toolbar does not show the chosen effect icon')
    await handles();await shot('prism')
    await effects().click()
    await visible(page.locator('.ts-effect-tile')).filter({has:page.locator('.ts-effect-tile-label',{hasText:/^Emoji$/i})}).click()
    await visible(page.locator('.mobile-emoji-grid')).waitFor()
    check(await visible(page.locator('.mobile-emoji-grid .emoji-glyph')).count()===25,'Unfiltered or missing emoji pool')
    check(await visible(page.locator('.emoji-glyph')).first().evaluate(e=>getComputedStyle(e).fontSize)==='24px','Emoji picker glyphs too small')
    await shot('emoji')
    await page.keyboard.press('Escape');await page.waitForTimeout(250)
    if(mobile)await page.getByRole('button',{name:/^ADJUST/}).click()
    else await page.getByRole('button',{name:'Color adjustments',exact:true}).click()
    await visible(page.getByRole('slider',{name:'Brightness',exact:true})).fill('50')
    const actionStyle=async(locator)=>locator.evaluate(e=>{const s=getComputedStyle(e);return{font:s.fontSize,height:e.getBoundingClientRect().height,radius:s.borderRadius,padding:s.padding,lineHeight:s.lineHeight}})
    const adjustAction=mobile?await actionStyle(visible(page.locator('.tool-panel-actions .btn')).first()):null
    await handles();await shot('adjust')
    await page.keyboard.press('Escape');await page.waitForTimeout(250)
    if(mobile)await page.getByRole('button',{name:/^DISTORT/}).click()
    else await page.getByRole('button',{name:'Transform effects',exact:true}).click()
    if(mobile){
      const distortAction=await actionStyle(visible(page.locator('.mobile-distort-reset-btn')).first())
      check(JSON.stringify(adjustAction)===JSON.stringify(distortAction),`Adjust/Distort actions differ: ${JSON.stringify({adjustAction,distortAction})}`)
    }
    await page.getByRole('button',{name:/Color Shift settings/i}).click()
    await visible(page.getByRole('slider',{name:'Hue',exact:true})).fill('60')
    await handles();await shot('distort')
    await page.keyboard.press('Escape');await page.waitForTimeout(250)
    await visible(page.locator('.ts-btn-autodetect')).click()
    await visible(page.getByRole('slider',{name:/Sensitivity/})).fill('100')
    const detection=await visible(page.locator(mobile?'.mobile-face-check-text > span':'.detect-boxes-primary-copy > span:last-child')).evaluate(e=>getComputedStyle(e).fontSize)
    const layerType=await visible(page.locator('.target-toggle-label')).first().evaluate(e=>getComputedStyle(e).fontSize)
    check(parseFloat(detection)>=parseFloat(layerType),'Detection boxes label smaller than layer selection')
    const classPadding=await visible(page.locator(mobile?'.mobile-face-more-classes':'.detect-class-toggle')).evaluate(e=>parseFloat(getComputedStyle(e).paddingRight))
    check(classPadding>=16,'All classes icon too close to edge')
    await handles();await shot('detection')
    await page.keyboard.press('Escape');await page.waitForTimeout(250)
    if(mobile){
      await page.getByRole('button',{name:'Open library',exact:true}).click()
      await page.getByRole('button',{name:'SELECT',exact:true}).click()
    }else await page.locator('.sidebar-batch-btn').click()
    const marks=visible(page.locator(mobile?'.mobile-gallery-check .selection-mark':'.batch-checkbox .selection-mark'))
    await marks.first().waitFor()
    const markStyle=await marks.first().evaluate(e=>{const s=getComputedStyle(e),r=e.getBoundingClientRect();return{width:r.width,height:r.height,radius:s.borderRadius}})
    check(markStyle.width===20&&markStyle.height===20&&markStyle.radius==='5px','Selection styles differ')
    const first=mobile?page.locator('.mobile-gallery-item').first():page.locator('.batch-checkbox').first()
    const before=await first.getAttribute('aria-pressed');await first.click()
    check(await first.getAttribute('aria-pressed')!==before,'Selection indicator does not follow selection')
    if(!mobile){await first.focus();await page.keyboard.press('Space');check(await first.getAttribute('aria-pressed')===before,'Keyboard batch selection broken')}
    await shot('selection-grid')
    await page.getByRole('button',{name:mobile?'List view':'List',exact:true}).click()
    await marks.first().waitFor();await shot('selection-list')
    check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Page overflows')
    check(errors.length===0,errors.join('\n'))
    reports.push({width,height,gridMetrics,markStyle})
    console.log(`${width}×${height}: white handles, 3-column effect menu, Prism, emoji, selection grid/list and keyboard passed`)
    await page.close()
  }
}finally{await browser.close();await writeFile(`${out}/checks.json`,JSON.stringify(reports,null,2))}
