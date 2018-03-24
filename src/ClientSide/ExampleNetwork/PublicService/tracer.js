
class Tracer {

  constructor() {
    this.traces = [];
    this.creationTime = new Date().getTime();
  }

  startAction(actionId) {
    this.traces.push({
      id: actionId,
      type: "start",
      timestamp: new Date().getTime() - this.creationTime
    })
  }

  endAction(actionId) {
    this.traces.push({
      id: actionId,
      type: "end",
      timestamp: new Date().getTime() - this.creationTime
    })
  }

  atomicAction(actionId) {
    this.traces.push({
      id: actionId,
      type: "atomic",
      timestamp: new Date().getTime() - this.creationTime
    })
  }

  getTrace() {
    return this.traces;
  }
}

module.exports = Tracer;
