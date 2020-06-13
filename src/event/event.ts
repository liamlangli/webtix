
export type Event = string;

interface Listener {
  event: Event;
  callback: Function;
  scope: any;
  once?: boolean;
}

export class EventNode {

  private listenerMap: Map<Event, Listener[]> = new Map();

  /**
   * warn:
   *  if event & callback has registered, new listener will replace one
   *
   * @param {Event} event
   * @param {Function} callback
   * @param {*} [scope]
   * @param {boolean} [once=false]
   * @memberof EventNode
   */
  public on(event: Event, callback: Function, scope?: any, once: boolean = false): void {
    const listener: Listener = { event: event, callback: callback, scope: scope || this, once: once };
    const listeners = this.listenerMap.get(event);
    if (listeners === undefined) {
      this.listenerMap.set(event, [listener]);
    } else {
      let contain = false;
      for (let i = 0, l = listeners.length; i < l; ++i) {
        if (listeners[i].event === listener.event &&
          listeners[i].callback === listener.callback) {
          contain = true;
          listeners[i] = listener;
        }
      }
      if (!contain) {
        listeners.push(listener);
      }
    }
  }

  public once(event: Event, callback: Function, scope?: any): void {
    this.on(event, callback, scope, true);
  }

  public off(event: Event, callback: Function, scope?: any, once: boolean = false): void {
    const listener: Listener = { event: event, callback: callback, scope: scope || this, once: once };
    const listeners = this.listenerMap.get(event);
    if (listeners) {
      for (let i = 0, l = listeners.length; i < l; ++i) {
        if (listeners[i].event === listener.event &&
          listeners[i].callback === listener.callback) {
          listeners.splice(i, 1);
        }
      }
    }
  }

  public fire(event: Event, payload?: any): void {
    const listeners = this.listenerMap.get(event);
    if (listeners) {
      for (let i = 0, l = listeners.length; i < l; ++i) {
        const listener = listeners[i];
        if (event === listener.event) {
          listener.callback.bind(listener.scope || this);
          listener.callback(payload);
          if (listener.once) {
            listeners.splice(i, 1);
          }
        }
      }
    }
  }

  public dispose() {
    for (const key of this.listenerMap.keys()) {
      this.listenerMap.delete(key);
    }
  }
}

export default class EventHub {

  private static node = new EventNode();

  public static on(event: Event, callback: Function, scope?: any): void {
    this.node.on(event, callback, scope);
  }

  public static fire(event: Event, payload?: any): void {
    this.node.fire(event, payload);
  }

  public static off(event: Event, callback: Function, scope?: any) {
    this.node.off(event, callback, scope);
  }
}