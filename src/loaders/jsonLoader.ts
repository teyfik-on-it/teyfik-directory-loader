import { parse } from 'jsonc-parser';
import Loader from '../utils/Loader';

const jsonLoader = new Loader('json jsonc', (input) => parse(input));

export default jsonLoader;
