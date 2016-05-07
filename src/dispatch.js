function dispatch(actionType) {
  function action(context) {
    context.dispatch(actionType, {payload: context.input});
  }
  return action;
}

module.exports = dispatch;
