import DirectoryLoader from './utils/DirectoryLoader';

export default function directoryLoader(
  ...segments: string[]
): DirectoryLoader {
  return new DirectoryLoader(segments);
}
