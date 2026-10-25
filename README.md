# Vibra

Sito solo per telefono che fa vibrare il dispositivo con ritmi diversi (Respiro, Notifica, Battito, Pioggia, Massaggio) per 5, 10, 30 o 60 secondi.

## Pubblicare su GitHub Pages
1. Crea un repository su GitHub e carica `index.html`, `style.css` e `script.js`.
2. Vai in **Settings → Pages**.
3. In **Source** scegli **Deploy from a branch**, branch `main`, cartella `/ (root)`, poi **Save**.
4. Dopo un minuto il sito è su `https://TUO-NOME.github.io/NOME-REPO/`.

## Compatibilità
- **Android (Chrome, Edge, Firefox):** vibrazione vera tramite la Vibration API.
- **iPhone:** Safari non ha la Vibration API. Il sito usa i tocchi aptici di iOS 18+, che sono più leggeri e possono fermarsi se lo schermo si spegne.
- **PC:** il sito mostra solo un avviso.
