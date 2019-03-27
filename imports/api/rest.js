import { Meteor } from 'meteor/meteor';
import { Restivus } from 'meteor/nimble:restivus';
import { moment } from 'meteor/momentjs:moment';

import { Variables } from './variables';
import { Values } from './values';

const Api = new Restivus({
  useDefaultAuth: false,
  prettyJson: true
});

/*
checkUser, checkVariable and checkVariableOwner are written in a middleware function style.
If these don't find an error and therefore respond to the httpRequest, then they call next.
*/
function checkUser(httpRequest, next) {
  const apiToken = httpRequest.request.headers['x-auth-token'];
  if (!apiToken) {
    return {
      statusCode: 401,
      body: { status: 'fail', message: 'Not authenticated' }
    };
  }

  const user = Meteor.users.findOne({ apiToken: apiToken });
  const data = { user: user };
  return next(httpRequest, data);
};

function checkVariable(httpRequest, next) {
  return checkUser(httpRequest, function(httpRequest, { user }) {
    const variable = Variables.findOne({ _id: httpRequest.urlParams.id });
    if (!variable) {
      return {
        statusCode: 404,
        body: { status: 'fail', message: 'Variable not found'}
      }
    }

    const data = { user: user, variable: variable };
    return next(httpRequest, data);
  });
};

function checkVariableOwner(httpRequest, next) {
  return checkVariable(httpRequest, function(httpRequest, { user, variable }) {
    if (user._id === variable.owner) {
      const data = { user: user, variable: variable };
      return next(httpRequest, data);
    } else {
      return {
        statusCode: 403,
        body: { status: 'fail', message: 'Not authorized' }
      };
    }
  });
};

// REST API route definitions
Api.addRoute('variables', {
  get: function() {
    return checkUser(this, function(httpRequest, { user }) {
      const variables = Variables.find({ owner: user._id }).fetch();
      return variables;
    });
  },
  post: function() {
    return checkUser(this, function(httpRequest, { user }) {
      const name = httpRequest.bodyParams.name;
      const createdAt = moment().unix();
      Variables.insert({ name: name, owner: user._id, createdAt: createdAt, lastValue: null });
      return { statusCode: 200 };
    });
  }
});

Api.addRoute('variable/:id', {
  get: function() {
    return checkVariableOwner(this, function(httpRequest, { variable }) {
      return {
        statusCode: 200 ,
        body: variable
      };
    });
  }
});

Api.addRoute('variable/:id/values', {
  get: function() {
    return checkVariableOwner(this, function(httpRequest, { variable }) {
      const values = Values.find({ variableId: variable._id }, { sort: { timestamp: -1}, limit: 10 }).fetch();
      return values;
    });
  },
  post: function() {
    return checkVariableOwner(this, function(httpRequest, { variable }) {
      Variables.update(variable._id, { $set: { lastValue: httpRequest.bodyParams.value } });
      const timestamp = httpRequest.bodyParams.timestamp || moment().unix();
      Values.insert({ variableId: variable._id, value: httpRequest.bodyParams.value, timestamp: timestamp });
      return {
        statusCode: 200 ,
        body: { status: 'success' }
      };
    });
  }
});
