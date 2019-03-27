import { Meteor } from 'meteor/meteor';

import '../imports/api/variables';
import '../imports/api/values';
import '../imports/api/rest';
import '../imports/startup/accounts-config';

Meteor.publish('users', function() {
  return Meteor.users.find({}, { fields: { email: true, apiToken: true } });
});
