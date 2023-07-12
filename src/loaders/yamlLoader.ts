import { parse } from 'yaml';
import Loader from '../utils/Loader';

const yamlLoader = new Loader('yml yaml', parse);

export default yamlLoader;
