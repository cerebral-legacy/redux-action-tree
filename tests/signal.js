const createSignal = require('../src/signal');
const suite = {};

function createDispatcher(cb) {
  return function(payload) {
    cb(payload);
  };
}

function createState(state) {
  return function() {
    return state;
  };
};

function async(cb) {
  setTimeout(cb, 0);
}

suite['should not affect initial payload'] = function(test) {
  const actionA = function(context) {
    context.output({bar: 'foo'});
  };
  actionA.async = true;
  const actionB = function(context) {
    test.deepEqual(context.input, {foo: 'bar', bar: 'foo'});
    test.done();
  };
  const payload = {foo: 'bar'};
  const signal = createSignal([
    actionA,
    actionB
  ]);
  signal(payload)(createDispatcher(), createState());
};

suite['should bring outputs down paths back up'] = function(test) {
  const payload = {foo: 'bar'};
  const actionA = function(context) {
    context.output.success({bar: 'foo'});
  };
  const actionB = function(context) {
    context.output({mip: 'mop'});
  };
  const actionC = function(context) {
    test.deepEqual(context.input, {
      foo: 'bar',
      bar: 'foo',
      mip: 'mop'
    });
    test.done();
  };
  const signal = createSignal([
    actionA, {
      success: [
        actionB
      ]
    },
    actionC
  ]);
  signal(payload)(createDispatcher(), createState());
};

suite['should bring outputs down paths back up on synchronous nesting'] = function(test) {
  const actionA = function(context) {
    context.output.success({foo: 'bar'});
  };
  actionA.outputs = ['success'];
  const actionB = function(context) {
    context.output.success({bar: 'foo'});
  };
  actionB.outputs = ['success'];
  const actionC = function(context) {
    test.deepEqual(context.input, {foo: 'bar', bar: 'foo'});
    test.done();
  };
  const signal = createSignal([
    actionA, {
      success: [
        actionB, {
          success: []
        }
      ]
    },
    actionC
  ]);
  signal()(createDispatcher(), createState());
};

suite['should override payload properties propagated up the signal tree async'] = function(test) {
  const actionA = function(context) {
    context.output.success({foo: 'bar'});
  };
  actionA.async = true;
  actionA.outputs = ['success'];
  const actionB = function(context) {
    context.output.success({foo: 'bar2'});
  };
  actionB.async = true;
  actionB.outputs = ['success'];
  const actionC = function(context) {
    test.deepEqual(context.input, {foo: 'bar2'});
    test.done();
  };
  const signal = createSignal([
    actionA, {
      success: [
        actionB, {
          success: []
        }
      ]
    },
    actionC
  ]);
  signal()(createDispatcher(), createState());
};

suite['should handle async and sync actions outputting payload and propagating up the tree'] = function(test) {
  const actionA = function(context) {
    context.output.success({foo: 'bar'});
  };
  actionA.async = true;
  actionA.outputs = ['success'];
  const actionB = function(context) {
    context.output({foo: 'bar2'});
  };
  const actionC = function(context) {
    context.output({foo: 'bar3'});
  };
  actionC.async = true;
  const actionD = function(context) {
    test.deepEqual(context.input, {foo: 'bar3'});
    test.done();
  };
  const signal = createSignal([
    actionA, {
      success: [
        actionB,
        actionC
      ]
    },
    actionD
  ]);
  signal()(createDispatcher(), createState());
};

suite['should override payload properties propagated up the signal tree sync'] = function(test) {
  const actionA = function(context) {
    context.output.success({foo: 'bar'});
  };
  actionA.outputs = ['success'];
  const actionB = function(context) {
    context.output.success({foo: 'bar2'});
  };
  actionB.outputs = ['success'];
  const actionC = function(context) {
    test.deepEqual(context.input, {foo: 'bar2'});
    test.done();
  };
  const signal = createSignal([
    actionA, {
      success: [
        actionB, {
          success: []
        }
      ]
    },
    actionC
  ]);
  signal()(createDispatcher(), createState());
};

suite['should bring outputs down paths back up on synchronous nesting even with no output'] = function(test) {
  const actionA = function(context) {
    context.output.success();
  };
  actionA.outputs = ['success'];
  const actionB = function(context) {
    context.output.success({bar: 'foo'});
  };
  actionB.outputs = ['success'];
  const actionC = function(context) {
    test.deepEqual(context.input, {foo: 'bar', bar: 'foo'});
    test.done();
  };
  const signal = createSignal([
    actionA, {
      success: [
        actionB, {
          success: []
        }
      ]
    },
    actionC
  ]);
  signal({foo: 'bar'})(createDispatcher(), createState());
};

suite['should bring outputs down paths back up on synchronous nesting even with plain output'] = function(test) {
  const actionA = function(context) {
    context.output.success();
  };
  actionA.outputs = ['success'];
  const actionB = function(context) {
    context.output({bar: 'foo'});
  };
  const actionC = function(context) {
    test.deepEqual(context.input, {foo: 'bar', bar: 'foo'});
    test.done();
  };
  const signal = createSignal([
    actionA, {
      success: [
        actionB
      ]
    },
    actionC
  ]);
  signal({foo: 'bar'})(createDispatcher(), createState());
};

suite['should register signals'] = function(test) {
  const signal = createSignal([]);
  test.ok(typeof signal === 'function');
  test.done();
};

suite['should trigger an action when run'] = function(test) {
  const action = function() {
    test.ok(true);
    test.done();
  };
  const signal = createSignal([
    action
  ]);
  signal()(createDispatcher(), createState());
};

suite['should be able to define custom outputs as arrays'] = function(test) {
  const actionA = function(context) {
    context.output.foo({foo: 'bar'});
  };
  actionA.outputs = ['foo'];
  const actionB = function(context) {
    test.deepEqual(context.input, {foo: 'bar'});
    test.done();
  };
  const signal = createSignal([
    actionA, {
      foo: [
        actionB
      ]
    }
  ]);
  signal()(createDispatcher(), createState());
};

suite['should pass initial payload on input'] = function(test) {
  const action = function(context) {
    test.deepEqual(context.input, {foo: 'bar'});
    test.done();
  };
  const signal = createSignal([
    action
  ]);

  signal({foo: 'bar'})(createDispatcher(), createState());
};

suite['should expose an output method which can update payload'] = function(test) {
  const actionA = function(context) {
    context.output({
      result: true
    });
  };
  const actionB = function(context) {
    test.ok(context.input.result);
    test.done();
  };
  const signal = createSignal([
    actionA,
    actionB
  ]);
  signal()(createDispatcher(), createState());
};

suite['should be able to resolve as an async action'] = function(test) {
  const actionA = function(context) {
    async(function() {
      context.output({
        result: true
      });
    });
  };
  actionA.async = true;
  const actionB = function(context) {
    test.ok(context.input.result);
    test.done();
  };
  const signal = createSignal([
    actionA,
    actionB
  ]);
  signal()(createDispatcher(), createState());
};

suite['should be able to define action as async'] = function (test) {
  const actionA = function(context) {
    async(function() {
      context.output({
        result: true
      });
    });
  };
  actionA.async = true;
  const actionB = function(context) {
    test.ok(context.input.result);
    test.done();
  };
  const signal = createSignal([
    actionA,
    actionB
  ]);
  signal()(createDispatcher(), createState());
};

suite['should be able to define action as async with paths'] = function(test) {
  const actionA = function(context) {
    async(function() {
      context.output.success({
        result: true
      });
    });
  };
  actionA.async = true;
  actionA.outputs = ['success', 'error'];
  const actionB = function(context) {
    test.ok(context.input.result);
    test.done();
  };
  const signal = createSignal([
    actionA, {
      success: [
        actionB
      ],
      error: []
    }
  ]);
  signal()(createDispatcher(), createState());
};

suite['should handle arrays of actions to run in parallell'] = function(test) {
  const actionA = function(context) {
    context.output({ foo: true });
  };
  actionA.async = true;
  const actionB = function(context) {
    context.output({ bar: true });
  };
  actionB.async = true;
  const actionC = function(context) {
    test.deepEqual(context.input, {foo: true, bar: true});
    test.done();
  };
  const signal = createSignal([
    [
      actionA,
      actionB
    ],
    actionC
  ]);
  signal()(createDispatcher(), createState());
};

suite['should handle arrays of actions to resolve to multiple paths'] = function(test) {
  const results = [];
  const actionA = function(context) {
    context.output.success({ foo: true });
  };
  actionA.async = true;
  const actionB = function(context) {
    results.push(context.input);
  };
  const actionC = function(context) {
    context.output.error({ bar: true });
  };
  actionC.async = true;
  const actionD = function(context) {
    results.push(context.input);
  };
  const signal = createSignal([
    [
      actionA, {
        'success': [
          actionB
        ]
      },
      actionC, {
        'error': [
          actionD
        ]
      }
    ]
  ]);
  signal()(createDispatcher(), createState())
    .then(function() {
      test.equals(results.length, 2);
      test.deepEqual(results[0], {
        foo: true
      });
      test.deepEqual(results[1], {
        bar: true
      });
      test.done();
    });
};

suite['should trigger paths when individual async is done'] = function(test) {
  const results = [];
  const actionA = function(context) {
    async(function() {
      context.output.success({ value: 'foo' });
    });
  };
  actionA.async = true;
  const actionB = function(context) {
    results.push(context.input.value);
  };
  const actionC = function(context) {
    context.output.error({ value: 'bar' });
  };
  actionC.async = true;
  const actionD = function(context) {
    results.push(context.input.value);
  };
  const signal = createSignal([
    [
      actionA, {
        'success': [
          actionB
        ]
      },
      actionC, {
        'error': [
          actionD
        ]
      }
    ]
  ]);
  signal()(createDispatcher(), createState())
    .then(function() {
      test.equal(results[0], 'bar');
      test.equal(results[1], 'foo');
      test.done();
    });
};

suite['should wait to resolve top level async array when nested async arrays are running'] = function(test) {
  const results = [];
  const actionA = function(context) {
    async(function() {
      context.output.success({
        value: 'foo'
      });
    });
  };
  actionA.async = true;
  const actionB = function(context) {
    results.push(context.input.value);
    context.output();
  };
  actionB.async = true;
  const actionC = function() {
    results.push('bar');
  };
  const signal = createSignal([
    actionA, {
      'success': [
        actionB
      ]
    },
    actionC
  ]);
  signal()(createDispatcher(), createState())
    .then(function() {
      test.equal(results[0], 'foo');
      test.equal(results[1], 'bar');
      test.done();
    });
};

suite['should run signal without any actions'] = function(test) {
  test.doesNotThrow(function() {
    createSignal([])();
  });
  test.done();
};

suite['should throw error when output path is not an array'] = function(test) {
  const action = function(context) {
    context.output.success();
  };
  action.async = true;
  test.throws(function() {
    createSignal([
      action, {
        success: true
      }
    ]);
  });
  test.done();
};

module.exports = { signal: suite };
