export enum SessionContextType {
  client = 'client',
  global = 'global',
}

export const sessionContextTypeDictionary = {
  [SessionContextType.client]: 'enums.session_context_type.client',
  [SessionContextType.global]: 'enums.session_context_type.global',
} as const satisfies Record<SessionContextType, string>;
