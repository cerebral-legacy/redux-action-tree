var actionTree = require('action-tree');
var staticTree = actionTree.staticTree;
var executeTree = actionTree.executeTree;

function createSignal(chain) {
  var tree = staticTree(chain)

  function runAction (dispatch, getState, action, payload) {
    return new Promise((resolve, reject) => {
      var actionFunc = tree.actions[action.actionIndex]

      var result;

      function outputFn(path, outputPayload) {
        result = {
          path: typeof path === 'string' ? path : null,
          payload: typeof path === 'string' ? outputPayload : path
        }

        if (action.isAsync) {
          resolve(result)
        }
      }

      (actionFunc.outputs || ['success', 'error']).forEach(function(output) {
        outputFn[output] = outputFn.bind(null, output);
      });

      actionFunc({
        input: payload,
        output: outputFn,
        dispatch: action.isAsync ? null : dispatch,
        getState: getState
      });

      if (!action.isAsync) { resolve(result) }
    })
  }

  const executer = function (payload) {
    return function (dispatch, getState) {
      return executeTree(tree.tree, runAction.bind(null, dispatch, getState), payload)
    }
  }

  return executer;

}

module.exports = createSignal;
