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
  'submit .new-variable-form'(event) {
    event.preventDefault();
    console.log(event.target.title.value);

    const variable = {
      title: event.target.title.value,
      name: event.target.name.value,
      lastValue: 0
    };

    Meteor.call('variables.insert', variable);

    event.target.title.value = '';
    event.target.name.value = '';
  }
});