import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock Web Speech API in test environments
if (typeof window !== "undefined") {
  (window as any).SpeechRecognition = vi.fn().mockImplementation(() => ({
    start: vi.fn(),
    stop: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));

  (window as any).webkitSpeechRecognition = (window as any).SpeechRecognition;

  (window as any).speechSynthesis = {
    speak: vi.fn(),
    cancel: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    getVoices: vi.fn().mockReturnValue([]),
  };

  (window as any).SpeechSynthesisUtterance = vi.fn().mockImplementation((text) => ({
    text,
    lang: "en-US",
  }));
}
