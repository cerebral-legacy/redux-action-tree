function dispatch(actionType) {
  function action(context) {
    context.dispatch({type: actionType, payload: context.input});
  }
  return action;
}

module.exports = dispatch;
