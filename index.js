var log = require('debug')('um');
require('lazy-ass');
var check = require('check-more-types');
var read = require('fs').readFileSync;
var write = require('fs').writeFileSync;
var _ = require('lodash');

var marked = require('marked');
var mdRenderer = require('marked-to-md');
var renderer = mdRenderer(new marked.Renderer());
var parser = new marked.Parser({renderer: renderer});

// '## bar' -> 'bar'
function headerText(text) {
  la(check.unemptyString(text), 'missing text', text);
  var tokens = marked.lexer(text);
  la(tokens.length, 'missing tokens', tokens, 'from', text);
  return tokens[0].text;
}

function replaceSection(tokens, heading) {
  var text = headerText(heading);
  la(check.unemptyString(text), 'could not extract text from heading', heading);
  var headerIndex = _.findIndex(tokens, {type: 'heading', text: text});
  if (headerIndex === -1) {
    throw new Error('Could not find header text ' + heading);
  }

  return tokens;
}

function updatedContent(options) {

  la(check.unemptyString(options.filename), 'missing filename', options);
  var text = read(options.filename, 'utf-8');
  la(check.unemptyString(text), 'empty text in file', options.filename, text);

  var tokens = marked.lexer(text);
  log('read file %s and split into %d markdown tokens',
    options.filename, tokens.length);

  console.log(tokens);

  return text;
}

function updateMarkdown(options) {
  options = options || {};
  la(check.unemptyString(options.filename), 'missing filename', options);
  var updatedText = updatedContent(options);
  log('writing updatedText markdown to %s', options.filename);
  write(options.filename, updatedText);
  return updatedText;
}

module.exports = updateMarkdown;
