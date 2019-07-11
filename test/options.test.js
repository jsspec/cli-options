'use strict';

const Option = require('../lib/options');

describe('Option', () => {
  subject('option', () => new Option(args, options, 'files'));

  let options = {
    random: { alias: 'R', type: Boolean, required: false, default: true },
    require: { alias: 'r', type: Array, required: false, default: [] },
    format: { alias: 'f', type: String, required: false, default: 'documentation', },
    files: { type: Array, required: false, default: [] }
  };

  context('with a simple arg set', () => {
    set('args', '-r ./some/file ./some/otherFile -fd run/this/test and/this/one'.split(' '));

    it('picks up a simple arg set correctly', () => {
      expect(option.settings).to.deep.include({
        random: true,
        require: ['./some/file', './some/otherFile'],
        format: 'd',
        files: ['run/this/test', 'and/this/one']
      });
    });
  });

  context('with multiple values to an array setting', () => {
    set('args', '--require=./some/file ./some/otherFile -fd run/this/test and/this/one'.split(' '));

    it('picks up a both parts of an array correctly', () => {
      expect(option.settings).to.deep.include({
        random: true,
        require: ['./some/file', './some/otherFile'],
        format: 'd',
        files: ['run/this/test', 'and/this/one']
      });
    });
  });

  describe('bailing from an array setting', () => {
    context('using `--`', () => {
      set('args', '--require=./some/file ./some/otherFile -- run/this/test and/this/one'.split(' '));

      it('bails from an array setting with `--`', () => {
        expect(option.settings).to.deep.include({
          random: true,
          require: ['./some/file', './some/otherFile'],
          files: ['run/this/test', 'and/this/one']
        });

        expect(options.errors).to.be.undefined;
      });
    });

    context('using the full default flag', () => {
      set('args', '--require=./some/file ./some/otherFile --files run/this/test and/this/one'.split(' '));
      it('bails from an array setting with the full default flag', () => {

        expect(option.settings).to.deep.include({
          random: true,
          require: ['./some/file', './some/otherFile'],
          files: ['run/this/test', 'and/this/one']
        });

        expect(options.errors).to.be.undefined;
      });
    });
  });

  context('unknown flags', () => {
    set('args', '--youDontKnowMe -RR'.split(' '));

    it('fails on an unknown and toggles flags', () => {
      expect(option.settings).to.deep.include({ random: false });
      expect(option.errors).to.have.length(1);
      expect(option.errors[0]).to.match(/unknown argument 'youDontKnowMe'/);
    });
  });
});
