import auth from './auth/pt.json';
import protectedMessages from './protected/pt.json';
import publicMessages from './public/pt.json';
import sharedMessages from './shared/pt.json';

const messages = {
  ...sharedMessages,
  public: publicMessages,
  auth,
  protected: protectedMessages,
};

export default messages;
