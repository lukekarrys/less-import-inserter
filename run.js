var L = require('./index');

var less = [
    '@import "old-theme/variables.less";',
    '@import "plugin/mixins.less";',
    '@import "components.less";',
    '@import "utilities.less";'
];

console.log(new L({
    less: less.join('\n'),
    before: {
        'utilities.less': 'styles/my-utilities.less'
    },
    after: {
        'variables.less': [
            'styles/my-variables.less',
            'styles/app/my-theme.less'
        ],
        'mixins.less': 'styles/my-mixins.less'
    }
}).build());