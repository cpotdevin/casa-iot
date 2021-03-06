import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check, Match } from 'meteor/check';
import { moment } from 'meteor/momentjs:moment';
import { Values } from './values';

export const Variables = new Mongo.Collection('variables');

if (Meteor.isServer) {
  Meteor.publish('variables', function variablesPublication() {
    if (!this.userId) {
      return Variables.find({}, {sort: {owner: -1}});
    } else {
      return Variables.find({ owner: this.userId });
    }
  });
}

Meteor.methods({
  'variables.insert'(variable) {
    check(variable, {
      title: String,
      name: String,
      lastValue: Number
    });

    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    if (variable.name === '') {
      throw new Meteor.Error('variable-must-have-non-empty-name');
    }
    const searchedVariable = Variables.find({ name: variable.name, owner: this.userId }).fetch();
    if (0 < searchedVariable.length) {
      throw new Meteor.Error('variable-already-exists');
    }

    variable.owner = Meteor.userId();
    variable.createdAt = moment().unix();
    variable.editable = false;

    Variables.insert(variable);
  },
  'variables.update-title'(variableId, title) {
    check(variableId, String);
    check(title, String);
    const testVar = Variables.find({ _id: variableId, owner: this.userId }).fetch();
    if (testVar.length === 0) {
      throw new Meteor.Error('variable-does-not-exist');
    }

    Variables.update(variableId, { $set: { title: title } });
  },
  'variables.update-value'(variableId, value) {
    check(variableId, String);
    check(value, Number);
    const testVar = Variables.find({ _id: variableId }).fetch();
    if (testVar.length === 0) {
      throw new Meteor.Error('variable-does-not-exist');
    }

    Variables.update(variableId, { $set: { lastValue: value } });

    const newValue = {
      variableId: variableId,
      value: value,
      timestamp: moment().unix()
    };
    Values.insert(newValue);
  },
  'variables.set-editable'(variableId) {
    check(variableId, String);

    const variable = Variables.find({ _id: variableId, owner: this.userId }).fetch()[0];

    Variables.update(variableId, {$set: { editable: !variable.editable } });
  },
  'variables.remove'(variableId) {
    check(variableId, String);

    const variable = Variables.find({ _id: variableId, owner: this.userId }).fetch();
    if (variable.length === 0) {
      throw new Meteor.Error('variable-does-not-exist');
    }

    Values.remove({ variableId: variableId });
    Variables.remove(variableId);
  }
})