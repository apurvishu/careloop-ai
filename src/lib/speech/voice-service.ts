export type VoiceLanguage = "en-US" | "hi-IN" | "kn-IN";

export interface VoiceCommandMatch {
  action:
    | "MEDICATION_NOW"
    | "NEXT_APPOINTMENT"
    | "MEDICATION_HISTORY"
    | "REMIND_LATER"
    | "CARE_ASSISTANCE"
    | "UNKNOWN";
  rawText: string;
}

export class VoiceAssistant {
  private recognition: any = null;
  private isListening: boolean = false;
  private lang: VoiceLanguage = "en-US";

  constructor() {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = this.lang;
      }
    }
  }

  public isSupported(): boolean {
    return !!this.recognition && typeof window !== "undefined" && "speechSynthesis" in window;
  }

  public setLanguage(lang: VoiceLanguage) {
    this.lang = lang;
    if (this.recognition) {
      this.recognition.lang = lang;
    }
  }

  public speak(text: string, onEnd?: () => void): void {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      if (onEnd) onEnd();
      return;
    }

    window.speechSynthesis.cancel(); // Stop any active speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = this.lang;
    utterance.rate = 0.9; // Slightly slower, clear cadence for elderly users
    utterance.pitch = 1.0;
    if (onEnd) {
      utterance.onend = onEnd;
    }
    window.speechSynthesis.speak(utterance);
  }

  public stopSpeaking(): void {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }

  public startListening(
    onResult: (match: VoiceCommandMatch) => void,
    onError: (err: string) => void
  ): void {
    if (!this.recognition) {
      onError("Voice recognition is not supported in this browser.");
      return;
    }

    if (this.isListening) {
      this.recognition.stop();
    }

    this.recognition.onstart = () => {
      this.isListening = true;
    };

    this.recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.toLowerCase().trim();
      const match = this.parseCommand(transcript);
      onResult(match);
    };

    this.recognition.onerror = (event: any) => {
      this.isListening = false;
      onError(event.error || "Speech recognition error");
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };

    try {
      this.recognition.start();
    } catch (e: any) {
      onError(e.message || "Failed to start microphone");
    }
  }

  public stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  public parseCommand(rawText: string): VoiceCommandMatch {
    const text = rawText.toLowerCase();

    if (
      text.includes("what medicine") ||
      text.includes("medicine now") ||
      text.includes("take now") ||
      text.includes("what should i take")
    ) {
      return { action: "MEDICATION_NOW", rawText };
    }

    if (
      text.includes("next appointment") ||
      text.includes("when is my appointment") ||
      text.includes("doctor visit") ||
      text.includes("upcoming appointment")
    ) {
      return { action: "NEXT_APPOINTMENT", rawText };
    }

    if (
      text.includes("medication history") ||
      text.includes("show my medicine") ||
      text.includes("did i take") ||
      text.includes("history")
    ) {
      return { action: "MEDICATION_HISTORY", rawText };
    }

    if (
      text.includes("remind me in") ||
      text.includes("remind me later") ||
      text.includes("snooze") ||
      text.includes("15 minutes")
    ) {
      return { action: "REMIND_LATER", rawText };
    }

    if (
      text.includes("assistance") ||
      text.includes("caregiver") ||
      text.includes("call caregiver") ||
      text.includes("help me") ||
      text.includes("need help")
    ) {
      return { action: "CARE_ASSISTANCE", rawText };
    }

    return { action: "UNKNOWN", rawText };
  }
}

export const voiceAssistant = new VoiceAssistant();
