import auth from './auth/en.json';
import protectedMessages from './protected/en.json';
import publicMessages from './public/en.json';

const messages = {
  public: publicMessages,
  auth,
  protected: protectedMessages,
};

export default messages;
