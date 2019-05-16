'use strict';

const Option = require('../lib/options');

describe('Option', () => {
  let options = {
    random: { alias: 'R', type: Boolean, required: false, default: true },
    require: { alias: 'r', type: Array, required: false, default: [] },
    format: { alias: 'f', type: String, required: false, default: 'documentation', },
    files: { type: Array, required: false, default: [] }
  };

  it('picks up a simple arg set correctly', () => {
    let args = '-r ./some/file ./some/otherFile -fd run/this/test and/this/one'.split(' ');
    let option = new Option(args, options, 'files');

    expect(option.settings).to.deep.include({
      random: true,
      require: ['./some/file', './some/otherFile'],
      format: 'd',
      files: ['run/this/test', 'and/this/one']
    });
  });

  it('picks up a both parts of an arrray correctly', () => {
    let args = '--require=./some/file ./some/otherFile -fd run/this/test and/this/one'.split(' ');
    let option = new Option(args, options, 'files');

    expect(option.settings).to.deep.include({
      random: true,
      require: ['./some/file', './some/otherFile'],
      format: 'd',
      files: ['run/this/test', 'and/this/one']
    });
  });

  it('fails on an unknown and toggles flags', () => {
    let args = '--youDontKnowMe -RR'.split(' ');
    let option = new Option(args, options, 'files');

    expect(option.settings).to.deep.include({ random: false });
    expect(option.errors).to.have.length(1);
    expect(option.errors[0]).to.match(/unknown argument 'youDontKnowMe'/);
  });
});
