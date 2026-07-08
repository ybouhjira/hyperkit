import noHardcodedColors from './rules/no-hardcoded-colors';
import noHardcodedFontSize from './rules/no-hardcoded-font-size';
import noHardcodedSpacing from './rules/no-hardcoded-spacing';
import noImportant from './rules/no-important';
import requireKeyedShow from './rules/require-keyed-show';
import noPropsAssignOutsideJsx from './rules/no-props-assign-outside-jsx';

const plugin = {
  rules: {
    'no-hardcoded-colors': noHardcodedColors,
    'no-hardcoded-font-size': noHardcodedFontSize,
    'no-hardcoded-spacing': noHardcodedSpacing,
    'no-important': noImportant,
    'require-keyed-show': requireKeyedShow,
    'no-props-assign-outside-jsx': noPropsAssignOutsideJsx,
  },
};

export default plugin;
