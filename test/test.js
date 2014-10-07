var Lab = require('lab');
var path = require('path');
var fs = require('fs');
var os = require('os');
var lab = exports.lab = Lab.script();
var lessitizer = require('lessitizer');
var LessImportInserter = require('..');

var bsPath = path.join(__dirname, '../node_modules/bootstrap/less/bootstrap.less');
var bsLess = fs.readFileSync(bsPath, 'utf8');
function toImports(line) { return !line ? '' : '@import "' + line + '";'; }


lab.test('No changes', function (done) {
    var less = new LessImportInserter({
        lessPath: bsPath
    }).build();

    Lab.expect(bsLess).to.equal(less);

    done();
});

lab.test('relativeTo will change all imports', function (done) {
    var less = new LessImportInserter({
        lessPath: bsPath,
        relativeTo: __dirname
    }).build();

    less.split(os.EOL).filter(function (line) {
        return line.indexOf('@import') === 0;
    }).forEach(function (line) {
        Lab.expect(line.indexOf('@import "../node_modules/bootstrap/less/')).to.equal(0);
    });

    done();
});

lab.test('From file with newline at end', function (done) {
    var less = new LessImportInserter({
        lessPath: bsPath,
        relativeTo: __dirname,
        after: {
            'variables.less': ['styles/my-own-variables.less', 'styles/theme.less']
        },
        before: {
            'normalize': 'styles/mixins-2.less'
        },
        append: ['styles/this-is-the-end.less', 'styles/my-only-friend.less']
    }).build();

    var shouldBe = [
        '../node_modules/bootstrap/less/variables.less',
        'styles/my-own-variables.less',
        'styles/theme.less',
        '../node_modules/bootstrap/less/mixins.less',
        'styles/mixins-2.less',
        '../node_modules/bootstrap/less/normalize.less',
        'styles/this-is-the-end.less',
        'styles/my-only-friend.less'
    ];

    // All these should be in there
    shouldBe.forEach(function (line) {
        Lab.expect(toImports(line), line).to.not.equal(-1);
    });

    // Checking order
    var after = shouldBe.slice(0, 4).map(toImports).join(os.EOL) + os.EOL;
    Lab.expect(less.indexOf(after), 'after').to.not.equal(-1);

    var before = shouldBe.slice(4, 6).map(toImports).join(os.EOL) + os.EOL;
    Lab.expect(less.indexOf(before), 'before').to.not.equal(-1);

    var append = os.EOL + shouldBe.slice(-2).map(toImports).join(os.EOL) + os.EOL;
    Lab.expect(less.indexOf(append), 'append').to.not.equal(-1);

    // Newline at end of file
    Lab.expect(less.slice(-1), 'last character newline').to.equal(os.EOL);

    done();
});

lab.test('From string with no newline at end', function (done) {
    var less = new LessImportInserter({
        less: ['variables.less', 'mixins.less', null, 'normalize.less'].map(toImports).join(os.EOL),
        after: {
            'variables.less': ['styles/my-own-variables.less', 'styles/theme.less']
        },
        before: {
            'normalize': 'styles/mixins-2.less'
        },
        append: ['styles/this-is-the-end.less', 'styles/my-only-friend.less']
    }).build();

    var shouldBe = [
        'variables.less',
        'styles/my-own-variables.less',
        'styles/theme.less',
        'mixins.less',
        'styles/mixins-2.less',
        'normalize.less',
        'styles/this-is-the-end.less',
        'styles/my-only-friend.less'
    ];

    shouldBe.forEach(function (line) {
        Lab.expect(toImports(line), line).to.not.equal(-1);
    });

    // Checking order
    var after = shouldBe.slice(0, 4).map(toImports).join(os.EOL) + os.EOL;
    Lab.expect(less.indexOf(after), 'after').to.not.equal(-1);

    var before = shouldBe.slice(4, 6).map(toImports).join(os.EOL) + os.EOL;
    Lab.expect(less.indexOf(before), 'before').to.not.equal(-1);

    var append = os.EOL + shouldBe.slice(-2).map(toImports).join(os.EOL);
    Lab.expect(less.indexOf(append), 'append').to.not.equal(-1);

    // No new newline at end of file
    Lab.expect(less.slice(-1), 'last character newline').to.not.equal(os.EOL);

    done();
});

lab.test('Bootstrap compiles after alterations', function (done) {
    var dir = path.join(__dirname, '..');
    var less = new LessImportInserter({
        lessPath: bsPath,
        relativeTo: dir,
        after: {
            'variables': 'fixtures/variables.less'
        },
        append: 'fixtures/app.less'
    }).build();

    lessitizer({
        files: {
            less: less,
            dir: dir
        }
    }, function (err, css) {
        Lab.expect(err).to.equal(null);
        var bodyFontFamily = [
            'body {',
            '  font-family: Helvetica, Arial, sans-serif;'
        ];
        var appCSS = [
            '.fixture-app-content {',
            '  color: blue;',
            '}'
        ];
        [bodyFontFamily, appCSS].forEach(function (shouldBe) {
            Lab.expect(css[0].indexOf(shouldBe.join('\n'))).to.not.equal(-1);
        });
        done();
    });
});

lab.experiment('Errors', function () {
    lab.test('Error with no options', function (done) {
        Lab.expect(function () {
            new LessImportInserter();
        }).to.throw(Error);

        done();
    });

    lab.test('Error with insufficient options', function (done) {
        Lab.expect(function () {
            new LessImportInserter({});
        }).to.throw(Error);

        done();
    });
});
