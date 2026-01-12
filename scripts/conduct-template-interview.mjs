// Template Interview Script
// Führt strukturiertes Interview durch und erstellt Protokoll

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const INTERVIEW_FILE = path.join(rootDir, 'docs', 'TEMPLATE_INTERVIEW_PROTOCOL.md');

const questions = [
  {
    section: 'Projekt-Kontext',
    questions: [
      {
        id: 'Q1',
        text: 'Was ist der Hauptzweck des WattWelten Metaverse?',
        type: 'multiple',
        options: [
          'Präsentationen & Events',
          'Meetings & Konferenzen',
          'Schulungen & Workshops',
          'Networking & Socializing',
          'Showroom & Ausstellungen',
          'Andere'
        ]
      },
      {
        id: 'Q2',
        text: 'Wer ist die Zielgruppe?',
        type: 'multiple',
        options: [
          'B2B (Unternehmen)',
          'B2C (Endkunden)',
          'B2G (Behörden)',
          'Bildungseinrichtungen',
          'Andere'
        ]
      },
      {
        id: 'Q3',
        text: 'Welche Emotion soll das Template vermitteln?',
        type: 'multiple',
        options: [
          'Professionell & Seriös',
          'Innovativ & Modern',
          'Nachhaltig & Ökologisch',
          'Warm & Einladend',
          'Futuristisch & Technologisch',
          'Natürlich & Organisch',
          'Andere'
        ]
      }
    ]
  },
  {
    section: 'Design-Stil',
    questions: [
      {
        id: 'Q4',
        text: 'Welcher Design-Stil passt am besten?',
        type: 'single',
        options: [
          'Photorealistisch',
          'Stylized',
          'Low-Poly',
          'Cartoon',
          'Minimalistisch'
        ]
      },
      {
        id: 'Q5',
        text: 'Gibt es Referenz-Templates oder Inspirationen?',
        type: 'text',
        placeholder: 'Websites, Spiele, 3D-Modelle, Screenshots...'
      },
      {
        id: 'Q6',
        text: 'Welche Farbpalette bevorzugen Sie?',
        type: 'text',
        placeholder: 'Primärfarbe, Sekundärfarbe, Beispiele...'
      }
    ]
  },
  {
    section: 'Umgebung & Setting',
    questions: [
      {
        id: 'Q7',
        text: 'Welche Art von Umgebung?',
        type: 'single',
        options: [
          'Außen (Wald, Park, Plaza, Garten)',
          'Innen (Meeting-Room, Konferenz-Saal, Showroom)',
          'Hybrid (Innen mit Außen-Blick, Atrium)',
          'Abstrakt (Keine reale Umgebung)'
        ]
      },
      {
        id: 'Q8',
        text: 'Wenn Außen – welche Landschaft?',
        type: 'multiple',
        options: [
          'Wald',
          'Park',
          'Plaza',
          'Garten',
          'Natur',
          'Andere'
        ],
        conditional: 'Q7 === "Außen"'
      },
      {
        id: 'Q9',
        text: 'Wenn Innen – welcher Raum-Typ?',
        type: 'multiple',
        options: [
          'Meeting-Room',
          'Konferenz-Saal',
          'Showroom',
          'Lounge',
          'Büro',
          'Andere'
        ],
        conditional: 'Q7 === "Innen"'
      },
      {
        id: 'Q10',
        text: 'Wie groß soll die Umgebung sein?',
        type: 'single',
        options: [
          'Klein (20×20m)',
          'Mittel (50×50m)',
          'Groß (100×100m)',
          'Sehr groß (200×200m)'
        ]
      }
    ]
  },
  {
    section: 'Beleuchtung & Atmosphäre',
    questions: [
      {
        id: 'Q12',
        text: 'Welche Tageszeit/Stimmung?',
        type: 'single',
        options: [
          'Morgendlich',
          'Mittags',
          'Abend',
          'Nacht',
          'Sonnenuntergang'
        ]
      },
      {
        id: 'Q13',
        text: 'Welche Lichtquelle?',
        type: 'single',
        options: [
          'Natürlich (Sonne, Himmel)',
          'Künstlich (Lampen, Leuchten)',
          'Gemischt',
          'Abstrakt'
        ]
      }
    ]
  },
  {
    section: 'Funktionale Anforderungen',
    questions: [
      {
        id: 'Q19',
        text: 'Welche Zonen werden benötigt?',
        type: 'multiple',
        options: [
          'Main Zone',
          'Stage',
          'Breakout 1',
          'Breakout 2',
          'Lounge',
          'Andere'
        ]
      },
      {
        id: 'Q24',
        text: 'Wo soll der Spawn-Punkt sein?',
        type: 'text',
        placeholder: 'Zentral, Eingang, Stage, oder Koordinaten...'
      }
    ]
  },
  {
    section: 'Performance & Qualität',
    questions: [
      {
        id: 'Q25',
        text: 'Welche Performance ist wichtig?',
        type: 'single',
        options: [
          'Höchste Qualität',
          'Ausgewogen',
          'Performance-First'
        ]
      },
      {
        id: 'Q26',
        text: 'Ziel-Geräte?',
        type: 'multiple',
        options: [
          'Desktop',
          'Laptop',
          'Mobile',
          'Alle'
        ]
      }
    ]
  },
  {
    section: 'Finalisierung',
    questions: [
      {
        id: 'Q34',
        text: 'Kurze Beschreibung des gewünschten Templates (2-3 Sätze):',
        type: 'text',
        multiline: true
      },
      {
        id: 'Q35',
        text: 'Die 3 wichtigsten Anforderungen:',
        type: 'text',
        multiline: true
      }
    ]
  }
];

function generateInterviewProtocol() {
  const protocol = `# Template-Interview Protokoll

**Datum:** ${new Date().toLocaleDateString('de-DE')}  
**Teilnehmer:** [Name]  
**Dauer:** [Zeit]  
**Status:** [In Bearbeitung/Abgeschlossen]

---

## 📋 Interview-Ergebnisse

${questions.map(section => `
### ${section.section}

${section.questions.map(q => `
#### ${q.id}: ${q.text}

**Antwort:**
[Zu dokumentieren während des Interviews]

**Notizen:**
[Zusätzliche Notizen, Klarstellungen, etc.]

`).join('\n')}
`).join('\n')}

---

## 📊 Zusammenfassung

### Design-Stil
[Basierend auf Q4, Q5, Q6]

### Umgebung
[Basierend auf Q7, Q8, Q9, Q10]

### Beleuchtung
[Basierend auf Q12, Q13]

### Funktionale Anforderungen
[Basierend auf Q19, Q24]

### Performance-Anforderungen
[Basierend auf Q25, Q26]

### Finale Beschreibung
[Basierend auf Q34, Q35]

---

## 🎯 Nächste Schritte

1. [ ] Design-Briefing aktualisieren
2. [ ] Moodboard erstellen
3. [ ] Template-Recherche durchführen
4. [ ] Designer auswählen
5. [ ] Kickoff-Meeting planen

---

**Protokoll erstellt:** ${new Date().toISOString()}
`;

  return protocol;
}

function main() {
  console.log('📋 Template Interview Script\n');
  console.log('='.repeat(60));
  console.log('Dieses Script hilft beim strukturierten Interview.');
  console.log('='.repeat(60));
  console.log('\n📝 Interview-Fragen:');
  console.log(`   Gesamt: ${questions.reduce((sum, s) => sum + s.questions.length, 0)} Fragen`);
  console.log(`   Sektionen: ${questions.length}`);
  
  console.log('\n📄 Protokoll-Vorlage wird erstellt...');
  const protocol = generateInterviewProtocol();
  
  fs.writeFileSync(INTERVIEW_FILE, protocol, 'utf-8');
  console.log(`✅ Protokoll erstellt: ${INTERVIEW_FILE}`);
  
  console.log('\n📋 Nächste Schritte:');
  console.log('1. Öffne TEMPLATE_INTERVIEW.md für die Fragen');
  console.log('2. Führe Interview durch');
  console.log('3. Dokumentiere Antworten in TEMPLATE_INTERVIEW_PROTOCOL.md');
  console.log('4. Erstelle Design-Briefing basierend auf Ergebnissen');
  console.log('5. Starte Template-Recherche\n');
}

main();
