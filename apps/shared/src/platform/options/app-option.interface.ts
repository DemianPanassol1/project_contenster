export interface AppOption<TValue extends string | number = number> {
  label: string;
  value: TValue;
  disabled: boolean | null;
  metadata: Record<string, unknown> | null;
}
