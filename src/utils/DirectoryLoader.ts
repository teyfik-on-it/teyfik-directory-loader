import glob from 'fast-glob';
import { readFile } from 'fs/promises';
import {
  chunk,
  get,
  isObject,
  isUndefined,
  lowerCase,
  merge,
  set,
  setWith,
} from 'lodash';
import { extname } from 'path';
import resolve from '../helpers/resolve';
import jsonLoader from '../loaders/jsonLoader';
import yamlLoader from '../loaders/yamlLoader';
import Loader from './Loader';

export default class DirectoryLoader {
  private readonly loaders = new Map<string, Loader>();
  private segments?: string[];
  private maxFileLimit = Infinity;
  private openFilesLimit = Infinity;

  constructor(segments?: string[]) {
    if (segments != null) {
      this.segments = segments;
    }

    this.add(jsonLoader).add(yamlLoader);
  }

  dir(...segments: string[]): this {
    this.segments = segments;

    return this;
  }

  add(loader: Loader): this;
  add(...params: ConstructorParameters<typeof Loader>): this;
  add(loader: Loader | string | string[], parse?: Loader['parse']): this {
    if (loader instanceof Loader) {
      loader.extensions.forEach((extension) =>
        this.loaders.set(extension, loader),
      );

      return this;
    }

    if (isUndefined(parse)) {
      throw new Error('Parser is not defined');
    }

    return this.add(new Loader(loader, parse));
  }

  remove(extension: string): this {
    this.loader(lowerCase(extension)).extensions.forEach((key) =>
      this.loaders.delete(key),
    );

    return this;
  }

  async load(): Promise<object> {
    if (isUndefined(this.segments)) {
      throw new Error('Root directory is not defined');
    }

    if (this.loaders.size === 0) {
      throw new Error('No loader provided');
    }

    const root = resolve(...this.segments);
    const pattern = resolve(root, '**', this.matcher());
    const files = await glob(pattern);
    const contents = await this.loadChunks(root, files);
    const result = contents.reduce((target, [path, right]) => {
      const left = get(target, path);

      if (path.length > 1) {
        const parentPath = path.slice(0, path.length - 1);

        setWith(target, parentPath, get(target, parentPath), Object);
      }

      if (isObject(left)) {
        set(target, path, merge(left, right));
      } else {
        set(target, path, right);
      }

      return target;
    }, {});

    return result;
  }

  openFiles(limit: number): this {
    this.openFilesLimit = limit;

    return this;
  }

  maxFiles(limit: number): this {
    this.maxFileLimit = limit;

    return this;
  }

  private async loadChunks(
    root: string,
    files: string[],
  ): Promise<Array<[string[], unknown]>> {
    let contents = [] as Array<[string[], unknown]>;

    files = files.sort();

    for (const items of chunk(files.sort(), this.openFilesLimit)) {
      const limit = this.maxFileLimit - contents.length;

      if (limit > 0) {
        contents = contents.concat(
          await Promise.all(
            items
              .slice(0, limit)
              .map(async (file) => await this.parse(root, file)),
          ),
        );
      } else {
        break;
      }
    }

    return contents;
  }

  private async parse(
    root: string,
    file: string,
  ): Promise<[string[], unknown]> {
    const extension = lowerCase(extname(file));

    return await readFile(file, 'utf-8')
      .then((content) => this.loader(extension).parse(content))
      .then((result) => [this.path(root, file, extension), result]);
  }

  private path(root: string, file: string, extension: string): string[] {
    return file
      .replace(root, '')
      .slice(1, -(extension.length + 1))
      .replace(/\./g, '\\.')
      .replace(/\//g, '.')
      .split('.');
  }

  private loader(extension: string): Loader {
    const loader = this.loaders.get(extension);

    if (loader == null) {
      throw new Error(`Loader not found for extension "${extension}"`);
    }

    return loader;
  }

  private matcher(): string {
    const items = new Set<string>();

    this.loaders.forEach((loader) => {
      loader.extensions.forEach((extension) => items.add(extension));
    });

    const extensions = Array.from(items.values());

    if (extensions.length === 1) {
      return '*.' + extensions[0];
    }

    const template = extensions.sort().join(',');

    return '*.{' + template + '}';
  }
}
