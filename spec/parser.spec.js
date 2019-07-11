'use strict';

const Parser = require('../lib/parser');

describe('Parser', () => {
  describe('construction', () => {
    subject('parser', () => new Parser(options));

    context('valid', () => {
      set('options', { _: { multiple: true } });

      it('has no errors', () => {
        expect(parser.errors).to.have.length(0);
        expect(parser.settings).to.have.all.keys('_');
      });
    });

    context('missing catch all', () => {
      set('options', {});

      it('advises via error', () => {
        expect(parser.errors).to.have.length(1);
        expect(parser.errors[0]).to.match(/Catch all ".*" not in options group/);
      });
    });

    context('short options', () => {
      set('options', {
        _: { type: Array },
        test: { alias: 't' }
      });

      it('sets shortOptions to long version', () => {
        expect(parser.errors).to.have.length(0);
        expect(parser.alias.t).to.eql('test');
      });
    });
  });

  describe('#parse', () => {
    set('parser', () => new Parser({
      _: { type: Array },
      hasShort: { alias: 'h', type: Array, default: ['SHORT'] },
      isFlag: { type: Boolean, alias: 'f' },
      longOnly: { type: String, default: 'LONG' }
    }));

    subject('parseResult', () => parser.parse(args));

    describe('correct use', () => {
      context('after `-`', () => {
        set('args', ['-h', 'test', '-', 'test2']);

        it('uses catch all', () => {
          expect(parser.errors).to.have.length(0);
          expect(parseResult).to.deep.include({ hasShort: ['test'], _: ['test2'] });
        });
      });

      context('after `-`', () => {
        set('args', ['-h', 'test', '--', 'test2']);

        it('uses catch all', () => {
          expect(parser.errors).to.have.length(0);
          expect(parseResult).to.deep.include({ hasShort: ['test'], _: ['test2'] });
        });
      });

      describe('no options after escape', () => {
        set('args', ['-h', 'test', '--', 'test2', '--longOnly', 'test3']);

        it('all trailing parts are considered catch all', () => {
          expect(parser.errors).to.have.length(0);
          expect(parseResult).to.deep.include({ hasShort: ['test'], _: ['test2', '--longOnly', 'test3'] });
        });
      });

      describe('not passing options', () => {
        set('args', ['-f', 'test3']);

        it('sets defaults', () => {
          expect(parser.errors).to.have.length(0);
          expect(parseResult).to.deep.include({ hasShort: ['SHORT'], isFlag: true, longOnly: 'LONG', _: ['test3'] });
        });
      });

      describe('boolean options', () => {
        set('args', ['--isFlag']);

        it('processes long form', () => {
          expect(parser.errors).to.have.length(0);
          expect(parseResult).to.deep.include({ hasShort: ['SHORT'], isFlag: true, longOnly: 'LONG', _: [] });
        });

        describe('multi flags', () => {
          describe('short form', () => {
            set('args', ['-ff']);
            it('toggles the flag', () => {
              expect(parser.errors).to.have.length(0);
              expect(parseResult).to.deep.include({ hasShort: ['SHORT'], isFlag: false, longOnly: 'LONG', _: [] });
            });
          });

          describe('long form', () => {
            set('args', ['--isFlag', '--isFlag']);
            it('toggles the flag', () => {
              expect(parser.errors).to.have.length(0);
              expect(parseResult).to.deep.include({ hasShort: ['SHORT'], isFlag: false, longOnly: 'LONG', _: [] });
            });
          });

          describe('long and short form', () => {
            set('args', ['--isFlag', '-f']);
            it('toggles the flag', () => {
              expect(parser.errors).to.have.length(0);
              expect(parseResult).to.deep.include({ hasShort: ['SHORT'], isFlag: false, longOnly: 'LONG', _: [] });
            });
          });
        });
      });

      describe('multiple options', () => {
        set('args', ['-fh', 'test', 'test2', '--longOnly', 'test3', 'test4']);

        it('catches all', () => {
          expect(parser.errors).to.have.length(0);
          expect(parseResult).to.deep.include({ hasShort: ['test', 'test2'], isFlag: true, longOnly: 'test3', _: ['test4'] });
        });
      });

      describe('attached args', () => {
        set('args', ['-fh=test', 'test2', '--longOnly=test3', 'test4']);

        it('catches all', () => {
          expect(parser.errors).to.have.length(0);
          expect(parseResult).to.deep.include({ hasShort: ['test', 'test2'], isFlag: true, longOnly: 'test3', _: ['test4'] });
        });
      });
    });

    context('incorrect use', () => {
      subject('errors', () => { parseResult; return parser.errors; });

      describe('unknown options', () => {
        set('args', ['-X', '--what', '--another=bad']);

        it('are reported', () => {
          expect(errors).to.eql([
            'unknown shorthand argument \'X\'',
            'unknown argument \'what\'',
            'unknown argument \'another\''
          ]);
        });
      });

      describe('starting with `=`', () => {
        set('args', ['--=thing']);

        it('reports failure', () => {
          expect(errors).to.eql(['no option can start with an \'=\'']);
        });
      });
    });
  });
});
