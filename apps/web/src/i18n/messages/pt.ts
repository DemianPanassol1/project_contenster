import auth from './auth/pt.json';
import protectedMessages from './protected/pt.json';
import publicMessages from './public/pt.json';

const messages = {
  public: publicMessages,
  auth,
  protected: protectedMessages,
};

export default messages;
