import auth from './auth/es.json';
import protectedMessages from './protected/es.json';
import publicMessages from './public/es.json';

const messages = {
  public: publicMessages,
  auth,
  protected: protectedMessages,
};

export default messages;
