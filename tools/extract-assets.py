#!/usr/bin/env python3
"""Copy assets out of the reference build (``An Elmwood Trailv3.1.6.apks``) into this project.

The reference build is a React Native app, so its bundled assets live in ``base.apk`` under
Android resource names derived from their original source paths
(``src/assets/suspectboard/wall.png`` -> ``res/drawable-mdpi-v4/src_assets_suspectboard_wall.png``).
``tools/reference-assets.json`` lists every original path; this script maps them back so the
game can ``require()`` them exactly like the original code did.

Usage:
  python3 tools/extract-assets.py                # import the curated set used by the UI
  python3 tools/extract-assets.py --folders mail gallery
  python3 tools/extract-assets.py --sounds button notification ...
  python3 tools/extract-assets.py --all-sounds   # every sound effect (~97 MB)

Fonts are copied to android/app/src/main/assets/fonts and sound effects to
android/app/src/main/res/raw (``sound_<name>.mp3``, loaded by name via react-native-sound).
"""
import argparse
import io
import json
import os
import re
import sys
import zipfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
APKS = os.path.join(ROOT, 'An Elmwood Trailv3.1.6.apks')
MANIFEST = os.path.join(ROOT, 'tools', 'reference-assets.json')
CURATED = os.path.join(ROOT, 'tools', 'curated-assets.json')
FONTS_DIR = os.path.join(ROOT, 'android', 'app', 'src', 'main', 'assets', 'fonts')
RAW_DIR = os.path.join(ROOT, 'android', 'app', 'src', 'main', 'res', 'raw')


def resource_name(path: str) -> str:
    """Mirror react-native's getAndroidResourceIdentifier()."""
    stem = os.path.splitext(path)[0]
    name = stem.lower().replace('/', '_')
    name = re.sub(r'[^a-z0-9_]', '', name)
    return re.sub(r'^assets_', '', name)


def open_base_apk() -> zipfile.ZipFile:
    if not os.path.exists(APKS) or os.path.getsize(APKS) < 1024:
        sys.exit(f'{APKS} is missing or is still a Git LFS pointer; run `git lfs pull` first.')
    outer = zipfile.ZipFile(APKS)
    return zipfile.ZipFile(io.BytesIO(outer.read('base.apk')))


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--folders', nargs='*', help='asset folders (under src/assets) to import')
    parser.add_argument('--files', nargs='*', help='individual original paths to import')
    parser.add_argument('--sounds', nargs='*', help='sound effect names (without .mp3) to import')
    parser.add_argument('--all-sounds', action='store_true')
    parser.add_argument('--fonts', nargs='*', help='font file names to import')
    args = parser.parse_args()

    manifest = json.load(open(MANIFEST))
    curated = json.load(open(CURATED))
    explicit = any(v for v in (args.folders, args.files, args.sounds, args.fonts)) or args.all_sounds
    folders = set(args.folders or ([] if explicit else curated['folders']))
    files = set(args.files or ([] if explicit else curated['files']))
    sounds = set(args.sounds or ([] if explicit else curated['sounds']))
    fonts = set(args.fonts or ([] if explicit else curated['fonts']))

    apk = open_base_apk()
    names = set(apk.namelist())
    copied = 0

    for entry in manifest:
        path = entry['path']
        folder = os.path.dirname(path)[len('src/assets/'):] if path.count('/') > 2 else ''
        if path not in files and not any(folder == f or folder.startswith(f + '/') for f in folders):
            continue
        ext = os.path.splitext(path)[1]
        res = resource_name(path)
        candidates = [f'res/drawable-mdpi-v4/{res}{ext}', f'res/raw/{res}{ext}']
        src = next((c for c in candidates if c in names), None)
        if not src:
            print(f'  ! not found in APK: {path}')
            continue
        dest = os.path.join(ROOT, path)
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        with open(dest, 'wb') as fh:
            fh.write(apk.read(src))
        copied += 1

    raw_sounds = sorted(n for n in names if n.startswith('res/raw/sound_') and n.endswith('.mp3'))
    os.makedirs(RAW_DIR, exist_ok=True)
    for entry in raw_sounds:
        sound = entry[len('res/raw/sound_'):-len('.mp3')]
        if args.all_sounds or sound in sounds:
            with open(os.path.join(RAW_DIR, os.path.basename(entry)), 'wb') as fh:
                fh.write(apk.read(entry))
            copied += 1
    missing = sounds - {e[len('res/raw/sound_'):-len('.mp3')] for e in raw_sounds}
    for s in sorted(missing):
        print(f'  ! sound not found in APK: {s}')

    os.makedirs(FONTS_DIR, exist_ok=True)
    for font in sorted(fonts):
        src = f'assets/fonts/{font}'
        if src not in names:
            print(f'  ! font not found in APK: {font}')
            continue
        with open(os.path.join(FONTS_DIR, font), 'wb') as fh:
            fh.write(apk.read(src))
        copied += 1

    print(f'Imported {copied} files.')


if __name__ == '__main__':
    main()
