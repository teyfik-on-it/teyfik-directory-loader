import { each, lowerCase } from 'lodash';

type Parser = (input: string) => any | Promise<any>;

export default class Loader {
  readonly extensions: Set<string>;
  readonly parse: Parser;

  constructor(extensions: string | string[], parser: Parser) {
    if (typeof extensions === 'string') {
      extensions = extensions.split(/\s+/);
    }

    this.extensions = new Set(each(extensions, lowerCase));
    this.parse = parser;
  }
}
