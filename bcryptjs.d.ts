declare module 'bcryptjs' {
  export function compare(data: string, encrypted: string): Promise<boolean>;
  export function compare(data: string, encrypted: string, callback: (err: Error | null, same?: boolean) => void): void;
  export function compareSync(data: string, encrypted: string): boolean;
  export function hash(data: string, saltOrRounds: string | number): Promise<string>;
  export function hash(data: string, saltOrRounds: string | number, callback: (err: Error | null, encrypted?: string) => void): void;
  export function hashSync(data: string, saltOrRounds: string | number): string;
  export function genSalt(rounds?: number): Promise<string>;
  export function genSalt(rounds: number | undefined, callback: (err: Error | null, salt?: string) => void): void;
  export function genSaltSync(rounds?: number): string;
  export function getRounds(encrypted: string): number;
}
