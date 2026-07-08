# FileSystemService

**Kind:** service | **Category:** Effect Services

## Interface

| Method          | Type | Description |
| --------------- | ---- | ----------- |
| `listDirectory` | `(   |

    path: string

) => Effect.Effect<ReadonlyArray<FileEntry>, FileSystemError | DirectoryNotFoundError>`| - |
|`getParentDirectory`|`(path: string) => Effect.Effect<string>`| - |
|`isDirectory`|`(path: string) => Effect.Effect<boolean, FileSystemError>` | - |

## Import

```ts
import { FileSystemService } from '@ybouhjira/hyperkit';
```

[← Back to Index](../../llms.txt) | [Full API Reference](../../llms-full.txt)
