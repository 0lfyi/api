import config from '../config.js';
import Provider from '../modules/0l/Provider.js';

const provider = new Provider(config.providerUrl);

export default provider;
