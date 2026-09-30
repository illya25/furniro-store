export default {
  extends: ['stylelint-config-standard-scss'],

  plugins: ['stylelint-order'],

  rules: {
    'order/properties-order': [
      [
        'content',

        {
          emptyLineBefore: 'always',
          noEmptyLineBetween: true,
        },
        'position',
        'top',
        'right',
        'bottom',
        'left',
        'z-index',

        {
          emptyLineBefore: 'always',
          noEmptyLineBetween: true,
        },
        'display',
        'visibility',
        'overflow',

        {
          emptyLineBefore: 'always',
          noEmptyLineBetween: true,
        },
        'box-sizing',
        'width',
        'min-width',
        'max-width',
        'height',
        'min-height',
        'max-height',

        {
          emptyLineBefore: 'always',
          noEmptyLineBetween: true,
        },
        'margin',
        'margin-top',
        'margin-right',
        'margin-bottom',
        'margin-left',
        'padding',
        'padding-top',
        'padding-right',
        'padding-bottom',
        'padding-left',

        {
          emptyLineBefore: 'always',
          noEmptyLineBetween: true,
        },
        'font',
        'font-family',
        'font-size',
        'font-weight',
        'line-height',
        'text-align',
        'text-decoration',
        'text-transform',
        'letter-spacing',
        'color',

        {
          emptyLineBefore: 'always',
          noEmptyLineBetween: true,
        },
        'background',
        'background-color',
        'background-image',
        'background-position',
        'background-size',
        'border',
        'border-radius',

        {
          emptyLineBefore: 'always',
          noEmptyLineBetween: true,
        },
        'opacity',
        'transform',
        'transition',
        'cursor',
        'pointer-events',
      ],
    ],
  },
};
