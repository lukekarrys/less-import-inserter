var path = require('path')
var fs = require('fs')
var os = require('os')

function toImports (arr, type) {
  if (typeof arr === 'undefined') {
    return ''
  }

  if (!Array.isArray(arr)) {
    arr = [arr]
  }
  return (type === 'after' ? os.EOL : '') + arr.map(function (line) {
    return '@import "' + line + '";'
  }).join(os.EOL) + (type === 'before' ? os.EOL : '')
}

function addLess (file) {
  return path.extname(file) === '.less' ? file : file + '.less'
}

function LessImportInserter (options) {
  options || (options = {})
  this.before = options.before || {}
  this.after = options.after || {}
  this.append = toImports(options.append, 'after')
  this.lessPath = options.lessPath
  this.relativeTo = options.relativeTo
  this.less = this.lessPath && !options.less ? fs.readFileSync(this.lessPath, 'utf8') : options.less

  if (!this.less) throw new Error('Use the `path` or `less` option to specify the less file.')
}

LessImportInserter.prototype.build = function () {
  var res = this.less
  var newlineAtEnd = this.less.slice(-1) === os.EOL

  // Change the existing imports to a relative path
  if (this.relativeTo && this.lessPath) {
    res = res.replace(/^(@import ")(.*?)(";)$/gm, function (match, g1, g2, g3) {
      return g1 + path.relative(this.relativeTo, path.dirname(this.lessPath)) + path.sep + g2 + g3
    }.bind(this))
  }

  res = res.split(os.EOL)
  res = res.map(function (line) {
    Object.keys(this.before).forEach(function (beforeLine) {
      if (line.indexOf(addLess(beforeLine)) > -1) {
        line = toImports(this.before[beforeLine], 'before') + line
      }
    }, this)

    Object.keys(this.after).forEach(function (afterLine) {
      if (line.indexOf(addLess(afterLine)) > -1) {
        line += toImports(this.after[afterLine], 'after')
      }
    }, this)

    return line
  }, this).join(os.EOL)

  if (this.append) {
    res += (res.slice(-1) === os.EOL ? '' : os.EOL) + this.append + (newlineAtEnd ? os.EOL : '')
  }

  return res
}

module.exports = LessImportInserter
