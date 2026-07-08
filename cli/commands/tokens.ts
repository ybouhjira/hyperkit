/* eslint-disable no-console */
export function tokens() {
  console.log('SolidKit Design Tokens\n');
  console.log('='.repeat(60));

  const tokenGroups = {
    SpaceToken: ['0', 'px', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl'],
    FontSizeToken: ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl'],
    FontWeightToken: ['regular', 'medium', 'semibold', 'bold', 'extrabold', 'black'],
    BgToken: ['primary', 'secondary', 'tertiary', 'elevated', 'accent', 'transparent'],
    TextColorToken: ['primary', 'secondary', 'muted', 'on-accent'],
    RadiusToken: ['sm', 'md', 'lg', 'xl', 'full'],
    ShadowToken: ['sm', 'md', 'lg', 'xl', '2xl', 'inner'],
    ZToken: ['base', 'dropdown', 'sticky', 'overlay', 'modal', 'popover', 'tooltip', 'toast'],
  };

  for (const [name, values] of Object.entries(tokenGroups)) {
    console.log(`\n  ${name}`);
    console.log(`  ${'─'.repeat(40)}`);
    console.log(`  ${values.map((v) => `'${v}'`).join(' | ')}`);
  }

  console.log('\n' + '='.repeat(60));
  console.log(`\nCSS Variables: --sk-space-*, --sk-font-size-*, --sk-radius-*, etc.`);
  console.log(`See documentation for full CSS variable reference.`);
}
