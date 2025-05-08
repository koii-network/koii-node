declare module 'detect-port' {
  type Callback = (err: Error | null, availablePort: number) => void;

  interface PortObj {
    hostname: string;
    callback: Callback;
    port: number;
  }

  export default function (
    port?: number | PortObj | Callback,
    callback?: Callback
  ): Promise<number>;
}
