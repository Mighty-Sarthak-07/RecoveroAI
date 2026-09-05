import {
  VoiceCallRequest,
  VoiceIntent,
  VoiceProvider,
} from "@/src/types/recovery";

export interface VoiceCallStatus {
  sessionId: string;
  status: "initiated" | "connected" | "in_progress" | "completed" | "failed";
  durationSeconds?: number;
  transcript?: string;
}

export class DemoVoiceProvider implements VoiceProvider {
  async initiateCall(
    req: VoiceCallRequest
  ): Promise<{ sessionId: string; status: "connected" | "completed" }> {
    const sessionId = `vses_demo_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    return {
      sessionId,
      status: "connected",
    };
  }

  async getCallStatus(sessionId: string): Promise<VoiceCallStatus> {
    return {
      sessionId,
      status: "completed",
      durationSeconds: 45,
      transcript: "Namaste Rahul ji, main RecoveroAI se bol raha hoon. Aapka ₹2,499 ka payment failure hua tha. Payment link bhej doon?",
    };
  }

  async handleWebhook(payload: any): Promise<{ event: string; sessionId?: string }> {
    return {
      event: payload?.event || "call.completed",
      sessionId: payload?.sessionId || payload?.call?.id,
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

export class VapiVoiceProvider implements VoiceProvider {
  private apiKey: string;
  private phoneNumberId?: string;

  constructor(apiKey: string, phoneNumberId?: string) {
    this.apiKey = apiKey;
    this.phoneNumberId = phoneNumberId || process.env.VAPI_PHONE_NUMBER_ID;
  }

  async initiateCall(
    req: VoiceCallRequest
  ): Promise<{ sessionId: string; status: "connected" | "completed" }> {
    try {
      const response = await fetch("https://api.vapi.ai/call/phone", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumberId: this.phoneNumberId,
          customer: {
            number: req.customerPhone,
            name: req.customerName,
          },
          assistant: {
            firstMessage: `Namaste ${req.customerName || "ji"}, main RecoveroAI se bol raha hoon. Aapka payment update ke silsile mein call kiya hai.`,
            model: {
              provider: "openai",
              model: "gpt-4o-mini",
              messages: [
                {
                  role: "system",
                  content: "You are RecoveroAI's empathetic Hinglish revenue recovery agent. Conduct respectful recovery calls.",
                },
              ],
            },
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Vapi API error: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        sessionId: data.id || `vses_vapi_${Date.now()}`,
        status: "connected",
      };
    } catch (e) {
      console.warn("Vapi call initiation failed, falling back to Demo Voice Provider:", e);
      return new DemoVoiceProvider().initiateCall(req);
    }
  }

  async getCallStatus(sessionId: string): Promise<VoiceCallStatus> {
    try {
      const res = await fetch(`https://api.vapi.ai/call/${sessionId}`, {
        headers: { Authorization: `Bearer ${this.apiKey}` },
      });
      const data = await res.json();
      return {
        sessionId,
        status: data.status === "ended" ? "completed" : "in_progress",
        transcript: data.artifact?.transcript || "",
      };
    } catch {
      return new DemoVoiceProvider().getCallStatus(sessionId);
    }
  }

  async handleWebhook(payload: any): Promise<{ event: string; sessionId?: string }> {
    return {
      event: payload?.message?.type || "call.ended",
      sessionId: payload?.message?.call?.id,
    };
  }

  async detectIntent(transcriptText: string): Promise<VoiceIntent> {
    return new DemoVoiceProvider().detectIntent(transcriptText);
  }
}

export function getVoiceProvider(): VoiceProvider {
  const apiKey = process.env.VAPI_API_KEY;
  if (apiKey && apiKey.trim() !== "" && apiKey !== "your_vapi_api_key") {
    return new VapiVoiceProvider(apiKey);
  }
  return new DemoVoiceProvider();
}

export const defaultVoiceProvider = getVoiceProvider();
