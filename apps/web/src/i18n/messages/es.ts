import auth from './auth/es.json';
import protectedMessages from './protected/es.json';
import publicMessages from './public/es.json';
import sharedMessages from './shared/es.json';

const messages = {
  ...sharedMessages,
  public: publicMessages,
  auth,
  protected: protectedMessages,
};

export default messages;
