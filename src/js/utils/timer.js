export default class Timer {
  #startTime = 0;
  #oldValue = 0;
  #value = 0;
  #intervalId;
  #listeners = null;
  #tickInterval;

  constructor(interval = 1000) {
    this.#tickInterval = interval;
  }
  start() {
    const callTick = () => {
      this.#tick();
    };

    this.#startTime = Date.now();
    this.#intervalId = setInterval(() => callTick(), this.#tickInterval);
    this.#oldValue = this.#value; //remember oldValue in case of restarting
    this.#tick('start');
    return this;
  }
  stop() {
    if (this.#intervalId === null) return;
    clearInterval(this.#intervalId);
    this.#intervalId = null;
    this.#tick('stop');
    return this;
  }

  #emitOnChange(reason) {
    this.#listeners?.forEach((callback) =>
      callback({ reason, value: this.#value, timer: this })
    );
  }

  reset() {
    this.stop();
    this.#oldValue = 0;
    this.#value = 0;
    this.#emitOnChange('reset');
    return this;
  }

  onChange(callback) {
    if (typeof callback !== 'function') return this;
    if (this.#listeners === null) {
      this.#listeners = new Set();
    }
    this.#listeners.add(callback);
    return this;
  }

  toString(format = 'D:H:M:S:R', padStart = 0) {
    const values = {
      R: this.#value, // total number of ms
      r: this.#value % 1000, // number of ms in last minute
    };

    values.S = (values.R - values.r) / 1000; // total number of seconds
    values.s = values.S % 60; // number od seconds in last minute

    values.M = (values.S - values.s) / 60; // value in minutes
    values.m = values.M % 60; // number of minutes in last hour

    values.H = (values.M - values.m) / 60; // value in hours
    values.h = values.H % 24; // number of hours in las day

    values.D = values.d = (values.H - values.h) / 24; // value in days

    return format.replace(/[DHMSRdhmsr]/g, (match) => {
      const replacement = values[match].toString();
      return padStart ? replacement.padStart(padStart, '0') : replacement;
    });
  }

  valueOf() {
    return this.#value;
  }

  #tick(reason = 'tick') {
    if (reason === 'tick') {
      let deltaTime = Date.now() - this.#startTime;
      this.#value = this.#oldValue + deltaTime;
    }
    this.#emitOnChange(reason);
  }
}
