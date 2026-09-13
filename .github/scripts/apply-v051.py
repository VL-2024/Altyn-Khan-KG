from pathlib import Path


def replace_exact(path, old, new, count=1):
    p = Path(path)
    s = p.read_text(encoding='utf-8')
    if old not in s:
        raise SystemExit(f'Expected text not found in {path}: {old[:180]!r}')
    p.write_text(s.replace(old, new, count), encoding='utf-8')


# Version + cache busting.
p = Path('index.html')
s = p.read_text(encoding='utf-8')
if "X2_ALTYN_BUILD = '0.5.0'" not in s:
    raise SystemExit('Expected build 0.5.0 in index.html')
s = s.replace("X2_ALTYN_BUILD = '0.5.0'", "X2_ALTYN_BUILD = '0.5.1'")
s = s.replace('?v=0.5.0', '?v=0.5.1')
s = s.replace('v0.5.0', 'v0.5.1')
p.write_text(s, encoding='utf-8')

replace_exact('src/config.js', "version: '0.5.0'", "version: '0.5.1'")

# Explicit Android visual profile. iPhone/default keeps v0.5.0 rendering.
replace_exact(
    'src/game.js',
    "  const DICT = window.CHUKO_I18N || { RU: {} };\n",
    "  const DICT = window.CHUKO_I18N || { RU: {} };\n  const ANDROID_VISUAL_BOOST = /Android/i.test(navigator.userAgent);\n"
)

replace_exact(
    'src/game.js',
    """    const warm = kind === 'khan';
    const neutral = kind === 'chuko';
    const factor = warm ? 1.36 : (neutral ? 1.14 : 1.22);
    const lift = warm ? 0.045 : (neutral ? 0.018 : 0.024);
""",
    """    const warm = kind === 'khan';
    const neutral = kind === 'chuko';
    const android = ANDROID_VISUAL_BOOST;
    const factor = android
      ? (warm ? 1.52 : (neutral ? 1.27 : 1.34))
      : (warm ? 1.36 : (neutral ? 1.14 : 1.22));
    const lift = android
      ? (warm ? 0.070 : (neutral ? 0.035 : 0.042))
      : (warm ? 0.045 : (neutral ? 0.018 : 0.024));
"""
)

replace_exact(
    'src/game.js',
    "clone.albedoTexture.level = (clone.albedoTexture.level || 1) * (warm ? 1.10 : 1.08);",
    "clone.albedoTexture.level = (clone.albedoTexture.level || 1) * (warm ? 1.10 : 1.08) * (android ? 1.10 : 1);"
)
replace_exact(
    'src/game.js',
    "clone.diffuseTexture.level = (clone.diffuseTexture.level || 1) * (warm ? 1.10 : 1.08);",
    "clone.diffuseTexture.level = (clone.diffuseTexture.level || 1) * (warm ? 1.10 : 1.08) * (android ? 1.10 : 1);"
)

replace_exact(
    'src/game.js',
    """    const emissiveLift = warm
      ? new BABYLON.Color3(0.18, 0.125, 0.045)
      : (neutral
          ? new BABYLON.Color3(0.030, 0.026, 0.020)
          : new BABYLON.Color3(0.045, 0.065, 0.12));
""",
    """    const emissiveLift = android
      ? (warm
          ? new BABYLON.Color3(0.22, 0.15, 0.055)
          : (neutral
              ? new BABYLON.Color3(0.050, 0.044, 0.034)
              : new BABYLON.Color3(0.060, 0.082, 0.145)))
      : (warm
          ? new BABYLON.Color3(0.18, 0.125, 0.045)
          : (neutral
              ? new BABYLON.Color3(0.030, 0.026, 0.020)
              : new BABYLON.Color3(0.045, 0.065, 0.12)));
"""
)

# Android-only scene lift. Default/iOS stays exactly at v0.5.0 values.
replace_exact(
    'src/game.js',
    '    scene.imageProcessingConfiguration.exposure = 1.08;\n    scene.imageProcessingConfiguration.contrast = 1.02;',
    '    scene.imageProcessingConfiguration.exposure = ANDROID_VISUAL_BOOST ? 1.20 : 1.08;\n    scene.imageProcessingConfiguration.contrast = ANDROID_VISUAL_BOOST ? 0.96 : 1.02;'
)
replace_exact('src/game.js', '    hemi.intensity = 1.00;', '    hemi.intensity = ANDROID_VISUAL_BOOST ? 1.22 : 1.00;')
replace_exact(
    'src/game.js',
    '    hemi.groundColor = new BABYLON.Color3(0.28, 0.27, 0.25);',
    '    hemi.groundColor = ANDROID_VISUAL_BOOST\n      ? new BABYLON.Color3(0.40, 0.38, 0.34)\n      : new BABYLON.Color3(0.28, 0.27, 0.25);'
)
replace_exact('src/game.js', '    sun.intensity = 1.58;', '    sun.intensity = ANDROID_VISUAL_BOOST ? 1.48 : 1.58;')
replace_exact(
    'src/game.js',
    '    sun.diffuse = new BABYLON.Color3(1.0, 0.90, 0.72);\n\n    const shadowMapSize',
    """    sun.diffuse = new BABYLON.Color3(1.0, 0.90, 0.72);

    // Samsung/Android browsers can render the WebGL layer visibly darker than
    // iOS Safari. Add a camera-side fill only on Android so iPhone keeps the
    // approved v0.5.0 look while dark GLB faces on Android remain readable.
    if (ANDROID_VISUAL_BOOST) {
      const androidFill = new BABYLON.DirectionalLight(
        'android-fill',
        new BABYLON.Vector3(0.0, -0.62, -0.78),
        scene
      );
      androidFill.position = new BABYLON.Vector3(0, 6, 6);
      androidFill.intensity = 0.52;
      androidFill.diffuse = new BABYLON.Color3(1.0, 0.96, 0.88);
      androidFill.specular = new BABYLON.Color3(0.55, 0.53, 0.48);
    }

    const shadowMapSize"""
)

Path('BUILD.txt').write_text(
    'ORDO / ALTYN KHAN 3D build: 0.5.1\n'
    'Android/Samsung visual profile: stronger exposure and ambient fill, lower contrast\n'
    'Android-only camera-side fill light and brighter GLB material response\n'
    'iPhone/default rendering remains at v0.5.0 values\n'
    'KHAN remains +~10% visual size; physics/scenarios/ballistics/LMS unchanged\n',
    encoding='utf-8'
)
