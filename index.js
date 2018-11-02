const processDancer = require('./src/processDancer');

const dancers = ['bear', 'cat', 'dog', 'duck', 'frog', 'moose', 'robot', 'unicorn'];
Promise.all(dancers.map(processDancer));
