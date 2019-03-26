import { Template } from 'meteor/templating';

import { Variables } from '../api/variables';

import './body.html';
import './variable.js';

Template.body.helpers({
  variables() {
    return Variables.find({});
  }
})