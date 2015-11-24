var la = require('lazy-ass');
var check = require('check-more-types');
var describeIt = require('describe-it');
var _ = require('lodash');
var join = require('path').join;

var filename = join(__dirname, '..', 'index.js');

/* global describe, it, beforeEach */
describeIt(filename, 'updateMarkdownWith(title, markdownText, replacement)', function () {

  it('is a function', function () {
    la(check.fn(this.updateMarkdownWith));
  });

  describe('without links', function () {
    var source = ['# foo',
      'this is a section',
      '# bar',
      'another section'
    ].join('\n');

    var replacement = 'replaced second section';

    it('updates a section of markdown text', function () {
      var updated = this.updateMarkdownWith('bar', source, replacement);
      la(check.unemptyString(updated));
      la(updated.indexOf('another') === -1, 'removed second section', updated);
      la(updated.indexOf('replaced') > 0, 'found new text', updated);
    });
  });

  describe('with inlined links', function () {
    var source = ['# foo',
      'this is a section',
      '# bar',
      'another section'
    ].join('\n');

    var replacement = 'replaced [second](https://github.com) section';

    it('updates a section of markdown text', function () {
      var updated = this.updateMarkdownWith('bar', source, replacement);
      la(check.unemptyString(updated));
      la(updated.indexOf('another') === -1, 'removed second section', updated);
      la(updated.indexOf('replaced') > 0, 'found new text', updated);
    });

    it('brings links from new text', function () {
      la(source.indexOf('github.com') === -1,
        'source does not have this link at first', source);

      var updated = this.updateMarkdownWith('bar', source, replacement);
      la(updated.indexOf('github.com') > 0, 'found new link', updated);
    });
  });

  describe('with separate links', function () {
    var source = ['# foo',
      'this is a section',
      '# bar',
      'another section'
    ].join('\n');

    var replacement = ['replaced [second][second] section',
      '',
      '[second]: https://github.com'
    ].join('\n');

    it('updates a section of markdown text', function () {
      var updated = this.updateMarkdownWith('bar', source, replacement);
      la(check.unemptyString(updated));
      la(updated.indexOf('another') === -1, 'removed second section', updated);
      la(updated.indexOf('replaced') > 0, 'found new text', updated);
      la(updated.indexOf('second') > 0, 'found new link title', updated);
    });

    it('brings links from new text', function () {
      la(source.indexOf('github.com') === -1,
        'source does not have this link at first', source);

      var updated = this.updateMarkdownWith('bar', source, replacement);
      la(updated.indexOf('github.com') > 0, 'found new link\n' + updated);
    });
  });
});

describeIt(filename, 'headerText(text)', function (codeExtract) {
  var headerText;
  beforeEach(function () {
    headerText = codeExtract();
    la(check.fn(headerText));
  });

  it('extracts just the title', function () {
    var text = headerText('## bar');
    la(text === 'bar', 'could not get bar', text);
  });

  it('works with 3rd level', function () {
    var text = headerText('### foo bar - baz');
    la(text === 'foo bar - baz', 'could not get text', text);
  });
});

describeIt(filename, 'replaceSection(tokens, heading, newText)', function (codeExtract) {
  var tokens, replaceSection;
  var newText = 'new text';

  beforeEach(function () {
    replaceSection = codeExtract();
    la(check.fn(replaceSection));
    tokens = [
      {type: 'heading', depth: 1, text: 'title'},
      {type: 'paragraph', text: 'some text'},
      {type: 'heading', depth: 2, text: 'foo'},
      {type: 'paragraph', text: 'this is foo'},
      {type: 'heading', depth: 2, text: 'bar'},
      {type: 'paragraph', text: 'this is bar'}
    ];
  });

  function hasNewText(tokenList) {
    return _.findIndex(tokenList, {text: newText}) !== -1;
  }

  beforeEach(function () {
    la(!hasNewText(tokens));
  });

  it('replaces middle section with given heading', function () {
    var heading = 'foo';
    var replaced = replaceSection(tokens, heading, newText);
    la(check.array(replaced), 'returns an array');
    la(hasNewText(replaced), 'has updated tokens', replaced);
  });

  it('replaces last section with given heading', function () {
    var heading = 'bar';
    var replaced = replaceSection(tokens, heading, newText);
    la(check.array(replaced), 'returns an array');
    la(hasNewText(replaced), 'has updated tokens', replaced);
  });

});
