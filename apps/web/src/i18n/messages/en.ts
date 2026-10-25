import auth from './auth/en.json';
import protectedMessages from './protected/en.json';
import publicMessages from './public/en.json';
import sharedMessages from './shared/en.json';

const messages = {
  ...sharedMessages,
  public: publicMessages,
  auth,
  protected: protectedMessages,
};

export default messages;
