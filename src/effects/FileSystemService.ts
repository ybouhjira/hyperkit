import { Context, Effect } from 'effect';
import type { FileSystemError, DirectoryNotFoundError } from './errors';

export interface FileEntry {
  readonly name: string;
  readonly path: string;
  readonly isDirectory: boolean;
  readonly size?: number;
  readonly modifiedAt?: Date;
}

export interface FileSystemService {
  readonly listDirectory: (
    path: string
  ) => Effect.Effect<ReadonlyArray<FileEntry>, FileSystemError | DirectoryNotFoundError>;
  readonly getParentDirectory: (path: string) => Effect.Effect<string>;
  readonly isDirectory: (path: string) => Effect.Effect<boolean, FileSystemError>;
}

export const FileSystemService = Context.GenericTag<FileSystemService>('FileSystemService');
