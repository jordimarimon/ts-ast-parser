type StringAlias = string;

// Due to "type interning", we won't be able to get the Type alias
// See: https://github.com/microsoft/TypeScript/issues/28197#issuecomment-434027046
export const name: StringAlias = 'John Doe';
