import { Meteor } from 'meteor/meteor';
import net from 'net';
import { moment } from 'meteor/momentjs:moment';

import { Variables } from './variables';
import { Values } from './values';

const HOST = '0.0.0.0';
const PORT = 9012;

const handleTCPConnection = Meteor.bindEnvironment(function(socket) {
  socket.setEncoding('utf8');

  socket.on('data', Meteor.bindEnvironment(function(command) {
    if (command.endsWith('\n')) {
      command = command.substring(0, command.length - 1);
    }

    try {
      if (!command.endsWith('end')) {
        throw Error('Does not end with "end"');
      }
      const statements = command.split('|');
      switch (statements[0]) {
        case 'GET':
          socket.write(manageGET(statements));
          break;
        case 'POST':
          socket.write(managePOST(statements));
          break;
        default:
          throw Error('Incorrectly formatted command');
      }
    } catch (error) {
      socket.write('ERROR');
    }
    socket.end();
  }));

  socket.on('end', socket.end);
});

const manageGET = Meteor.bindEnvironment(function(statements) {
  const apiToken = statements[1];
  const user = Meteor.users.findOne({ apiToken: apiToken });
  if (!user) {
    return 'ERROR';
  }

  const names = statements[2].split(',');
  let response = 'OK';
  for (let i = 0; i < names.length; i++) {
    const variable = Variables.findOne({ owner: user._id, name: names[i] });
    if (!variable) {
      return 'ERROR';
    }
    response += ` ${variable.lastValue}`;
  }
  return response;
});

const managePOST = Meteor.bindEnvironment(function(statements) {
  const apiToken = statements[1];
  const user = Meteor.users.findOne({ apiToken: apiToken });
  if (!user) {
    return 'ERROR';
  }

  const variables = statements[2].split(',');
  for (let i = 0; i < variables.length; i++) {
    variables[i] = variables[i].trim();
    const [name, valueString] = variables[i].split(':');
    const value = Number(valueString);
    let variable = Variables.findOne({ owner: user._id, name: name });

    if (variable) {
      Variables.update(variable._id, { $set: { lastValue: value } });
    } else {
      const variable = {
        name: name,
        owner: user._id,
        createdAt: moment().unix(),
        lastValue: value
      };
      variable._id = Variables.insert(variable);
    }
    const newValue = {
      variableId: variable._id,
      value: value,
      timestamp: moment().unix()
    };
    Values.insert(newValue);
  }
  return 'OK';
});

net.createServer(handleTCPConnection).listen(PORT, HOST);