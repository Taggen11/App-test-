# 🚗 Körkortskompis

En mobilapp där du pluggar till **svenskt B-körkort** som ett spel, med AI-coachen **Kompis**.

## Funktioner

**Spel**
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

## Struktur

| Fil | Innehåll |
|---|---|
| `server.js` | Node-server som visar appen och anropar Claude (`/api/coach`) |
| `public/app.js` | Spellogik, XP, repetition, AI-chatt och inställningar |
| `public/questions.js` | Frågebanken: lägg till fler frågor här |
| `public/signs.js` | Vägmärken som SVG |
| `public/coach-offline.js` | Kompis svar när AI saknas |

> Reglerna i frågebanken bygger på svenska trafikregler. Kontrollera alltid aktuella regler på [trafikverket.se](https://www.trafikverket.se).
