# První spuštění na vlastních zařízeních

Tento postup platí pro připravený projekt na tomto Macu, Xcode 27 a Android Studio. Připojuj nejprve jeden telefon nebo tablet. Použij datový USB kabel, který vede z telefonu přímo do Macu; samotné nabíjení nedokazuje funkční datové spojení.

## iPhone 17 Pro a iPad 10: účet a podpis

1. Otevři Xcode → Settings → Apple Accounts → tlačítko `+` a přihlas se svým Apple účtem. Přihlášení a případné ověření udělej přímo v Xcode.
2. Bez placeného členství se objeví `Personal Team`. Pro první testy na vlastním iPhonu a iPadu je to dostačující. Profily platí 7 dní, potom aplikaci znovu sestavíš a nainstaluješ. Pro TestFlight a App Store později potřebujeme členství v Apple Developer Program; pokud má Web3Privacy vlastní organizaci/team, použij její pozvánku a team.
3. Otevři projekt `ios/App/App.xcodeproj` v Xcode. V levém navigátoru klikni na modrou položku projektu `App`; uprostřed zvol `TARGETS → App → Signing & Capabilities`.
4. Zapni `Automatically manage signing`. V `Team` vyber svůj `Personal Team` nebo existující organizační team. Xcode pro vývoj vytvoří certifikát a provisioning profile automaticky.
5. Ponech `Bundle Identifier` jako `info.web3privacy.anonymizer`. Jen pokud Xcode hlásí, že je identifikátor již zaregistrovaný cizím teamem, použij pro své testy vlastní unikátní identifikátor, například `cz.coinmandeer.anonymizer.dev`. Pro veřejné vydání vybereme trvalý identifikátor pod správným teamem.
6. Pokud Xcode hlásí chybějící vývojový certifikát, v Settings → Apple Accounts zvol účet → Manage Certificates → `+` → `Apple Development`. Ruční vytváření CSR, stahování profilů ani nákup certifikátu pro tento první test nejsou potřeba.

Apple popisuje [Personal Team a sedmidenní platnost](https://developer.apple.com/help/account/basics/about-your-developer-account), [automatické podepisování a spuštění](https://developer.apple.com/documentation/xcode/running-your-app-on-simulated-or-physical-devices) a [registraci členství pro distribuci](https://developer.apple.com/programs/enroll/).

## iPhone 17 Pro a iPad 10: připojení a Run

1. Připoj iPhone k Macu datovým USB-C kabelem. Odemkni jej a potvrď `Důvěřovat tomuto počítači`; pokud se Mac ptá na přístup příslušenství, také jej povol. Pro iPad použij následně stejný postup.
2. Otevři Device Hub přes Xcode → Open Developer Tool → Device Hub a počkej na spárování fyzického zařízení. Nezaměň svůj telefon s profilem `Anonymizer iPhone 17 Pro`, který je simulátor.
3. Na telefonu/tabletu zapni Nastavení → Soukromí a zabezpečení → Režim vývojáře (Developer Mode). Potvrď restart a následně zapnutí režimu. Pokud položka zatím chybí, nejprve nech zařízení připojené a rozpoznané Xcode.
4. V horní liště Xcode ponech schéma `App` a jako cíl vyber svůj skutečný připojený iPhone. Počkej, až Xcode dokončí případnou přípravu podpory zařízení.
5. Stiskni `▶ Run` nebo `⌘R`. Xcode aplikaci sestaví, podepíše, nainstaluje a spustí. První podepsané sestavení potřebuje přístup k Apple službám; samotná aplikace má své webové/modelové prostředky zabalené lokálně.
6. Pokud telefon hlásí nedůvěryhodného vývojáře, otevři Nastavení → Obecné → VPN a správa zařízení a potvrď důvěru příslušnému vývojářskému profilu. Tato položka se objeví až po instalaci profilu.
7. Nejprve ověř úvodní menu, Load demo, změnu efektu a jeho síly, ruční štětec a export do Fotek. Poté aplikaci přepni do pozadí a zpět a zopakuj export. Totéž projdi na iPadu, včetně otočení obrazovky.

[Apple: Developer Mode](https://developer.apple.com/documentation/xcode/enabling-developer-mode-on-a-device).

## Pokud chceš zatím pouze simulátor

Podpis a Apple účet nejsou potřeba. Opravené sestavení je již nainstalované do našich profilů `Anonymizer iPhone 17 Pro` a `Anonymizer iPad 10`. V Device Hubu otevři jeden z těchto profilů a spusť ikonu `W3PN Anonymizer`. Pro další sestavení použij v Xcode schéma `App`, vyber simulovaný telefon/tablet a stiskni `⌘R`.

## Redmi 11: připojení a Run

Přesná jména položek se liší podle MIUI/HyperOS. V MIUI bývá zapnutí vývojářských voleb v Nastavení → O telefonu → Všechny specifikace → sedm klepnutí na verzi MIUI. V HyperOS hledej odpovídající verzi systému.

1. Zapni vývojářské volby a v Nastavení → Další nastavení → Možnosti pro vývojáře zapni `Ladění USB / USB debugging`.
2. Připoj odemčený Redmi datovým USB kabelem k Macu. Potvrď `Povolit ladění USB?` pro tento počítač. Pokud jej Mac nevidí, v USB oznámení vyber přenos souborů a zkus jiný datový kabel.
3. Otevři Android Studio → Open a vyber složku `android` uvnitř tohoto projektu. Počkej na dokončení synchronizace Gradle.
4. V horním výběru zařízení zvol skutečný Redmi, konfiguraci `app` a stiskni `▶ Run`. Sestavení už používá vývojový Android podpis automaticky; není potřeba vývojářský účet Google.
5. Pokud Xiaomi odmítne samotnou instalaci, zkontroluj volbu `Install via USB / Instalovat přes USB` ve vývojářských volbách a potvrzení instalace na telefonu. Pro zrcadlení může konkrétní systém navíc vyžadovat `USB debugging (Security settings)`; nejprve zkus standardní ladění.
6. Alternativně lze do telefonu překopírovat `android/app/build/outputs/apk/debug/app-debug.apk` a otevřít jej; systém požádá o povolení instalace pro příslušnou aplikaci. Instalace přes Android Studio je lepší pro získání záznamu případného pádu.

[Android: fyzická zařízení a USB](https://developer.android.com/studio/run/device), [ASUS: umístění MIUI vývojářských voleb](https://www.asus.com/support/faq/1046846/), [Android: vývojové a distribuční podpisy](https://developer.android.com/studio/publish/app-signing).

Pro veřejné vydání Androidu později vytvoříme samostatný release klíč s bezpečnou zálohou. Současný debug klíč je určený jen pro vývoj. F-Droid je samostatná distribuční příprava, ne další telefonní operační systém.

## Když aplikace znovu spadne

Spusť ji přes `Run` v Xcode, aby zůstal připojený debugger. Otevři dolní konzoli přes View → Debug Area → Activate Console a zkopíruj chybu a posledních přibližně 30 řádků. Na simulátoru se pád ukládá také do `~/Library/Logs/DiagnosticReports/App-*.ips`. V Android Studiu otevři View → Tool Windows → Logcat, zvol Redmi a proces `info.web3privacy.anonymizer` (nebo svůj lokální bundle identifier, pokud jsi jej změnil). Pošli hlášení `FATAL EXCEPTION` včetně následujícího stack trace.
