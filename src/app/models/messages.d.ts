export interface IMessage {
  id: string;
  name: string;
  message: string;
  createdAt: TMessageTimestamp;
}

export type TMessageTimestamp = {
  seconds: number;
  nanoseconds: number;
};
