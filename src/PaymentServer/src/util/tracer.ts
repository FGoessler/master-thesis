
export interface TraceAction {
  id: string;
  type: string;
  timestamp: number;
}

export default class Tracer {
  private traces: TraceAction[];
  private creationTime: number;

  constructor() {
    this.traces = [];
    this.creationTime = new Date().getTime();
  }

  startAction(actionId: string) {
    this.traces.push({
      id: actionId,
      type: "start",
      timestamp: new Date().getTime() - this.creationTime
    });
  }

  endAction(actionId: string) {
    this.traces.push({
      id: actionId,
      type: "end",
      timestamp: new Date().getTime() - this.creationTime
    });
  }

  atomicAction(actionId: string) {
    this.traces.push({
      id: actionId,
      type: "atomic",
      timestamp: new Date().getTime() - this.creationTime
    });
  }

  getTrace() {
    return this.traces;
  }
}
