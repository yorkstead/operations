export interface QueueMessage<T> {
  id: string;
  type: string;
  payload: T;
  occurredAt: string;
}

export interface Queue {
  send<T>(message: QueueMessage<T>, options?: { delaySeconds?: number }): Promise<void>;
}

export class UnconfiguredQueue implements Queue {
  async send<T>(message: QueueMessage<T>): Promise<void> {
    void message;
    throw new Error("Asynchronous queue dispatch is not configured.");
  }
}
