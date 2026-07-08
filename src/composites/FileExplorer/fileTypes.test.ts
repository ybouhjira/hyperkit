import { describe, it, expect } from 'vitest';
import { getFileType } from './fileTypes';

describe('getFileType', () => {
  describe('directories', () => {
    it('returns folder type for directories', () => {
      const result = getFileType('src', true);
      expect(result.category).toBe('folder');
      expect(result.color).toBe('#60A5FA');
      expect(result.label).toBe('Folder');
    });

    it('returns folder type regardless of name when isDirectory is true', () => {
      const result = getFileType('README.md', true);
      expect(result.category).toBe('folder');
    });
  });

  describe('code files', () => {
    it('returns code type for .ts files', () => {
      const result = getFileType('index.ts', false);
      expect(result.category).toBe('code');
      expect(result.color).toBe('#3178C6');
      expect(result.label).toBe('TypeScript');
    });

    it('returns code type for .tsx files', () => {
      const result = getFileType('App.tsx', false);
      expect(result.category).toBe('code');
      expect(result.label).toBe('TypeScript React');
    });

    it('returns code type for .js files', () => {
      const result = getFileType('main.js', false);
      expect(result.category).toBe('code');
      expect(result.color).toBe('#F7DF1E');
      expect(result.label).toBe('JavaScript');
    });

    it('returns code type for .py files', () => {
      const result = getFileType('script.py', false);
      expect(result.category).toBe('code');
      expect(result.color).toBe('#3776AB');
      expect(result.label).toBe('Python');
    });

    it('returns code type for .rs files', () => {
      const result = getFileType('main.rs', false);
      expect(result.category).toBe('code');
      expect(result.label).toBe('Rust');
    });

    it('returns code type for .go files', () => {
      const result = getFileType('main.go', false);
      expect(result.category).toBe('code');
      expect(result.label).toBe('Go');
    });

    it('returns code type for .java files', () => {
      const result = getFileType('Main.java', false);
      expect(result.category).toBe('code');
      expect(result.label).toBe('Java');
    });
  });

  describe('config files', () => {
    it('returns config type for .json files', () => {
      const result = getFileType('package.json', false);
      expect(result.category).toBe('config');
      expect(result.label).toBe('JSON');
    });

    it('returns config type for .yaml files', () => {
      const result = getFileType('docker-compose.yaml', false);
      expect(result.category).toBe('config');
      expect(result.label).toBe('YAML');
    });

    it('returns config type for .yml files', () => {
      const result = getFileType('.github.yml', false);
      expect(result.category).toBe('config');
      expect(result.label).toBe('YAML');
    });

    it('returns config type for .toml files', () => {
      const result = getFileType('Cargo.toml', false);
      expect(result.category).toBe('config');
      expect(result.label).toBe('TOML');
    });
  });

  describe('document files', () => {
    it('returns document type for .md files', () => {
      const result = getFileType('README.md', false);
      expect(result.category).toBe('document');
      expect(result.label).toBe('Markdown');
    });

    it('returns document type for .txt files', () => {
      const result = getFileType('notes.txt', false);
      expect(result.category).toBe('document');
      expect(result.label).toBe('Text');
    });

    it('returns document type for .pdf files', () => {
      const result = getFileType('report.pdf', false);
      expect(result.category).toBe('document');
      expect(result.label).toBe('PDF');
    });
  });

  describe('image files', () => {
    it('returns image type for .png files', () => {
      const result = getFileType('logo.png', false);
      expect(result.category).toBe('image');
      expect(result.label).toBe('PNG');
    });

    it('returns image type for .svg files', () => {
      const result = getFileType('icon.svg', false);
      expect(result.category).toBe('image');
      expect(result.color).toBe('#FFB13B');
      expect(result.label).toBe('SVG');
    });
  });

  describe('video files', () => {
    it('returns video type for .mp4 files', () => {
      const result = getFileType('video.mp4', false);
      expect(result.category).toBe('video');
      expect(result.label).toBe('MP4');
    });
  });

  describe('audio files', () => {
    it('returns audio type for .mp3 files', () => {
      const result = getFileType('song.mp3', false);
      expect(result.category).toBe('audio');
      expect(result.label).toBe('MP3');
    });
  });

  describe('archive files', () => {
    it('returns archive type for .zip files', () => {
      const result = getFileType('project.zip', false);
      expect(result.category).toBe('archive');
      expect(result.label).toBe('ZIP');
    });

    it('returns archive type for .gz files', () => {
      const result = getFileType('archive.tar.gz', false);
      expect(result.category).toBe('archive');
      expect(result.label).toBe('GZIP');
    });
  });

  describe('unknown files', () => {
    it('returns unknown type for unrecognized extensions', () => {
      const result = getFileType('file.xyz', false);
      expect(result.category).toBe('unknown');
      expect(result.color).toBe('#6B7280');
      expect(result.label).toBe('File');
    });

    it('returns unknown type for files without extension', () => {
      const result = getFileType('Makefile', false);
      expect(result.category).toBe('unknown');
    });
  });

  describe('case insensitivity', () => {
    it('handles uppercase extensions', () => {
      const result = getFileType('index.TS', false);
      expect(result.category).toBe('code');
      expect(result.label).toBe('TypeScript');
    });

    it('handles mixed case extensions', () => {
      const result = getFileType('image.PNG', false);
      expect(result.category).toBe('image');
      expect(result.label).toBe('PNG');
    });

    it('handles .Js extension', () => {
      const result = getFileType('script.Js', false);
      expect(result.category).toBe('code');
      expect(result.label).toBe('JavaScript');
    });
  });
});
