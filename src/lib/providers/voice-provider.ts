import {
  VoiceCallRequest,
  VoiceIntent,
  VoiceProvider,
} from "@/src/types/recovery";

export class DemoVoiceProvider implements VoiceProvider {
  async initiateCall(
    req: VoiceCallRequest
  ): Promise<{ sessionId: string; status: "connected" | "completed" }> {
    const sessionId = `vses_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    return {
      sessionId,
      status: "connected",
    };
  }

  async detectIntent(transcriptText: string): Promise<VoiceIntent> {
    const text = transcriptText.toLowerCase();

    if (
      text.includes("abhi") ||
      text.includes("pay now") ||
      text.includes("karta hoon") ||
      text.includes("link bhej") ||
      text.includes("upi")
    ) {
      return "PAY_NOW";
    }

    if (
      text.includes("kal") ||
      text.includes("shaam") ||
      text.includes("later") ||
      text.includes("parso") ||
      text.includes("baad") ||
      text.includes("tomorrow") ||
      text.includes("salary")
    ) {
      return "TRY_LATER";
    }

    if (text.includes("help") || text.includes("fail") || text.includes("dikkat") || text.includes("problem")) {
      return "NEEDS_HELP";
    }

    if (text.includes("cancel") || text.includes("nahi chahiye") || text.includes("decline") || text.includes("band")) {
      return "DECLINE";
    }

    if (text.includes("wrong number") || text.includes("galat number")) {
      return "WRONG_NUMBER";
    }

    if (text.includes("agent") || text.includes("manager") || text.includes("executive") || text.includes("insan")) {
      return "HUMAN_AGENT";
    }

    return "TRY_LATER";
  }
}

export const defaultVoiceProvider = new DemoVoiceProvider();
