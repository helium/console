import organization from './organization'
import apollo from './apollo'
import devices from './device';
import display from './display';
import magicUser from './magicUser'
import appConfig from './appConfig'
import acceptedTerms from './acceptedTerms'

const reducers = {
  organization,
  magicUser,
  apollo,
  devices,
  display,
  appConfig,
  acceptedTerms
};

export default reducers;
