# Podklady k auditu z 28. 9. 2026

Hlavní dokument: [Audit a plán oprav](../AUDIT-2026-09-28.md).

Tyto soubory zachycují auditované chování, ne implementované opravy. Aplikační zdroj nebyl změněn.

## Izolované reprodukce

Vyžadují Node.js 22.13 nebo novější s `stripTypeScriptTypes`. Spouštějí se z kořene projektu, nepotřebují npm závislosti, skutečné modely, přístup k médiím ani síť:

```sh
node docs/audit-2026-09-28/repro-video.mjs
node docs/audit-2026-09-28/repro-privacy.mjs
```

Výstupní JSON obsahuje datum, verzi Node a popis omezení. Reprodukce načítají skutečné zdrojové funkce. DOM/MediaRecorder pro fallback a selhání Tesseractu pro OCR jsou záměrně mockované; nejde o kompletní browser test. Heap benchmark je syntetický Node benchmark, ne měření celkové spotřeby telefonu.

## Další záznamy

- `verification.json`: výsledky unit testů, sestavení, lint, živého UI a hash auditovaných klíčových souborů.
- `dependency-audit.json`: surový výstup `npm audit --omit=dev --json`; severity balíčku není důkaz dosažitelnosti zranitelnosti v této aplikaci.
- `release-audit.log`: existující release audit proti původnímu neúplnému dist. Nové oddělené sestavení do dočasného adresáře uspělo.

Běžné kontroly projektu po instalaci zamčených závislostí:

```sh
npm test
npm run lint
npm run build
```

V auditu se použilo `tsc --noEmit` a následně `vite build --outDir /tmp/anonymizer-audit-dist`, aby se nepřepsal původní dist. Veškeré modely a soubory pro kontrolu UI pocházely z lokálně přibalených assetů. Fyzické mobilní zařízení, native build, plná automatická browser smoke sada ani zatěžovací GPU profil nebyly součástí tohoto běhu.
