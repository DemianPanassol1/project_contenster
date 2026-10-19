export enum FileType {
  image = 'imagem',
  video = 'video',
  icon = 'icone',
  file = 'arquivo',
}

export const fileTypeDictionary = {
  [FileType.image]: 'enums.file_type.image',
  [FileType.video]: 'enums.file_type.video',
  [FileType.icon]: 'enums.file_type.icon',
  [FileType.file]: 'enums.file_type.file',
} as const satisfies Record<FileType, string>;
