export interface EmailMessage {
  to: string;
  subject: string;
  htmlBody: string;
  textBody: string;
}

export interface EmailPort {
  sendEmail(message: EmailMessage): Promise<{ success: boolean; messageId: string }>;
}

export class SyntheticEmailAdapter implements EmailPort {
  public sentMessages: EmailMessage[] = [];

  async sendEmail(message: EmailMessage): Promise<{ success: boolean; messageId: string }> {
    this.sentMessages.push(message);
    console.log(`[SyntheticEmailAdapter] Dispatched invitation to ${message.to} | Subject: "${message.subject}"`);
    return {
      success: true,
      messageId: `synth_msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    };
  }
}
