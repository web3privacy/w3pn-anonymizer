# Nasazení aktualizované aplikace

Cílová doména: https://anonymizer.web3privacy.info. Datum: 30. září 2026. SSH spojení s uživatelem určeným VPS funguje přes existující klíč; hesla nebyla pro nasazení použita ani zapsána do zdrojového balíčku.

## Příprava

- Původní nginx root: `/opt/w3pn-anonymizer/repo/dist`, index z 20. června 2026.
- Záloha současného statického webu a konfigurace cílové domény: `/opt/w3pn-anonymizer/backups/20260930-ui-native/`.
- Nové vydání: `/opt/w3pn-anonymizer/releases/20260930-ui-native/dist`.
- Existující same-origin feedback backend na `127.0.0.1:7866` vrací health `ok`; jeho úložiště se nemění.
- Hash klíčového ONNX WASM modulu i YuNet modelu souhlasí s původním nasazením. Nové stabilní URL souborů se mají revalidovat; hashed JS/CSS zachovají dlouhou cache. Staré hashed soubory se do vydání doplňují pro již otevřené karty.

## Kontroly před nasazením

- Lint: úspěšný.
- Produkční sestavení: úspěšné; Vite upozorňuje na hlavní chunk přes 500 kB.
- Unit testy: 36 souborů, 252 testů prošlo.
- Produkční browser smoke na lokálním sestavení: 69 kontrol prošlo, 0 chyb, šest viewportů plus další picker/metadata kontroly.
- Release audit: 11 kontrol prošlo, 0 varování, 0 chyb; včetně 500 souborů obrázkových presetů.

Doklady jsou v sousedních `.log` souborech a `build-identity.json`. Aktivace prošla přes `nginx -t` a reload bez výpadku. Veřejný index má stejný SHA-256 jako ověřené lokální sestavení. Na veřejné doméně prošlo dalších 69 browser kontrol včetně automatické detekce obličejů v demu; nejsou zaznamenané externí síťové hosty ani kritické chyby konzole. MIME a izolační/CSP hlavičky jsou ověřené. Správa feedbacku nadále vrací 401 bez přihlášení. Nativní iOS oprava je dokumentovaná odděleně v `../ios-startup-2026-09-30/`.

## Návrat k původní verzi

Na VPS obnovit pouze konfiguraci této domény z `/opt/w3pn-anonymizer/backups/20260930-ui-native/anonymizer.web3privacy.info.conf` do `/etc/nginx/sites-available/anonymizer.web3privacy.info.conf`, zkontrolovat `nginx -t` a provést `systemctl reload nginx`. Původní root zůstává fyzicky dostupný. Statická záloha je navíc v `dist-before.tar.gz`.

## Zdrojový balíček

[Postup aktualizace GitHubu](GITHUB-UPDATE.md). Balíček vytváří `node scripts/package-github-source.mjs 2026-09-30`; kontrolní součet ZIPu je uložený vedle archivu. Dokumentace a nativní oprava jsou součástí zdrojového balíčku.

ZIP obsahuje 980 ověřených souborů (přibližně 98 MiB). Všechny soubory souhlasí s manifestem SHA-256. Rozbalený balíček prošel produkčním sestavením s již nainstalovanými zamčenými závislostmi propojenými pouze do dočasné kontrolní složky; nový síťový `npm ci` nebyl touto kontrolou simulovaný.
