import { convertPathToPattern } from 'fast-glob';
import path from 'path';

export default function resolve(...segments: string[]): string {
  return convertPathToPattern(path.resolve(...segments));
}
