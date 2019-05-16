'use strict';

const Parser = require('../lib/parser');

describe('Parser', () => {
  describe('construction', () => {
    context('valid', () => {
      it('has no errors', () => {
        let options = {
          _: { multiple: true }
        };
        let parser = new Parser(options);
        expect(parser.errors).to.have.length(0);
        expect(parser.settings).to.have.all.keys('_');
      });
    });

    context('missing catch all', () => {
      it('advises via error', () => {
        let options = {};
        let parser = new Parser(options);
        expect(parser.errors).to.have.length(1);
        expect(parser.errors[0]).to.match(/Catch all ".*" not in options group/);
      });
    });

    context('short options', () => {
      it('sets shortOptions to long version', () => {
        let options = {
          _: { type: Array },
          test: { alias: 't' }
        };
        let parser = new Parser(options);
        expect(parser.errors).to.have.length(0);
        expect(parser.alias.t).to.eql('test');
      });
    });
  });

  describe('#parse', () => {
    let parser;
    beforeEach(() => {
      parser = new Parser({
        _: { type: Array },
        hasShort: { alias: 'h', type: Array, default: ['SHORT'] },
        isFlag: { type: Boolean, alias: 'f' },
        longOnly: { type: String, default: 'LONG' }
      });
    });

    describe('correct use', () => {
      it('uses catch all after -', () => {
        const result = parser.parse(['-h', 'test', '-', 'test2']);
        expect(parser.errors).to.have.length(0);
        expect(result).to.deep.include({ hasShort: ['test'], _: ['test2'] });
      });

      it('uses catch all after --', () => {
        const result = parser.parse(['-h', 'test', '--', 'test2']);
        expect(parser.errors).to.have.length(0);
        expect(result).to.deep.include({ hasShort: ['test'], _: ['test2'] });
      });

      it('ignores `options` after --', () => {
        const result = parser.parse(['-h', 'test', '--', 'test2', '--longOnly', 'test3']);
        expect(parser.errors).to.have.length(0);
        expect(result).to.deep.include({ hasShort: ['test'], _: ['test2', '--longOnly', 'test3'] });
      });

      it('sets defaults', () => {
        const result = parser.parse(['-f', 'test3']);
        expect(parser.errors).to.have.length(0);
        expect(result).to.deep.include({ hasShort: ['SHORT'], isFlag: true, longOnly: 'LONG', _: ['test3'] });
      });

      it('processes boolean long form', () => {
        const result = parser.parse(['--isFlag']);
        expect(parser.errors).to.have.length(0);
        expect(result).to.deep.include({ hasShort: ['SHORT'], isFlag: true, longOnly: 'LONG', _: [] });
      });

      it('catches following values', () => {
        const result = parser.parse(['-fh', 'test', 'test2', '--longOnly', 'test3', 'test4']);
        expect(parser.errors).to.have.length(0);
        expect(result).to.deep.include({ hasShort: ['test', 'test2'], isFlag: true, longOnly: 'test3', _: ['test4'] });
      });

      it('catches attached values', () => {
        const result = parser.parse(['-fh=test', 'test2', '--longOnly=test3', 'test4']);
        expect(parser.errors).to.have.length(0);
        expect(result).to.deep.include({ hasShort: ['test', 'test2'], isFlag: true, longOnly: 'test3', _: ['test4'] });
      });
    });

    context('incorrect use', () => {
      it('reports unknown options', () => {
        parser.parse(['-X', '--what', '--another=bad']);
        expect(parser.errors).to.eql([
          'unknown shorthand argument \'X\'',
          'unknown argument \'what\'',
          'unknown argument \'another\''
        ]);
      });

      it('reports failure when an option starts with "="', () => {
        parser.parse(['--=thing']);
        expect(parser.errors).to.eql(['no option can start with an \'=\'']);
      });
    });
  });
});
