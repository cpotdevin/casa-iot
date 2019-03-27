import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import { Variables } from '../api/variables';

import './body.html';
import './variable.js';

Template.body.helpers({
  userApiToken() {
    return Meteor.user().apiToken;
  },
  variables() {
    return Variables.find({});
  }
})