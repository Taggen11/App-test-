// Offline-svar för Kompis när ingen AI-server finns. Enkla, färdiga idéer.
const pick = (a) => a[Math.floor(Math.random() * a.length)];

const MNEMONICS = [
  "🛑 **Stopp = åtta hörn, alltid stopp.** Tänk: \"Åtta hörn – hjulen står still, även om vägen är tom.\"",
  "🔺 **Väjningsplikt = triangeln pekar ner** – som en tratt som säger \"sakta ner och släpp fram\".",
  "➡️ **Högerregeln:** \"Kommer det från höger – låt dem gå före.\" Gäller där det saknas skyltar och ljus.",
  "🍺 **0,2 och 1,0:** \"Två i tusen – du är fast. Ett i tusen... nej, ETT HELT promille – då är det grovt.\" 0,2 = rattfylleri, 1,0 = grovt.",
  "📏 **3 sekunder:** Säg \"tjugoett, tjugotvå, tjugotre\" när bilen framför passerar en lyktstolpe.",
  "🔢 **Dubbel fart = fyra gånger bromssträcka.** Tänk 2 × 2 = 4.",
  "🦌 **Skymning = djurtimme.** Älgen vaknar när solen går ner och upp.",
  "❄️ **Vinterdäck 3 mm – \"tre för snö\"**, sommar 1,6 mm.",
  "📝 **52 av 65** – \"fem-två för att få gå\". 80 % rätt på kunskapsprovet.",
];
const CHALLENGES = [
  "🚌 **Skylt-bingo:** Nästa gång du åker buss eller bil – hitta 5 olika vägmärken och säg vad de betyder.",
  "🚶 **Fotgängarspanaren:** Gå en promenad och räkna hur många bilar som stannar vid övergångsställen. Vem gjorde rätt?",
  "🗣️ **Lär ut en regel:** Förklara högerregeln för en kompis eller förälder på max 30 sekunder.",
  "⚡ **Rekordjakt:** Kör tre snabbrundor idag och försök slå ditt rekord.",
  "🧩 **Skapa egna frågor:** Skriv 3 egna quizfrågor om något du svarat fel på. Att hitta på frågor gör att du minns bättre!",
  "🎧 **Ögonen vila:** Slå på \"Läs upp automatiskt\" i Profil och plugga med öronen en stund.",
];
const NERVES = `Det är helt normalt att vara nervös! 💙
• Sov ordentligt natten innan och ät frukost.
• Gör flera provprov i appen tills du klarar 80 % lätt.
• Läs varje fråga två gånger – leta efter ord som "inte" och "alltid".
• Hoppa över svåra frågor och kom tillbaka.
• Du får göra om provet om det inte går – det är inte farligt.`;

export function offlineCoachReply(text, stats) {
  const t = text.toLowerCase();
  if (/(plan|schema|vecka)/.test(t)) {
    const weak = stats.svagast?.join(" och ") || "dina svagaste delar";
    return `📅 Förslag på 7-dagarsplan (ca 15 min/dag):
Dag 1: Lektion i ${weak}.
Dag 2: Repetera fel + Skyltjakt.
Dag 3: Ny värld du inte testat än.
Dag 4: Dagens utmaning + Snabbrunda.
Dag 5: Repetera fel.
Dag 6: Provprov – se var du står.
Dag 7: Vila eller lätt repetition 🎉
Tips: Hellre lite varje dag än mycket en gång!`;
  }
  if (/(nervös|rädd|stress|orolig)/.test(t)) return NERVES;
  if (/(utmaning|idé|ide|kul|roligt)/.test(t)) return `Här är en idé:\n\n${pick(CHALLENGES)}\n\nOch en till:\n${pick(CHALLENGES)}`;
  if (/(höger|väjning)/.test(t)) return "🚦 Väjningsplikt betyder: sakta ner. Stanna om det behövs. Släpp fram andra.\n\nHögerregeln: Ingen skylt? Inga ljus? Då ska du släppa fram den som kommer från höger.\n\nKom ihåg: \"Kommer det från höger – låt dem gå före.\"";
  return `💡 Här är en minnesregel:\n\n${pick(MNEMONICS)}\n\n(Kompis kör i offline-läge just nu, så svaren är färdiga tips. Med AI påslaget kan jag svara på precis din fråga.)`;
}
