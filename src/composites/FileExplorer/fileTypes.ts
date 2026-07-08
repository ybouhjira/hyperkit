export type FileCategory =
  'folder' | 'code' | 'config' | 'document' | 'image' | 'video' | 'audio' | 'archive' | 'unknown';

export interface FileTypeInfo {
  category: FileCategory;
  color: string;
  label: string;
}

const FILE_TYPE_MAP: Record<string, FileTypeInfo> = {
  // Code
  ts: { category: 'code', color: '#3178C6', label: 'TypeScript' },
  tsx: { category: 'code', color: '#3178C6', label: 'TypeScript React' },
  js: { category: 'code', color: '#F7DF1E', label: 'JavaScript' },
  jsx: { category: 'code', color: '#F7DF1E', label: 'JavaScript React' },
  py: { category: 'code', color: '#3776AB', label: 'Python' },
  rs: { category: 'code', color: '#DEA584', label: 'Rust' },
  go: { category: 'code', color: '#00ADD8', label: 'Go' },
  java: { category: 'code', color: '#ED8B00', label: 'Java' },
  // Config
  json: { category: 'config', color: '#F5A623', label: 'JSON' },
  toml: { category: 'config', color: '#9C4121', label: 'TOML' },
  yaml: { category: 'config', color: '#CB171E', label: 'YAML' },
  yml: { category: 'config', color: '#CB171E', label: 'YAML' },
  xml: { category: 'config', color: '#E34C26', label: 'XML' },
  // Documents
  md: { category: 'document', color: '#083FA1', label: 'Markdown' },
  txt: { category: 'document', color: '#6B7280', label: 'Text' },
  pdf: { category: 'document', color: '#FF0000', label: 'PDF' },
  doc: { category: 'document', color: '#2B579A', label: 'Word' },
  docx: { category: 'document', color: '#2B579A', label: 'Word' },
  // Images
  png: { category: 'image', color: '#8B5CF6', label: 'PNG' },
  jpg: { category: 'image', color: '#8B5CF6', label: 'JPEG' },
  jpeg: { category: 'image', color: '#8B5CF6', label: 'JPEG' },
  gif: { category: 'image', color: '#8B5CF6', label: 'GIF' },
  svg: { category: 'image', color: '#FFB13B', label: 'SVG' },
  webp: { category: 'image', color: '#8B5CF6', label: 'WebP' },
  // Video
  mp4: { category: 'video', color: '#E11D48', label: 'MP4' },
  mov: { category: 'video', color: '#E11D48', label: 'MOV' },
  // Audio
  mp3: { category: 'audio', color: '#22C55E', label: 'MP3' },
  wav: { category: 'audio', color: '#22C55E', label: 'WAV' },
  // Archive
  zip: { category: 'archive', color: '#F59E0B', label: 'ZIP' },
  tar: { category: 'archive', color: '#F59E0B', label: 'TAR' },
  gz: { category: 'archive', color: '#F59E0B', label: 'GZIP' },
};

const FOLDER_TYPE: FileTypeInfo = { category: 'folder', color: '#60A5FA', label: 'Folder' };
const UNKNOWN_TYPE: FileTypeInfo = { category: 'unknown', color: '#6B7280', label: 'File' };

export function getFileType(name: string, isDirectory: boolean): FileTypeInfo {
  if (isDirectory) return FOLDER_TYPE;
  const ext = name.split('.').pop()?.toLowerCase();
  return (ext ? FILE_TYPE_MAP[ext] : undefined) ?? UNKNOWN_TYPE;
}
