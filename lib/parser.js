'use strict';

class Parser {
  constructor(settings, catchAll = '_') {
    if (!(catchAll in settings)) {
      this.errors = [`Catch all "${catchAll}" not in options group`];
      return;
    }
    this.settings = Object.assign({}, settings);
    this.catchAll = catchAll;
    this.errors = [];
    this.alias = {};
    this.defaultResult = {};
    Object.keys(settings)
      .map(option => [option, this.settings[option]])
      .forEach(([option, setting]) => {
        if (setting.alias) { this.alias[setting.alias] = option; }
        this.defaultResult[option] = setting.default || (setting.type === Boolean ? false : setting.type === Array ? [] : null);
      });
  }

  storeFromDelimited(arg) {
    if (this.delimited) {
      this.result[this.catchAll].push(arg);
    }
    return this.delimited;
  }
  setDelimitedFrom(arg) {
    return this.delimited = '--'.startsWith(arg);
  }
  storeRaw(arg) {
    this.delimited = this.target === this.catchAll; // sets if this is the first argument in
    if (this.settings[this.target].type === Array) {
      this.result[this.target] = this.result[this.target] || [];
      this.result[this.target].push(arg);
    } else {
      this.result[this.target] = arg;
      this.target = this.catchAll;
    }
  }
  assign(target, value) {
    if (this.settings[target].type === Array) {
      this.result[target] = this.result[target] || [];
      this.result[target].push(value);
      this.target = target;
    } else {
      this.result[target] = value;
      this.target = this.catchAll;
    }
  }
  processShortAssignment(target, argTail) {
    if (argTail[0] === '=') argTail = argTail.slice(1);
    if (!argTail) this.target = target;
    else this.assign(target, argTail);
  }

  toggleBoolean(target) {
    this.result[target] = !this.result[target];
    this.target = this.catchAll;
  }
  processShort(arg) {
    for (let index = 1; index < arg.length; index++) {
      const target = this.alias[arg[index]];
      if (!target) {
        this.errors.push(`unknown shorthand argument '${arg[index]}'`);
        return;
      }
      if (this.settings[target].type === Boolean) this.toggleBoolean(target);
      else {
        this.processShortAssignment(target, arg.slice(index + 1));
        return;
      }
    }
  }

  processLong(arg) {
    const assignmentPoint = arg.indexOf('=', 2);
    if (assignmentPoint === 2) {
      this.errors.push('no option can start with an \'=\'');
      return;
    }
    let target;
    if (assignmentPoint === -1) {
      target = arg.slice(2);
      if (!this.settings[target]) {
        this.errors.push(`unknown argument '${target}'`);
        this.target = this.catchAll;
        return;
      }
      if (this.settings[target].type === Boolean) this.toggleBoolean(target);
      else this.target = target;
      return;
    }

    target = arg.slice(2, assignmentPoint);
    if (!this.settings[target]) this.errors.push(`unknown argument '${target}'`);
    else this.assign(target, arg.slice(assignmentPoint + 1));
  }

  parse(commandArgs) {
    this.errors = [];
    this.delimited = false;
    this.target = this.catchAll;
    this.result = {
      [this.catchAll]: []
    };
    commandArgs.forEach(arg => {
      if (this.storeFromDelimited(arg)) { return; }
      if (this.setDelimitedFrom(arg)) { return; }
      if (arg[0] !== '-') { return this.storeRaw(arg); }
      if (arg[1] !== '-') this.processShort(arg);
      else this.processLong(arg);
    });

    if ( this.result[this.catchAll].length === 0) delete this.result[this.catchAll];

    return Object.assign({}, this.defaultResult, this.result);
  }
}

module.exports = Parser;
