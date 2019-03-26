import { Restivus } from 'meteor/nimble:restivus';
import { Mongo } from 'meteor/mongo';
import { Variables } from './variables';

const Api = new Restivus({
  useDefaultAuth: false,
  prettyJson: true
});

Api.addRoute('variables/:id', {
  get: function() {
    const variableId = new Mongo.ObjectID(this.urlParams.id);
    return Variables.findOne(variableId).currentValue;
  },
  post: function() {
    const variableId = new Mongo.ObjectID(this.urlParams.id);
    const newValue = this.bodyParams.value;
    Variables.update(variableId, { $set: { currentValue: newValue } });
    return { status: 'success' };
  }
});
