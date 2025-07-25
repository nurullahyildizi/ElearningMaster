

import { GoogleGenAI, Chat, GenerateContentResponse, Type } from "@google/genai";
import { Flashcard, DailyTip, JobAnalysis, Job, SkillCategory, AevoFeedback, PlacedComponent, DigitalTwinFeedback, PlanningScenario, UserCalculation, PlanningFeedback, Wire, DigitalTwinFault, TroubleshootingScenario } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("Gemini API key not found in process.env.API_KEY. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const DEFAULT_SYSTEM_INSTRUCTION = `You are Meister-Bot, a helpful AI mentor for German electrical engineering professionals and apprentices (Elektrotechniker / Azubis). Your goal is to provide accurate, practical, and helpful information based on German standards, especially VDE norms. Answer exclusively in German. Be friendly, encouraging, and act like an experienced master craftsman (Meister). Keep your answers concise and to the point unless asked for details.`;

export const startChat = (systemInstructionOverride?: string): Chat | null => {
  if (!API_KEY) return null;
  const instruction = systemInstructionOverride || DEFAULT_SYSTEM_INSTRUCTION;
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: instruction,
    },
  });
};

export const sendMessageToBot = async (chat: Chat, message: string): Promise<string> => {
  try {
    const result: GenerateContentResponse = await chat.sendMessage({ message });
    return result.text;
  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    if (error instanceof Error && error.message.includes('RESOURCE_EXHAUSTED')) {
        return "Mein aktuelles Kontingent ist leider aufgebraucht. Bitte versuchen Sie es später erneut.";
    }
    return "Es tut mir leid, es ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.";
  }
};

const FLASHCARD_SCHEMA = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      front: {
        type: Type.STRING,
        description: 'Die Vorderseite der Karteikarte (Frage oder Begriff).',
      },
      back: {
        type: Type.STRING,
        description: 'Die Rückseite der Karteikarte (Antwort oder Erklärung).',
      },
    },
    required: ["front", "back"]
  },
};

export const generateFlashcardsFromText = async (lessonText: string): Promise<Flashcard[]> => {
    if (!API_KEY) {
        console.error("Cannot generate flashcards without API key.");
        throw new Error("API key not configured.");
    }

    const prompt = `Basierend auf dem folgenden Lektionstext, erstelle 3-5 zusätzliche, nützliche Karteikarten für einen Auszubildenden der Elektrotechnik. Die Karten sollten wichtige Konzepte, Definitionen oder Regeln abfragen. Der Text: "${lessonText}"`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: FLASHCARD_SCHEMA,
            },
        });
        
        const jsonText = response.text.trim();
        const flashcards = JSON.parse(jsonText);
        
        if (!Array.isArray(flashcards) || flashcards.some(c => typeof c.front !== 'string' || typeof c.back !== 'string')) {
            throw new Error("AI returned data in an unexpected format.");
        }

        return flashcards;

    } catch (error) {
        if (error instanceof Error && error.message.includes('RESOURCE_EXHAUSTED')) {
            console.warn("Gemini API quota exceeded. Could not generate flashcards.");
            throw new Error("API-Limit erreicht. Versuchen Sie es später erneut.");
        }
        console.error("Error generating flashcards with Gemini:", error);
        throw new Error("Konnte die KI-Karteikarten nicht erstellen. Versuchen Sie es später erneut.");
    }
};


// --- AI-Powered Fault Generation for Digital Twin ---

const DIGITAL_TWIN_FAULT_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    faultyComponentId: { type: Type.STRING },
    faultyWireId: { type: Type.STRING },
    description: { type: Type.STRING },
    faultType: { type: Type.STRING, enum: ["component", "wire"] }
  },
  required: ["description", "faultType"]
};

export const generateDigitalTwinFault = async (components: PlacedComponent[], wires: Wire[]): Promise<DigitalTwinFault> => {
    if (!API_KEY) {
        throw new Error("API key not configured.");
    }

    const prompt = `Du bist ein erfahrener deutscher Elektromeister. Für die folgende, korrekt verdrahtete Elektroinstallation, erfinde EINEN einzelnen, realistischen Fehler.
Der Fehler kann entweder eine Komponente betreffen (z.B. Schalter defekt) oder eine Ader (z.B. Aderbruch).
Beschreibe den Fehler kurz und gib die ID des fehlerhaften Teils an.

**Installation:**
Komponenten: ${JSON.stringify(components.map(c => ({ id: c.id, type: c.type, name: c.name })), null, 2)}
Verdrahtung: ${JSON.stringify(wires.map(w => ({ id: w.id, from: w.startComponentId, to: w.endComponentId, color: w.color })), null, 2)}

**Beispiele für gute Fehler:**
- "Die geschaltete Ader vom Schalter zur Leuchte ist unterbrochen." (faultType: 'wire', faultyWireId: 'w5')
- "Der Lichtschalter 'switch1' hat einen internen Defekt und schaltet nicht mehr durch." (faultType: 'component', faultyComponentId: 'switch1')
- "Der Neutralleiter zur Steckdose 'socket1' hat keine Verbindung in der Abzweigdose." (faultType: 'wire', faultyWireId: 'w10')

Gib das Ergebnis als JSON-Objekt zurück, das dem Schema entspricht. Wähle ENTWEDER 'faultyComponentId' ODER 'faultyWireId', nicht beides.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: DIGITAL_TWIN_FAULT_SCHEMA,
            },
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as DigitalTwinFault;

    } catch (error) {
        console.error("Error generating digital twin fault:", error);
        throw new Error("KI-Fehler konnte nicht generiert werden.");
    }
};


const DIGITAL_TWIN_FEEDBACK_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    isCorrect: { type: Type.BOOLEAN },
    feedbackSummary: { type: Type.STRING },
    correctItems: { type: Type.ARRAY, items: { type: Type.STRING } },
    missingItems: { type: Type.ARRAY, items: { type: Type.STRING } },
    placementErrors: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          componentId: { type: Type.STRING },
          error: { type: Type.STRING }
        },
        required: ["componentId", "error"]
      }
    }
  },
  required: ["isCorrect", "feedbackSummary", "correctItems", "missingItems", "placementErrors"]
};

export const getDigitalTwinFeedback = async (task: string, components: PlacedComponent[]): Promise<DigitalTwinFeedback> => {
    if (!API_KEY) throw new Error("API key not configured.");

    const prompt = `Du bist ein deutscher Elektromeister und Prüfer für die Gesellenprüfung. Bewerte eine virtuelle Elektroinstallation auf einem Prüfungsbrett.

**Aufgabe:** "${task}"

**Lösung des Prüflings (Liste der platzierten Komponenten auf dem Brett):**
\`\`\`json
${JSON.stringify(components.map(c => ({id: c.id, type: c.type, x: c.x, y: c.y})), null, 2)}
\`\`\`

**Vereinfachte VDE-Regeln für die Bewertung (y-Koordinate ist der prozentuale Abstand von oben):**
1.  **Schalter ('switch')**: Installationshöhe ca. 1.05m. Das entspricht y-Werten zwischen 30% und 40%.
2.  **Steckdosen ('socket', 'socket-double')**: Installationshöhe ca. 0.3m vom Boden. Das entspricht y-Werten zwischen 85% und 95%.
3.  **Deckenleuchten ('light')**: Installationshöhe an der Decke. Das entspricht y-Werten zwischen 5% und 15%.
4.  **Abzweigdosen ('junction-box')**: Installationshöhe an der Decke (y < 15%) oder direkt über der Tür (y < 25%).
5.  **Stromquelle ('power-source')**: Typischerweise unten links (z.B. y > 80%, x < 20%).

**Deine Aufgabe:**
Gib eine Bewertung als JSON-Objekt zurück, das dem Schema entspricht.
-   **isCorrect**: \`true\` nur, wenn die Anzahl aller Komponenten stimmt UND es keine Platzierungsfehler gibt.
-   **feedbackSummary**: Eine kurze Zusammenfassung auf Deutsch. Lobe, was gut ist, und kritisiere, was falsch ist.
-   **correctItems**: Liste der IDs von Komponenten, die korrekt platziert sind und zur Aufgabe gehören.
-   **missingItems**: Liste der fehlenden Komponenten als Strings (z.B. "1x Lichtschalter").
-   **placementErrors**: Liste von Objekten für jede falsch platzierte oder überzählige Komponente, mit ihrer ID und einer kurzen, klaren Fehlerbeschreibung auf Deutsch (z.B. "Schalter auf falscher Höhe" oder "Überzählige Steckdose").`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: DIGITAL_TWIN_FEEDBACK_SCHEMA,
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as DigitalTwinFeedback;
    } catch (error) {
        if (error instanceof Error && error.message.includes('RESOURCE_EXHAUSTED')) {
            console.warn("Gemini API quota exceeded. Could not get digital twin feedback.");
            throw new Error("API-Limit erreicht. Feedback konnte nicht generiert werden.");
        }
        console.error("Error getting digital twin feedback:", error);
        throw new Error("KI-Feedback konnte nicht generiert werden.");
    }
};


const PLANNING_FEEDBACK_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        summary: {
            type: Type.STRING,
            description: "Eine kurze, allgemeine Zusammenfassung des Feedbacks auf Deutsch. Maximal 2 Sätze."
        },
        lineFeedback: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    deviceIndex: { type: Type.INTEGER, description: "Der 0-basierte Index des Geräts/der Zeile." },
                    field: { type: Type.STRING, description: "Der Name des Feldes mit dem Fehler (z.B. 'Sicherung_A')." },
                    comment: { type: Type.STRING, description: "Ein kurzer, hilfreicher Kommentar auf Deutsch, der den Fehler erklärt." },
                    isCorrect: { type: Type.BOOLEAN, description: "Ist dieser spezifische Wert korrekt?" }
                },
                required: ["deviceIndex", "field", "comment", "isCorrect"]
            }
        }
    },
    required: ["summary", "lineFeedback"]
};

export const getPlanningSimFeedback = async (scenario: PlanningScenario, userCalculations: UserCalculation[]): Promise<PlanningFeedback> => {
    if (!API_KEY) throw new Error("API key not configured.");

    const prompt = `Du bist ein deutscher Elektromeister und IHK-Prüfer. Bewerte die folgende Planungsaufgabe.
Der Benutzer sollte Leistungsbedarf, Ströme, Sicherungen und Querschnitte für verschiedene Geräte berechnen.
Vergleiche die Benutzereingaben mit den korrekten Lösungen. Gib für jeden Fehler einen kurzen, fachlichen Kommentar, warum der Wert falsch ist (z.B. "Sicherung zu klein für den Anlaufstrom" oder "Querschnitt zu gering, Spannungsfall zu hoch").
Sei streng, aber fair. Auch kleine Abweichungen können in der Praxis relevant sein.
Verwende eine Toleranz von ca. 5-10% bei den Berechnungen.

**Aufgabenstellung:** ${scenario.description}
**Geräte-Daten:** ${JSON.stringify(scenario.devices, null, 2)}
**Benutzereingaben:** ${JSON.stringify(userCalculations, null, 2)}
**Korrekte Lösungen:** ${JSON.stringify(scenario.correctSolutions, null, 2)}

Gib dein Feedback als JSON-Objekt zurück, das dem Schema entspricht. Fasse alle Fehler und korrekten Werte im 'lineFeedback'-Array zusammen.
`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: PLANNING_FEEDBACK_SCHEMA,
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as PlanningFeedback;
    } catch (error) {
        if (error instanceof Error && error.message.includes('RESOURCE_EXHAUSTED')) {
            console.warn("Gemini API quota exceeded. Could not get planning feedback.");
            throw new Error("API-Limit erreicht. Feedback konnte nicht generiert werden.");
        }
        console.error("Error getting planning feedback:", error);
        throw new Error("KI-Feedback konnte nicht generiert werden.");
    }
};



// --- New AI Mentor Features ---

const DAILY_TIP_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING },
        content: { type: Type.STRING }
    },
    required: ["title", "content"]
};

export const generateDailyTip = async (skillData: Record<SkillCategory, number>): Promise<DailyTip> => {
    if (!API_KEY) {
         return { title: "Tipp des Tages", content: "Denke immer an die 5 Sicherheitsregeln. Deine Sicherheit ist das Wichtigste!" };
    }
    
    const prompt = `Du bist Meister-Bot, ein KI-Mentor für Elektriker. Basierend auf dem Fähigkeitsprofil des Nutzers (XP-Punkte pro Kategorie), erstelle einen kurzen, motivierenden "Tipp des Tages" auf Deutsch. Der Tipp sollte sich auf eine der schwächeren Kategorien beziehen, um den Nutzer zu fördern. Das Profil: ${JSON.stringify(skillData)}. Gib nur ein JSON-Objekt zurück.`;

    try {
         const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: DAILY_TIP_SCHEMA,
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as DailyTip;
    } catch (error) {
        if (error instanceof Error && error.message.includes('RESOURCE_EXHAUSTED')) {
            console.warn("Gemini API quota exceeded. Providing a fallback daily tip.");
        } else {
            console.error("Error generating daily tip:", error);
        }
        return { title: "Tipp des Tages", content: "Denke immer an die 5 Sicherheitsregeln. Deine Sicherheit ist das Wichtigste!" };
    }
};

const JOB_ANALYSIS_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        summary: { type: Type.STRING, description: "Eine kurze Zusammenfassung des Matches in 1-2 Sätzen." },
        strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Eine Liste von 2-3 Fähigkeiten des Nutzers, die gut zur Stelle passen." },
        areasForImprovement: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Eine Liste von 2-3 Bereichen, in denen der Nutzer sich für diese Stelle verbessern könnte." }
    },
    required: ["summary", "strengths", "areasForImprovement"]
};

export const analyzeJobMatch = async (job: Job, skillData: Record<SkillCategory, number>): Promise<JobAnalysis> => {
    if (!API_KEY) throw new Error("API key not configured.");

    const prompt = `Du bist ein Karriereberater für deutsche Elektriker. Analysiere das folgende Jobangebot im Abgleich mit dem Fähigkeitsprofil des Nutzers.
Jobbeschreibung: "${job.title} - ${job.description}"
Fähigkeitsprofil (XP-Punkte): ${JSON.stringify(skillData)}
Erstelle eine kurze, prägnante Analyse auf Deutsch. Gib nur ein JSON-Objekt zurück.`;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: JOB_ANALYSIS_SCHEMA,
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as JobAnalysis;
    } catch (error) {
        if (error instanceof Error && error.message.includes('RESOURCE_EXHAUSTED')) {
            console.warn("Gemini API quota exceeded. Could not analyze job match.");
            throw new Error("API-Limit erreicht. Job-Analyse konnte nicht durchgeführt werden.");
        }
        console.error("Error analyzing job match:", error);
        throw new Error("Job-Analyse konnte nicht durchgeführt werden.");
    }
};


export const getAevoFeedback = async (chatHistory: string): Promise<AevoFeedback> => {
    if (!API_KEY) throw new Error("API key not configured.");
    
    const prompt = `Du bist ein erfahrener IHK-Prüfer für die AEVO-Prüfung. Analysiere den folgenden Chatverlauf einer simulierten Unterweisung zwischen einem Ausbilder (user) und einem Azubi (bot).
Gib eine detaillierte, strukturierte Rückmeldung auf Deutsch.
Bewerte die folgenden Punkte auf einer Skala von 0-100 und gib auch einen Text-Feedback:
1.  **Sicherheit**: Wurden die 5 Sicherheitsregeln korrekt und rechtzeitig angewendet? (safety)
2.  **Fachliche Korrektheit**: Waren die Anweisungen technisch richtig? (technical)
3.  **Didaktik**: War die Erklärung klar, verständlich und schrittweise aufgebaut? (didactic)
4.  **Umgang/Kommunikation**: War der Ton geduldig und motivierend? (communication)
Gib eine finale Text-Zusammenfassung (feedbackText).
Der Chatverlauf:
${chatHistory}
---
Gib das Ergebnis als JSON-Objekt zurück.`;

    const AEVO_FEEDBACK_SCHEMA = {
        type: Type.OBJECT,
        properties: {
            feedbackText: { type: Type.STRING },
            scores: {
                type: Type.OBJECT,
                properties: {
                    safety: { type: Type.NUMBER },
                    technical: { type: Type.NUMBER },
                    didactic: { type: Type.NUMBER },
                    communication: { type: Type.NUMBER },
                },
                required: ["safety", "technical", "didactic", "communication"]
            }
        },
        required: ["feedbackText", "scores"]
    };

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: AEVO_FEEDBACK_SCHEMA,
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as AevoFeedback;
    } catch (error) {
        if (error instanceof Error && error.message.includes('RESOURCE_EXHAUSTED')) {
            console.warn("Gemini API quota exceeded. Could not get AEVO feedback.");
            throw new Error("API-Limit erreicht. KI-Feedback konnte nicht generiert werden.");
        }
        console.error("Error getting AEVO feedback:", error);
        throw new Error("KI-Feedback konnte nicht generiert werden.");
    }
};

const TROUBLESHOOTING_SCENARIO_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING },
    title: { type: Type.STRING },
    description: { type: Type.STRING },
    possibleFaults: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          description: { type: Type.STRING },
          component: { type: Type.STRING },
        },
        required: ["id", "description", "component"]
      }
    },
    fault: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING },
        description: { type: Type.STRING },
        component: { type: Type.STRING },
      },
      required: ["id", "description", "component"]
    },
    readings: {
      type: Type.OBJECT,
      properties: {
        voltage: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              key: { type: Type.STRING },
              value: { type: Type.NUMBER },
            },
            required: ["key", "value"]
          }
        },
        resistance: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              key: { type: Type.STRING },
              value: { type: Type.NUMBER },
            },
            required: ["key", "value"]
          }
        },
      },
      required: ["voltage", "resistance"]
    },
  },
  required: ["id", "title", "description", "possibleFaults", "fault", "readings"]
};

export const generateTroubleshootingScenario = async (): Promise<TroubleshootingScenario> => {
    if (!API_KEY) {
        throw new Error("API key not configured.");
    }

    const prompt = `Du bist ein deutscher Elektromeister und erstellst eine Prüfungsaufgabe zur Fehlersuche.
Das Szenario basiert auf einer einfachen Schützschaltung für einen Motor mit den folgenden Messpunkten: L1_in, F1_in, F1_out, K1_A1, K1_A2, M1_U, M1_W.
Der Neutralleiter ist an K1_A2 und M1_W angeschlossen.

Deine Aufgabe:
1.  Erfinde einen einzelnen, realistischen Fehler in dieser Schaltung (z.B. "Sicherung F1 defekt", "Spule von Schütz K1 hat Unterbrechung", "Ader von F1 nach K1 unterbrochen").
2.  Erstelle eine Liste von 3 plausiblen "möglichen Fehlern", wovon einer der tatsächliche Fehler ist.
3.  Simuliere die Messwerte (Spannung gegen N und Widerstand zwischen Punkten), die ein Prüfling bei diesem Fehler messen würde.
    - Spannung: 230V wenn Spannung anliegt, 0V wenn nicht.
    - Widerstand: Kleine Werte für durchgehende Verbindungen, sehr hohe Werte (z.B. 9999999) für Unterbrechungen. Spule K1 hat ca. 200-500 Ohm.
4.  Gib das Ergebnis als JSON-Objekt zurück, das dem Schema entspricht.
    - Die 'possibleFaults' müssen den echten Fehler enthalten.
    - 'fault' ist der tatsächliche Fehler.
    - Die 'key' für Messungen zwischen zwei Punkten sollte alphabetisch sortiert sein, z.B. 'F1_in-L1_in'.
    - Berücksichtige alle sinnvollen Messkombinationen.

Beispiel für einen Fehler: "Spule von Schütz K1 hat Unterbrechung".
- Spannung an K1_A1 wäre 230V. Spannung an M1_U wäre 0V.
- Widerstand zwischen K1_A1 und K1_A2 wäre unendlich (OL).
`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: TROUBLESHOOTING_SCENARIO_SCHEMA,
            },
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as TroubleshootingScenario;
    } catch (error) {
        console.error("Error generating troubleshooting scenario:", error);
        throw new Error("KI-Szenario für Fehlersuche konnte nicht generiert werden.");
    }
};
