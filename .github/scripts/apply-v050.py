from pathlib import Path


def replace_exact(path, old, new, count=1):
    p = Path(path)
    s = p.read_text(encoding='utf-8')
    if old not in s:
        raise SystemExit(f'Expected text not found in {path}: {old[:160]!r}')
    p.write_text(s.replace(old, new, count), encoding='utf-8')


p = Path('index.html')
s = p.read_text(encoding='utf-8')
s = s.replace("X2_ALTYN_BUILD = '0.4.9'", "X2_ALTYN_BUILD = '0.5.0'")
s = s.replace('?v=0.4.9', '?v=0.5.0')
s = s.replace('v0.4.9', 'v0.5.0')
p.write_text(s, encoding='utf-8')

replace_exact('src/config.js', "version: '0.4.9'", "version: '0.5.0'")
replace_exact('src/game.js', '    khanModelScale: 0.98,', '    khanModelScale: 1.08,')
replace_exact('src/game.js', '    scene.imageProcessingConfiguration.exposure = 1.02;', '    scene.imageProcessingConfiguration.exposure = 1.08;')
replace_exact('src/game.js', '    scene.imageProcessingConfiguration.contrast = 1.04;', '    scene.imageProcessingConfiguration.contrast = 1.02;')
replace_exact('src/game.js', '    hemi.intensity = 0.88;', '    hemi.intensity = 1.00;')
replace_exact('src/game.js', '    hemi.groundColor = new BABYLON.Color3(0.20, 0.19, 0.18);', '    hemi.groundColor = new BABYLON.Color3(0.28, 0.27, 0.25);')
replace_exact('src/game.js', '    sun.intensity = 1.66;', '    sun.intensity = 1.58;')
replace_exact('src/game.js', "  function brightenImportedVisualMaterials(kind, meshes, suffix) {\n    if (kind !== 'khan' && kind !== 'saka') return;", "  function brightenImportedVisualMaterials(kind, meshes, suffix) {")

replace_exact(
    'src/game.js',
    """    const warm = kind === 'khan';
    const factor = warm ? 1.24 : 1.18;
    const lift = warm ? 0.028 : 0.020;
""",
    """    const warm = kind === 'khan';
    const neutral = kind === 'chuko';
    const factor = warm ? 1.36 : (neutral ? 1.14 : 1.22);
    const lift = warm ? 0.045 : (neutral ? 0.018 : 0.024);
"""
)

replace_exact(
    'src/game.js',
    """    const emissiveLift = warm
      ? new BABYLON.Color3(0.11, 0.075, 0.028)
      : new BABYLON.Color3(0.035, 0.055, 0.11);
""",
    """    const emissiveLift = warm
      ? new BABYLON.Color3(0.18, 0.125, 0.045)
      : (neutral
          ? new BABYLON.Color3(0.030, 0.026, 0.020)
          : new BABYLON.Color3(0.045, 0.065, 0.12));
"""
)

replace_exact(
    'src/game.js',
    """    if ('roughness' in clone && Number.isFinite(clone.roughness)) clone.roughness = Math.max(0.16, clone.roughness * 0.88);
    if ('metallic' in clone && Number.isFinite(clone.metallic) && warm) clone.metallic = Math.max(clone.metallic, 0.22);
""",
    """    if ('roughness' in clone && Number.isFinite(clone.roughness)) clone.roughness = Math.max(warm ? 0.13 : 0.16, clone.roughness * (warm ? 0.78 : 0.88));
    if ('metallic' in clone && Number.isFinite(clone.metallic) && warm) clone.metallic = Math.max(clone.metallic, 0.34);
"""
)

Path('BUILD.txt').write_text(
    'ORDO / ALTYN KHAN 3D build: 0.5.0\n'
    'Visual-only polish: KHAN +~10% size and brighter gold material\n'
    'Cross-device lighting: brighter hemispheric fill, slightly lower contrast, mild GLB material lift for all pieces\n'
    'Physics/scenarios/ballistics/LMS logic unchanged from v0.4.9\n',
    encoding='utf-8'
)
