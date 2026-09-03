import { describe, it, expect } from "vitest";
import { VoiceRecoveryWorkflow } from "../workflows/voice-recovery-workflow";
import { defaultVoiceProvider } from "../providers/voice-provider";

describe("Hinglish Voice Recovery Workflow", () => {
  const workflow = new VoiceRecoveryWorkflow();

  it("accurately classifies colloquial Hinglish intents", async () => {
    const intent1 = await defaultVoiceProvider.detectIntent("Kal subah 10 baje pakka karunga");
    expect(intent1).toBe("TRY_LATER");

    const intent2 = await defaultVoiceProvider.detectIntent("Haan link bhej do abhi pay kar deta hoon");
    expect(intent2).toBe("PAY_NOW");

    const intent3 = await defaultVoiceProvider.detectIntent("Payment baar baar fail ho raha hai help chahiye");
    expect(intent3).toBe("NEEDS_HELP");

    const intent4 = await defaultVoiceProvider.detectIntent("Ye galat number hai wrong number");
    expect(intent4).toBe("WRONG_NUMBER");
  });

  it("routes TRY_LATER intent directly into Promise-to-Pay creation candidate", () => {
    const candidates = workflow.getCandidateActions({
      caseId: "vses_1",
      customerId: "c1",
      amount: 249900,
      language: "HINGLISH",
      customerName: "Rahul",
      customerPhone: "+919876543210",
      customerEmail: "rahul@example.com",
      contactPermission: true,
      detectedIntent: "TRY_LATER",
    });

    const promiseAction = candidates.find((c) => c.action === "CREATE_PROMISE_TO_PAY");
    expect(promiseAction).toBeDefined();
    expect(promiseAction?.retryAfterHours).toBe(24);
  });
});
