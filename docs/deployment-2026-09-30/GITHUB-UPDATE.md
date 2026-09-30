# Balíček pro aktualizaci GitHubu

Archiv `release/github/2026-09-30/w3pn-anonymizer-source-2026-09-30.zip` obsahuje zdrojové kódy, nativní projekty, zamčené npm/Gradle závislosti a veřejné runtime prostředky. Zachovává všechny moduly včetně lokálních modelů, demo médií a OCR dat. Uvnitř je manifest SHA-256 jednotlivých souborů.

Neobsahuje `node_modules`, `dist`, APK/IPA, SDK, iOS framework cache, zdrojové zálohy, lokální hesla a podpisové klíče, osobní konfiguraci IDE, záznamy prostředí, testovací logy a screenshoty. Při synchronizaci nativních platforem se webové kopie a iOS frameworky znovu připraví.

## Aktualizace existujícího repozitáře

1. Naklonuj https://github.com/web3privacy/w3pn-anonymizer do samostatné složky nebo použij čistý existující checkout. Vytvoř větev pro tuto aktualizaci, například `release/2026-09-30`.
2. Rozbal ZIP a zkopíruj obsah jeho složky `w3pn-anonymizer` do kořene checkoutu. Zachovej existující složku `.git` a historii.
3. Starý repozitář sledoval některé generované složky. `.gitignore` již obsahuje nová pravidla, ale sám neodstraní dříve sledované soubory. Odstraň z Git indexu pouze existující sledované artefakty v `dist/`, `.vite/`, `output/`, `build/`, `release/`, nativních build/cache složkách a synchronizovaných kopiích webu; zdrojové `public/` zachovej. Před odstraněním zkontroluj diff.
4. Spusť `npm ci`, `npm run lint`, `npm test` a `npm run build`. Vývojové nástroje pro mobilní aplikace ověří `npm run native:doctor`. `npm run ios:sync` a `npm run android:sync` připraví nativní prostředky.
5. Zkontroluj `git status` a diff. Commitni zdroje, `LICENSE`, lockfile, nativní projekty a potřebné veřejné assety. Neměly by se objevit žádné SDK, hesla, certifikáty ani soukromé klíče. Nahraj svou větev a otevři PR do `main`.

Tento úkol připravuje balíček; do GitHubu sám nic nepublikuje. Kompletní ZIP lze také přiložit ke GitHub Release, ale to nenahrazuje aktualizaci jednotlivých zdrojových souborů ve větvi.

## Licenční stav

Kořenový `LICENSE` doplňuje MIT pro projektový kód, kterou již deklaroval původní README. Samostatné licence a původ modelů, médií a dalších třetích stran ještě vyžadují dokončení inventáře; tento balíček není potvrzení připravenosti pro App Store/F-Droid. Podrobnosti jsou v `docs/MOBILE-RELEASE-PLAN-2026-09-30.md`.
