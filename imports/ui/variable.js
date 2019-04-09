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
  'submit .update-variable'(event) {
    event.preventDefault();

    Meteor.call('variables.update', this._id, Number(event.target.value.value));

    event.target.value.value = '';
  }
});