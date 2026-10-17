/**
 * Keeps the approved light design on every Android phone.
 * Some phones (e.g. Xiaomi/HyperOS, Samsung "dark mode for apps", Android's force-dark option)
 * repaint light apps dark unless the app opts out — that turns the UI black and white.
 */
const { withAndroidStyles, AndroidConfig } = require('expo/config-plugins');

module.exports = function withLightAppearance(config) {
  return withAndroidStyles(config, (c) => {
    const parent = AndroidConfig.Styles.getAppThemeGroup();
    for (const [name, value] of [
      ['android:forceDarkAllowed', 'false'],
      ['android:windowBackground', '@android:color/white'],
      ['android:windowLightStatusBar', 'true'],
    ]) {
      c.modResults = AndroidConfig.Styles.assignStylesValue(c.modResults, { add: true, parent, name, value });
    }
    return c;
  });
};
