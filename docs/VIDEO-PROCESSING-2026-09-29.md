# Další opravy videa — 29. 9. 2026

Změny jsou v pracovním projektu. Zachovávají stávající editor; nové ovládání je ve sbalitelném panelu **ANALYSIS** pod časovou osou. Nejde o vydání mobilní aplikace ani o potvrzení bezchybnosti všech zařízení.

## Co se změnilo

- **Hustota analýzy:** kontrola každého výstupního snímku, nebo vlastní frekvence 0,25–120 kontrol/s, nejvýše však počet snímků ve výstupu. Výchozí hodnota zůstává 8/s. Hustota detekce nemění plynulost výstupu.
- **Průchody:** 1–8 při zahájení; po dokončení lze přidávat další. Posunuté časové vzorky doplňují dosud nezkontrolované snímky. Již získané nálezy se používají znovu, pokud se nezměnil zdroj ani nastavení detektorů. Kontrola všech výstupních snímků další identické průchody nepotřebuje. Rozpracovaný nebo zrušený export nepřepíše dokončený výsledek v knihovně.
- **Masky mezi snímky:** automatické masky konzervativně pokrývají oblast mezi nálezy. Při ztrátě identity rychle se pohybujícího objektu se pokryje možný přesun v rámci stejné kategorie. To může záměrně zakrýt větší plochu. Uživatelské klíčové snímky ručních masek zachovávají vlastní interpolaci.
- **Kontrolní časová osa:** označuje nízkou důvěru detektoru, objevení/zmizení cíle, pohyb či ztrátu sledování a velké mezery mezi vzorky. Mezery musí být delší než 0,25 s a 1,5 výstupního snímku; nejde o upozornění na každý běžný mezisnímek. Lze procházet úseky, přeskočit na jejich čas, označit je jako zkontrolované nebo přidat masku pro jejich interval. Panel se při kreslení sbalí. Označení „Reviewed“ je pouze poznámka během otevření panelu daného videa, nikoli certifikát anonymizace; po změně videa nebo zpracování se může resetovat.
- **Ruční opravy:** kreslení je dostupné i po zpracování videa. Nové masky a nálezy se uplatní také přes uložené upravené snímky. Změny se zapíší do výsledku při dalším zpracování.
- **Efekty:** kruhové masky nově respektují i efekty používající přímý zápis pixelů. Dříve některé efekty ignorovaly ořez a kreslily do obdélníku. Seřazení časových nastavení efektů se provádí jednou, nikoliv znovu na každém snímku.

## Paměť a dočasné soubory

Pevné limity 160 MiB pro zakódovaný výstup, 96 MiB pro cache snímků, 500 MiB pro vstupní video a desetiminutový limit zpracování byly odstraněny. Nenahradilo je nekontrolované hromadění dat v RAM:

1. Zakódované bloky se zapisují do dočasného souboru v soukromém úložišti aplikace/prohlížeče (OPFS).
2. Zvuk a obraz se ze souboru spojují v časovém pořadí, aby muxer nezadržoval celou obrazovou stopu během zpracování zvuku. MP4 používá fragmenty, WebM průběžný zápis.
3. Výsledný Blob odkazuje na dokončený soubor. Do RAM se nekopíruje celý výstupní ArrayBuffer.
4. Záložní MediaRecorder ukládá připravené bezeztrátové PNG snímky do jednoho souboru s indexem, nikoli do pole všech obrázků v paměti. Následně čte vždy jeden snímek. Také zakódovaný výstup se zapisuje průběžně.
5. Pracovní soubory se uklízejí při dokončení, chybě a zrušení. Soubor výsledku žije po dobu jeho používání v knihovně; odstranění či nahrazení jej uvolní. Probíhající nativní ukládání soubor podrží do svého dokončení; pro předání browserového stahování platí stejná 40sekundová lhůta jako u FileSaveru. Opuštěné relace po pádu se uklidí při příští videoúloze, pokud jsou dostupné Web Locks. Aktivní relace v jiných kartách se nemažou.
6. Starší WebKit bez `createWritable` má záložní zápis přes OPFS worker. Bez OPFS aplikace oznámí nedostupnost ještě před analýzou; nevynucuje neomezený export v RAM ani odesílání médií na server.

Zůstává omezená fronta kodéru a nejvýše 32 MiB nezapsaných dat. To je ochrana proti pomalému nebo plnému úložišti, nikoli limit délky hotového videa. Metadata nálezů a index zakódovaných bloků stále rostou s délkou klipu. Dostupná kapacita úložiště, velikost jednotlivého snímku a možnosti dekodéru zůstávají skutečnými omezeními zařízení.

Záložní export může potřebovat výrazně více místa než zdrojový komprimovaný soubor, protože připravuje všechny PNG snímky; přednost má WebCodecs. Dočasná data nejsou přidána do galerie, LocalStorage ani síťového úložiště. OPFS není nové aplikační šifrování a úklid není zárukou fyzického přepsání dat na disku.

## Ověření

- **249 testů v 35 souborech:** včetně doplňování průchodů, všech cílových snímků, kontrolních úseků, pohybu při ztrátě trackingu, pořadí zápisů, vlastnictví bufferů, chyby zaplněného disku a úklidu souborů.
- Reálný Chromium export syntetického klipu: WebM, MP4 včetně AAC zvuku, maska na prvním dekódovaném snímku, změna hlasového testovacího tónu 200 → 400 Hz, správná délka a funkční MediaRecorder fallback.
- Další průchod zvýšil počet analyzovaných časů; režim každého snímku pokryl výstupní časovou mřížku. Test zahrnuje ručně přepsaný snímek.
- Všech **11 maskovacích efektů** skutečně změnilo testovací obraz a nezasáhlo mimo kruhovou masku. To testuje vykreslení, nikoli odolnost každého stylového efektu proti rozpoznání identity.
- **180 MiB** se zapsalo a přečetlo po omezených blocích; původní 160MiB strop tedy neplatí pro úložiště. Toto není měření paměti při hodinovém 4K exportu.
- Ověřen přímý OPFS zápis i workerová alternativa, zrušení před renderováním, během renderování a během záložního exportu. Po uvolnění výsledků nezůstaly pomocné videoelementy ani pracovní soubory.
- Kontrola TypeScriptu, produkční build a lint. Build nadále upozorňuje na velikost hlavního JS balíčku.
- Izolovaný skutečný React panel vizuálně a funkčně ověřen i při 390 × 844: režim každého snímku, vlastní frekvence, počet průchodů, přechod k masce a označení kontroly. Výběr videa přes nativní dialog vestavěného prohlížeče nebylo možné automatizovat; celé ovládání editoru s importem videa tímto testem není potvrzeno. Opakovatelná komponentová stránka je `scripts/fixtures/video-analysis.html` a není vstupem produkčního sestavení.

Záznamy ověření a změn: [video-processing-2026-09-29](video-processing-2026-09-29/).

## Co ještě vyžaduje reálné klipy a zařízení

- „Každý snímek“ zde znamená každý snímek exportu podle odhadnutého FPS. Přesné procházení všech zdrojových snímků proměnlivého FPS vyžaduje demux/dekodér nebo nativní AVFoundation/MediaCodec cestu.
- Řidší kontrola může vynechat krátce viditelný objekt. Dopočet masek ani další posunutý průchod nemohou zaručit zachycení všeho. Nové testy neběží nad datasetem skutečných tváří, SPZ a textů.
- Dlouhé 1080p/4K soubory, desítky opakovaných úloh, maximum RAM/disku, teplota a baterie, přerušení a návrat z pozadí; zejména fyzický iPhone, Android a GrapheneOS bez Play services.
- MediaRecorder fallback stále přehrává připravené snímky v reálném čase. Pomalé zařízení může snímky ve výsledku vynechat nebo prodloužit časování; pro přesnou časovou věrnost je vhodná WebCodecs/nativní cesta.
- Staré WebView bez OPFS potřebují aktualizaci nebo samostatné nativní úložiště. Nativní buildy mají dříve zaznamenané blokery místního Xcode/JDK; synchronizace webových souborů není test na telefonu.
