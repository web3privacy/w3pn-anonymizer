# Oprava pádu iOS aplikace při spuštění

30. září 2026 uživatel oznámil okamžitý pád aplikace v Device Hubu. Tři lokální crash reporty `App-2026-09-30-1314*.ips` shodně ukázaly `EXC_BREAKPOINT / SIGTRAP` na hlavním vlákně, v `UIApplicationEvaluateRuntimeIssueForNoSceneLifecycleAdoption`. Bundle odpovídal `info.web3privacy.anonymizer` na našem iPhone 17 Pro simulátoru.

## Příčina a oprava

Původní Capacitor wrapper používal app-only lifecycle a `UIMainStoryboardFile`, bez `UIApplicationSceneManifest`. iOS 27 SDK vyžaduje scene lifecycle; k pádu docházelo ještě před načtením webového editoru. Podpis účtu ani síla efektů nebyly příčinou tohoto konkrétního pádu.

- V `ios/App/App/Info.plist` je nově konfigurace jedné scény, která používá stávající `Main` storyboard a `App.SceneDelegate`.
- `SceneDelegate` v již kompilovaném `AppDelegate.swift` drží okno a předává URL i uživatelské aktivity do Capacitor proxy při spuštění i za běhu. Prázdné nevyužité callbacky starého lifecycle byly odstraněné. Více oken není zapnuté.
- Frontend, prostředky, vzhled editoru a nastavení efektů nebyly změněné.
- Původní zdrojové soubory jsou zálohované v `backups/20260930-ios-scene-lifecycle/`.

Apple popisuje [přechod na scene lifecycle](https://developer.apple.com/documentation/technotes/tn3187-migrating-to-the-uikit-scene-based-life-cycle).

## Ověření

- Skutečné sestavení stávajícím Xcode 27 SDK skončilo `BUILD SUCCEEDED`, viz `build.log`.
- Opravený `.app` byl nainstalovaný do existujících simulátorů `Anonymizer iPhone 17 Pro` a `Anonymizer iPad 10` s runtime iOS 27.0.
- Na každém zařízení proběhla dvě samostatná spuštění. Po každém následovalo 15 sekund sledování, kontrola živého procesu aplikace a screenshot. Snímky druhého spuštění na obou zařízeních byly ručně prohlédnuté a zobrazují vykreslené úvodní menu.
- Při dalším běžném spuštění bez konzolového připojení každá aplikace přežila přepnutí do Nastavení a návrat se stejným PID. Ukončení dřívějšího `simctl --console` připojení samo ukončovalo aplikaci, proto pro návrat do pozadí není tato metoda vhodná.
- Záznamy procesu a kontrol jsou v `startup-check.json`, konzole v `*-launch-*.log`, obrazovky v `*-launch-*.png`. Původní pád je stručně zachycený v `original-crash-summary.json`; nejsou zde kopírované jiné systémové crash reporty.
- Předchozí instalační kontrola přijala úspěšnou odpověď `simctl launch` jako start aplikace. Ta potvrzuje vytvoření procesu, ale nezaručuje, že aplikace vzápětí nespadne. Historický instalační záznam byl doplněný o tuto korekci.

Na fyzickém iPhonu, iPadu a Redmi stále musíme ověřit import, detekci, štětec, efekty, export a oprávnění. Opravené aplikace zůstávají v uživatelem již spuštěných simulátorech otevřené; uživatelská data nebyla mazána.

Přesný postup pro účet, podpisy a připojení je v [DEVICE-SETUP.md](DEVICE-SETUP.md).
