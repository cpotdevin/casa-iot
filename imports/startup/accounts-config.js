import { Accounts } from 'meteor/accounts-base';
import crypto from 'crypto';


Accounts.onCreateUser((options, user) => {
  if (!user.emails[0].address.endsWith('@uniandes.edu.co')) {
    throw new Meteor.Error('Must be Uniandes email');
  }

  user.apiToken = crypto.randomBytes(16).toString('hex');

  return user;
});
