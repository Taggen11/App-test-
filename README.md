# 🚗 Körkortskompis

En mobilapp där du pluggar till **svenskt B-körkort** som ett spel, med AI-coachen **Kompis**.

## Funktioner

**Spel**
- 📚 **235 frågor** och 43 vägmärken ritade som bilder
- 🗺️ **Karta med 7 världar**: Företräde & regler, Vägmärken, Fart & avstånd, Människan bakom ratten, Risker & väglag, Miljö & eco-driving, Bilen & körkortet
- ⭐ XP, nivåer och titlar (från "Övningsbil" till "Körkortslegend"), 🔥 dagar i rad, 🎯 dagligt mål, 🏆 märken, combo-bonus och konfetti
- 🎮 Spellägen: Dagens utmaning, ⚡ Snabbrunda (60 sek), 🔁 Repetera fel, 🛑 Skyltjakt, 🎓 Provprov (upplagt som kunskapsprovet)
- 🧠 Repetition med mellanrum (Leitner-system): frågor du svarar fel på kommer tillbaka tills du kan dem
- Varje fråga har en förklaring, och vägmärkena är ritade som bilder

**AI-coachen Kompis** (Claude)
- Hittar på minnesregler, studieplaner, utmaningar och trafikscenarion
- Skapar nya quizfrågor utifrån dina svagaste områden
- "🤖 Fråga Kompis" efter varje fråga förklarar varför svaret är rätt
- Ser dina framsteg och anpassar råden efter dem
- Utan API-nyckel körs ett offline-läge med färdiga tips

**Så att alla kan lära sig**
- 🔊 Uppläsning på svenska (frågor, svar och förklaringar)
- Större text, lättläst läge (bra vid dyslexi), hög kontrast, mörkt läge
- Fel svar ger uppmuntran i stället för straff, och det finns inga "liv" som tar slut
- Fungerar offline och kan installeras på hemskärmen (PWA)

## Kom igång

```bash
npm install
ANTHROPIC_API_KEY=din-nyckel npm start
```

Öppna sedan `http://localhost:3000`. På mobilen öppnar du datorns IP-adress (t.ex. `http://192.168.1.10:3000`) i samma wifi och väljer **Lägg till på hemskärmen**.

Utan `ANTHROPIC_API_KEY` fungerar hela appen ändå, men Kompis svarar då med färdiga offline-tips.

## 📱 Mobilappen (Android & iOS)

Appen är paketerad med [Capacitor](https://capacitorjs.com) som riktiga appar.

**Android – ladda ner APK:**
Vid varje push bygger GitHub Actions en APK automatiskt (workflow *Android APK*).
Gå till fliken **Actions** på GitHub → senaste körningen → ladda ner `korkortskompis-apk`,
packa upp och öppna `.apk`-filen på telefonen (tillåt "installera okända appar").

**Bygga själv:**
```bash
npm install
npm run cap:sync       # kopierar public/ till Android/iOS
npm run android:open   # öppnar i Android Studio
npm run ios:open       # öppnar i Xcode (kräver Mac)
```

**AI-coachen i mobilappen:** publicera servern (t.ex. med `Dockerfile` på valfri molntjänst, med `ANTHROPIC_API_KEY` som hemlighet)
och skriv in adressen i `public/config.js` (`API_BASE`). Utan server använder appen Kompis offline-läge.

**PWA:** öppna webbversionen i mobilen och välj *Lägg till på hemskärmen* – fungerar direkt, även offline.

## Struktur

| Fil | Innehåll |
|---|---|
| `server.js` | Node-server som visar appen och anropar Claude (`/api/coach`) |
| `public/app.js` | Spellogik, XP, repetition, AI-chatt och inställningar |
| `public/questions.js` | Frågebanken: lägg till fler frågor här |
| `public/signs.js` | Vägmärken som SVG |
| `public/coach-offline.js` | Kompis svar när AI saknas |
| `public/config.js` | Adress till AI-servern (för mobilappen) |
| `android/`, `ios/` | Native-projekt (Capacitor) |
| `.github/workflows/android.yml` | Bygger Android-APK automatiskt |

> Reglerna i frågebanken bygger på svenska trafikregler. Kontrollera alltid aktuella regler på [trafikverket.se](https://www.trafikverket.se).
