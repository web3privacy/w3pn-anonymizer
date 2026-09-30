# Audit a úpravy UI/UX — 29. 9. 2026

Současný styl má dobrou základní identitu: černé plochy, zelené akcenty,
technický wordmark a rychlý přístup k nástrojům kolem média. Největší prostor ke
zlepšení je v čitelnosti a hierarchii ovládání. Tuto opravu jsem proto zaměřil
na detaily, nikoli na změnu rozestavění editoru.

## Záloha

Před úpravami vznikla místní záloha celého projektu a samostatná záloha
nasazeného webu s konfigurací na VPS. Obě jsou ověřené a původní vydání zůstává
zachované. Podrobnosti: [záloha a návrat](../../backups/20260929T203320Z/README.md).

## Průchod aplikací

V adresáři `before` je 68 snímků původní podoby a měření rozložení.
Rozšířený průchod v `after` obsahuje 112 snímků a zachycuje domovskou obrazovku, všechny části O nás,
fotografii, exportní nastavení, detekci, efekty, kreslicí nástroje, ořez,
úpravy barev, distort efekty, knihovnu, dávkový panel, video, audio,
textové dokumenty, PDF, feedback a kameru s nastavením.

Základní vizuální matice: 320×740, 390×844, 768×1024, 1024×768, 1440×900 a
1920×1080. Interakční testy navíc kontrolují krátký telefon 320×568,
telefon na šířku 844×390 a nízké desktopové obrazovky 1025×560 a 1200×560.
[Interaktivní srovnání před/po](index.html) umožňuje přepínat rozlišení a konkrétní pohled.

Kamera při testech používá umělý vstup. Emulace prohlížeče nenahrazuje kontrolu
na skutečném telefonu, v Safari nebo v nativních Android/iOS aplikacích.

## Nálezy a provedené opravy

| Oblast | Původní problém | Úprava |
| --- | --- | --- |
| Color Shift | GPU dělilo již normalizované barvy znovu 255; obraz téměř zčernal. GPU navíc používalo jiný model úpravy barev než CPU. | Opravený rozsah barev a stejná HSL úprava jako v CPU. |
| Typografie | Popisky 7–9 px, nejednotné velikosti polí, výrazné numerické vstupy a nestejné úrovně důležitosti. | Společná stupnice 10/11/12/13/16 px, jednotná pole, čitelnější popisky a klidnější doplňkové informace. Velká typografie je vyhrazena vysvětlující stránce. |
| Panely nad médiem | Průhledné pozadí rušilo čitelnost nastavení a jeho ovládání. | Neprůhledné plochy, společné okraje, mezery a stíny. |
| Desktopové flyouty | Ukotvení neřešilo nízké obrazovky ani růst panelu; chybělo jednotné zavírání klávesnicí. | Sdílený flyout hlídá okraje obrazovky, posouvá dlouhý obsah a vrací fokus po Escape. |
| Mobilní navigace | Některé názvy nástrojů se zkracovaly; malé prvky kombinovaly roztažené písmo a velké mezery. | Čitelnější rozměry a běžná šířka písma pro kompaktní popisky. |
| Zoom a hlášky | Ukazatel zoomu zasahoval do tlačítka; hlášky na mobilu překrývaly značku a navigaci. | Opravené umístění zoomu a oddělená poloha hlášek; při otevřeném O nás/feedbacku jsou hlášky skryté. |
| Video na úzkém telefonu | Nápis Anonymize přetékal směrem k sousednímu tlačítku. | Velikost písma, mezery a padding respektují skutečný dostupný prostor. |
| Telefon na šířku | Levá lišta zasahovala do tlačítka knihovny; pravidla pro horní panel odkazovala na staré třídy. | Horní ovládání a reset respektují šířku boční lišty; posuvníky mají dostatek prostoru. |
| Knihovna | Smíšená média byla označena jako počet fotografií. | Smíšená knihovna používá označení files a nepočítá pomocné editované snímky videa. |
| Feedback | Na mobilu chyběl přímý přístup; textové tlačítko zabíralo místo v horní liště. | Společná ikona vedle Live Mode s nápovědou, existující formulář, Escape a návrat fokusu. |
| O nás | Rozsáhlý seznam funkcí bez jasného příběhu a bez názorného vysvětlení. | Nová hierarchie: účel, interaktivní ilustrace tří kroků, nástroje podle média, místní zpracování a odkazy na komunitu. |

## Design systém

`src/ui-system.css` je společným základem pro ovládání. Obsahuje stupnici
písma, mezery 4/8/12/16/24 px, výšky ovládání 32 px a dotykových prvků 44 px,
plochy panelů, kontrast doplňkového textu, fokus a krátké přechody. Výjimkou jsou
kompaktní prvky ve stísněném mobilním rozložení. Značka a hlavní rozestavění
editoru zůstávají zachované.

Stránka O nás má samostatný styl `src/about-page.css`: nadpisy 28–46 px podle
šířky, běžný text 13–15 px a řádky přibližně 45–75 znaků. Ilustrace nepoužívá
nový model, obrázkovou knihovnu ani vzdálenou službu. Kroky se přepínají ručně;
jemná animace se vypíná podle nastavení omezeného pohybu.

Veřejná aplikace zůstává v tmavém režimu. Světlé plochy panelů byly kontrolovány
pro zachování připravených stylů; tato oprava nezapíná nový přepínač tématu.

## Co bych dělal dál

1. **Konsolidace starých stylů.** Postupně převést zbylé režimy a staré přepisy
   na stejné tokeny a odstranit nepoužívané varianty. Dělat to po jedné části
   s porovnáním snímků, aby se nerozbily hotové interakce.
   Další konkrétní kandidáti jsou drobný monospace text v mobilním dokumentu
   a zkrácené názvy audio presetů; zde je vhodnější posuvný seznam nebo stručné
   názvy s dostupnou plnou nápovědou než další zmenšování písma.
2. **Kontrola na skutečných zařízeních.** Safari/iPhone, Android a GrapheneOS;
   větší systémové písmo, virtuální klávesnice, otočení během práce a bezpečné
   oblasti displeje. Nynější testy ověřují rozložení v Chromium.
3. **Vizuální regresní kontrola.** Pravidelně porovnávat stejná média a stavy;
   zastavit vydání při přetékání, ztraceném fokusu nebo prázdném náhledu.
4. **Postupné odkrývání pokročilých možností.** Udržet hlavní operace na očích
   a vysvětlovat složitější parametry krátkou nápovědou. Další přeskládání
   ovládání bych dělal podle skutečných problémů při použití.
5. **Pomoc při první práci.** Volitelný krátký průchod nad načteným demem, který
   ukáže efekt, velikost masky, ruční zásah a export. Nové O nás už poskytuje
   základní vysvětlení bez zásahu do editoru.

## Ověření

- Lint, TypeScript a produkční sestavení prošly.
- 252 unit testů v 36 souborech prošlo.
- Standardní release smoke: 69 kontrol bez selhání.
- Color Shift: 12 kombinací hue/saturace porovnáno mezi skutečným GPU a CPU
  výstupem. Před opravou průměrná barva cca 0,3–0,5/255, po opravě cca
  118–137/255; největší rozdíl mezi GPU/CPU je 1/255.
- Interakční UI test kontroluje devět rozložení, O nás, omezený pohyb,
  neuseknuté názvy, neprůhledné panely, Color Shift, feedback a klávesnici.
- Rozšířené měření snímků kontroluje vodorovné přetékání, polohy panelů,
  velikosti písma a chyby prohlížeče; výsledky jsou v `after/metrics.json`.
- Editor E2E: vykreslení, ruční maska, anonymizace, undo a SVG náhled prošly.
- Změny síly efektů na demu se 460 detekcemi: přibližně 21–27 ms v místním
  testu; rychlé změny se ustálily na poslední hodnotě u všech testovaných efektů.

Vizuální průchod je kontrola konkrétních scénářů, ne důkaz absence všech chyb.
Automatická detekce ani stylistické efekty nejsou zárukou anonymity.

## Nasazení

Změny jsou na https://anonymizer.promptstudio3000.com/ ve vydání
`20260929T210434Z`, hlavní soubor `index-B85PthKT.js`. Archiv byl před
aktivací ověřen SHA-256; webový server zůstal aktivní. Předchozí vydání
`20260929T202754Z` a jeho samostatná záloha zůstávají zachované. Starší soubory
s hashem jsou dostupné i v novém vydání, aby otevřeným stránkám neselhalo pozdější
načtení modulu.

Interakční test přímo proti veřejnému nasazení prošel ve všech devíti
rozloženích včetně telefonu na šířku, Color Shift, feedbacku a návratu
klávesnicového fokusu. Finálních 112 snímků nevykázalo vodorovné přetékání,
panely mimo obrazovku ani runtime chyby v zachycených scénářích.
