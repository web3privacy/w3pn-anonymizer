# První tah štětcem a stavové hlášky — 29. 9. 2026

## Opravené chyby

1. **Opožděný náhled zakryl ruční úpravu.** Komprese JPEG a dekódování obrázku probíhají asynchronně. Po prvním načtení se mohl starý náhled dokončit až po kreslení štětcem. Přestože pracovní plátno obsahovalo tah, zobrazený obrázek znovu ukazoval původní stav. Každý náhled nyní sleduje generaci a identitu fotky. Úprava plátna nebo přepnutí fotky zneplatní rozpracovaný náhled; opožděné výsledky se neuplatní a jejich bitmapy se uvolní. Ruční úprava zneplatní také rozpracované přepočítání zón.
2. **Mobilní štětec vypadal vybraný, ale nebyl aktivní.** První otevření Tools nechávalo blokování kreslení zapnuté; teprve opětovný výběr Brush kreslení povolil. Otevření Tools nyní aktivuje aktuální štětec, obdélník nebo gumu.
3. **Hlášky překrývaly fotku.** Souhrn detekce a ostatní oznámení se nyní zobrazují přímo v horní liště. Na desktopu používají místo úvodního popisku; na mobilu po dobu oznámení používají střední místo s logem. Akce knihovny, feedbacku a Live Mode zůstávají dostupné. Dlouhý text se zkrátí s výpustkou, plný text zůstává dostupný čtečkám a v titulku.
4. **Dvojí oznámení a dlouhé zobrazení.** Odstraněn trvalý štítek „Processed locally“ z fotky; čas lokální detekce je součástí jediné stavové hlášky v liště. Oznámení se automaticky odstraní za 2 sekundy. Detekční/procesní indikátory průběhu mají vlastní životní cyklus a zůstávají dostupné.

## Ověření

- `npm run lint`, `npm run build`: úspěšné.
- 252 testů ve 36 souborech: úspěšné.
- Release smoke: 69 kontrol bez selhání.
- `scripts/brush-startup-e2e.mjs`: každý z 10 efektů v novém kontextu prohlížeče, záměrně zpomalené počáteční dekódování náhledu o 2 sekundy; tah změní fotku, zůstane po dokončení starého náhledu a Undo obnoví původní pixely. Ověřeno s GPU i přes CPU fallback.
- První vstup do mobilních Tools bez opětovného kliknutí na vybraný Brush: telefon 390×844, tablet 768×1024 a telefon naležato 844×390.
- Skutečné automatické oznámení detekce: uvnitř hlavičky a zmizí do 2 sekund na 320×568, 390×844, 844×390, 1025×560 a 1440×900. Snímky v `screenshots/`.
- `scripts/ui-polish-e2e.mjs`: 9 rozměrů, About, panely, fokus, feedback, video a Color Shift.
- `scripts/effect-slider-e2e.mjs`: davové demo, změny síly efektů, rychlé změny směru; bez opakovaného dekódování či vytváření GPU textur, bez chyb prohlížeče.

Kontroly jsou provedené v Chromium. Fyzické mobilní přístroje a Safari nebyly v této opravě ověřeny.

## Zálohy a nasazení

Zdrojové soubory před touto opravou jsou v `backups/20260929-brush-notices/`. Původní kompletní záloha `backups/20260929T203320Z/` zůstává zachovaná.

Nové produkční sestavení: `index-CV9RAyWJ.js`, `index-Bp1VmFWN.css`.
Archiv SHA256: `6ef30d44f3834e14f492b11fdf318b5af2e028600a63600fbe4c0bfd3d6c9bd9`.
Nasazení má vlastní adresář `/opt/ps3000/apps/anonymizer/releases/20260929T213455Z` a zachovává předchozí verzi `20260929T210434Z` pro návrat. Starší soubory modulů se ponechávají také pro již otevřené stránky.

Závěrečná kontrola přímo na `https://anonymizer.promptstudio3000.com/` po nasazení prošla: všech 10 efektů při prvním tahu se zpožděným náhledem a Undo, první aktivace mobilního štětce na 3 rozměrech a skutečná automatická hláška uvnitř hlavičky s odstraněním do 2 sekund na všech 5 rozměrech. Veřejná stránka vrací nové sestavení a Caddy je aktivní. Dočasné instalační archivy byly po nasazení odstraněné; zálohy a předchozí release zůstávají zachované.
