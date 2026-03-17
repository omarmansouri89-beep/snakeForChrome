# 🐍 SOWEDO Snake (Vibecoding Editie)

Welkom bij mijn interactieve sollicitatie-project! Speciaal gebouwd voor de rol van Vibecoding Developer bij **SOWEDO**. 

Dit is niet zomaar de klassieke Snake; het is een moderne, neon-verlichte versie in de browser met dynamische deeltjes (particles), lokale highscores en retro geluidseffecten die live in de browser worden gegenereerd.

## 🚀 Features
* **Neon/Cyberpunk UI:** Volledig opgemaakt met CSS `box-shadow` en HTML5 Canvas `shadowBlur`.
* **Particle Engine:** Een custom class die deeltjes-explosies genereert zodra de slang voedsel eet. De deeltjes nemen de kleur van het gegeten snoepje aan.
* **Web Audio API:** Geen externe `.wav` bestandjes voor de bliepjes! De geluidseffecten (eat & die) worden realtime gegenereerd met wiskundige oscillatoren (`square` en `sawtooth` waves).
* **Highscore Systeem:** Slaat de top 10 scores lokaal op via de `localStorage` van de browser.
* **Oplopende Moeilijkheid:** Het spel start op 50% snelheid en wordt elke 5 punten 10% sneller.

## 🛠️ Tech Stack
* **HTML5** (Canvas & Audio API)
* **CSS3** (Flexbox & Neon styling)
* **Vanilla JavaScript** (ES6 Classes, State management, Game Loop)

---

## 🤖 De "Secret Sauce" (Prompt Engineering)
Bij SOWEDO draait het om slim bouwen met AI-tools. Om te laten zien dat ik niet alleen code kan lezen, maar ook effectief AI kan aansturen, is de basis van deze hele game (inclusief styling, logica en audio) gegenereerd met **één enkele, gedetailleerde prompt**. 

<details>
<summary>👉 <b>Klik hier om de originele Mega-Prompt te zien</b> 🪄</summary>

> "Schrijf de code voor een geavanceerd Snake-spel in HTML, CSS en JavaScript. Geef me de code verdeeld over 3 aparte bestanden (`index.html`, `style.css`, `script.js`). Dit spel is bedoeld als portfolio-project voor een sollicitatie bij het IT-bedrijf 'SOWEDO'.
> 
> Het spel moet de volgende specifieke features en styling bevatten:
> 
> **1. Layout & Styling (Neon/Cyberpunk thema):**
> * **Achtergrond:** Donker (`#121212`).
> * **Structuur:** Een flexbox layout met drie kolommen.
> * **Linkerkolom (SOWEDO Banner):** Een div met neon-cyaan randen, de tekst "Speciaal gebouwd voor de sollicitatie bij SOWEDO", en een lichtgevende streep (`box-shadow`).
> * **Middenkolom (Game):** De titel "Browser Snake" in neon-groen, een Muziek Aan/Uit knop, het HTML5 Canvas (400x400) met een groene neon glow, de instructies (pijltjes = bewegen, spatie = pauzeren), en de huidige score.
> * **Rechterkolom (Highscores):** Een lijst die de top 10 scores toont.
> 
> **2. Gameplay & Mechanics:**
> * **Besturing:** Pijltjestoetsen voor de slang. Voorkom dat de slang direct 180 graden kan omdraaien.
> * **Pauze-functie:** Spatiebalk pauzeert of hervat het spel. Als het spel pauzeert, teken dan een semi-transparante zwarte laag over het canvas met de tekst "PAUZE" in neon-blauw.
> * **Snelheid (Oplopende moeilijkheid):** De `setInterval` start op 200ms. Elke 5 gegeten snoepjes wordt het spel 10% sneller. De maximale snelheid is gecapt op 60ms.
> * **Snoepjes (Voedsel):** Definieer een array met 5 verschillende neon-kleuren (bijv. roze, blauw, geel, paars, oranje). Bij het spawnen van voedsel wordt willekeurig een kleur gekozen en getekend met `shadowBlur` voor een glow-effect.
> * **Particle Systeem:** Maak een `Particle` class. Zodra de slang eet, spawnen er 15 deeltjes op die locatie die langzaam uitdoven (`globalAlpha`) en wegschieten. Deze particles erven exact de kleur van het snoepje dat zojuist is gegeten.
> 
> **3. Highscore Systeem:**
> * Gebruik `localStorage` om de top 10 scores op te slaan.
> * Bij een Game Over, toon een HTML-overlay over het hele scherm (`z-index`). 
> * Als de speler de top 10 haalt: Toon de score, een invoerveld voor hun naam, en een 'Opslaan' knop.
> * Als de speler het niet haalt (of na het opslaan): Toon de score en een 'Nieuwe Game' knop om te resetten. Zorg dat de overlay altijd verdwijnt bij een nieuw spel.
> 
> **4. Audio:**
> * **Achtergrondmuziek:** Gebruik een `<audio loop src="music.mp3"></audio>` tag met volume op 0.3. Koppel de mute-knop hieraan.
> * **Gegenereerde SFX:** Gebruik de native Web Audio API (Oscillators) om retro 8-bit geluiden te maken, zodat ik geen externe sound-files nodig heb. Genereer een vrolijke, korte hoge toon (`square wave`) bij het eten, en een dalende, lage toon (`sawtooth wave`) bij Game Over. Zorg dat de mute-knop ook deze gegenereerde geluiden dempt."

</details>

---

## 🎮 Speel het zelf!
Je kunt het spel direct in je browser spelen via GitHub Pages:
**[KLIK HIER OM TE SPELEN](https://omarmansouri89-beep.github.io/snakeForChrome/)** *(Vergeet niet je geluid aan te zetten!)*

Bedankt voor het bekijken van mijn code!
