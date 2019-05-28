import './variable.html';

Template.variable.helpers({
  lastValue() {
    if (this.lastValue === undefined) {
      return 'None';
    } else {
      return this.lastValue
    }
  }
});

Template.variable.events({
  'submit .update-variable-title'(event) {
    event.preventDefault();
    Meteor.call('variables.update-title', this._id, event.target.title.value);
    event.target.title.value = '';
  },
  'submit .update-variable-value'(event) {
    event.preventDefault();
    Meteor.call('variables.update-value', this._id, Number(event.target.value.value));
    event.target.value.value = '';
  },
  'click .toggle-editable'(event) {
    event.preventDefault();
    Meteor.call('variables.set-editable', this._id);
  },
  'click .delete'(event) {
    event.preventDefault();
    Meteor.call('variables.remove', this._id);
  }
});