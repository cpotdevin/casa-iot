import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check, Match } from 'meteor/check';
import { moment } from 'meteor/momentjs:moment';
import { Values } from './values';

export const Variables = new Mongo.Collection('variables');

if (Meteor.isServer) {
  Meteor.publish('variables', function variablesPublication() {
    return Variables.find({ owner: this.userId });
  });
}

Meteor.methods({
  'variables.insert'(variable) {
    check(variable, {
      name: String,
      lastValue: Match.Maybe(Number)
    });

    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    const testVar = Variables.find({ name: variable.name, owner: this.userId }).fetch();
    if (0 < testVar.length) {
      throw new Meteor.Error('variable-already-exists');
    }

    variable.owner = Meteor.userId();
    variable.createdAt = moment().unix();

    Variables.insert(variable);
  },
  'variables.update'(variableId, value) {
    check(variableId, String);
    check(value, Number);
    const testVar = Variables.find({ _id: variableId, owner: this.userId }).fetch();
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
  'variables.remove'(variableId) {
    check(variableId, String);

    const testVar = Variables.find({ _id: variableId, owner: this.userId }).fetch();
    console.log(testVar);
    if (testVar.length === 0) {
      throw new Meteor.Error('variable-does-not-exist');
    }

    Values.remove({ variableId: variableId });
    Variables.remove(variableId);
  }
})