import { CommunicationMessage, CommunicationProvider } from "@/src/types/recovery";

export class DemoCommunicationProvider implements CommunicationProvider {
  async sendMessage(msg: CommunicationMessage): Promise<{ id: string; delivered: boolean }> {
    const id = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    return {
      id,
      delivered: true,
    };
  }
}

export const defaultCommunicationProvider = new DemoCommunicationProvider();
