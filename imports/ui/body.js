import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import { Variables } from '../api/variables';

import './body.html';
import './variable.js';

Template.body.onCreated(function bodyOnCreated() {
  Meteor.subscribe('variables');
  Meteor.subscribe('users');
});

Template.body.helpers({
  userApiToken() {
    return Meteor.user().apiToken;
  },
  variables() {
    return Variables.find({});
  }
});

Template.body.events({
  'submit .new-variable'(event) {
    event.preventDefault();

    const variable = {
      name: event.target.name.value
    };
    if (event.target.value.value !== '') {
      variable.lastValue = Number(event.target.value.value);
    }

    Meteor.call('variables.insert', variable);
  }
});