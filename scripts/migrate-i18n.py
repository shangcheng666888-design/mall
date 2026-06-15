#!/usr/bin/env python3
"""Convert mall lang === 'zh' ? zh : en ternaries to tr(lang, { zh, en, de, ja, ... })."""
from __future__ import annotations

import json
import re
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / 'src'
CACHE_FILE = Path(__file__).resolve().parent / 'i18n-cache.json'

TERNARY_PATTERNS = [
    re.compile(
        r"lang\s*===\s*['\"]zh['\"]\s*\?\s*"
        r"('(?:\\'|[^'])*'|\"(?:\\\"|[^\"])*\")\s*:\s*"
        r"('(?:\\'|[^'])*'|\"(?:\\\"|[^\"])*\")"
    ),
    re.compile(
        r"lang\s*===\s*['\"]zh['\"]\s*\n\s*\?\s*"
        r"('(?:\\'|[^'])*'|\"(?:\\\"|[^\"])*\")\s*\n\s*:\s*\n?\s*"
        r"('(?:\\'|[^'])*'|\"(?:\\\"|[^\"])*\")"
    ),
    re.compile(
        r"lang\s*===\s*['\"]zh['\"]\s*\?\s*\n\s*"
        r"('(?:\\'|[^'])*'|\"(?:\\\"|[^\"])*\")\s*\n\s*:\s*\n\s*"
        r"('(?:\\'|[^'])*'|\"(?:\\\"|[^\"])*\")"
    ),
]

SKIP_FILES = {'lang.ts', 'tr.ts', 'zhConvert.ts', 'index.ts'}
LANG_TARGETS = ['de', 'ja', 'ko', 'es', 'it', 'vi', 'fr']

try:
    from deep_translator import GoogleTranslator
except ImportError:
    GoogleTranslator = None  # type: ignore

_cache: dict[str, dict[str, str]] = {}


def load_cache() -> None:
    global _cache
    if CACHE_FILE.exists():
        _cache = json.loads(CACHE_FILE.read_text(encoding='utf-8'))


def save_cache() -> None:
    CACHE_FILE.write_text(json.dumps(_cache, ensure_ascii=False, indent=2), encoding='utf-8')


def unquote(s: str) -> str:
    if s.startswith("'"):
        return s[1:-1].replace("\\'", "'").replace('\\\\', '\\')
    return s[1:-1].replace('\\"', '"').replace('\\\\', '\\')


def js_quote(s: str) -> str:
    return "'" + s.replace('\\', '\\\\').replace("'", "\\'") + "'"


def translate_from_en(en: str, target: str) -> str:
    if not en:
        return en
    bucket = _cache.setdefault(target, {})
    if en in bucket:
        return bucket[en]
    if GoogleTranslator is None:
        bucket[en] = en
        return en
    try:
        result = GoogleTranslator(source='en', target=target).translate(en)
        time.sleep(0.03)
        if not result:
            result = en
    except Exception:
        result = en
    bucket[en] = result
    if len(bucket) % 50 == 0:
        save_cache()
    return result


def build_tr_call(zh_raw: str, en_raw: str) -> str:
    zh = unquote(zh_raw)
    en = unquote(en_raw)
    parts = [f"zh: {js_quote(zh)}", f"en: {js_quote(en)}"]
    for target in LANG_TARGETS:
        parts.append(f"{target}: {js_quote(translate_from_en(en, target))}")
    return f"tr(lang, {{ {', '.join(parts)} }})"


def apply_ternary_replacements(content: str) -> str:
    for pattern in TERNARY_PATTERNS:
        content = pattern.sub(lambda m: build_tr_call(m.group(1), m.group(2)), content)
    return content


def ensure_tr_import(content: str, depth: int) -> str:
    if 'tr(lang,' not in content:
        return content
    if re.search(r"import\s*\{[^}]*\btr\b", content):
        return content
    prefix = '../' * depth + 'i18n'
    import_line = f"import {{ tr }} from '{prefix}'\n"
    imports = list(re.finditer(r'^import .+$', content, re.MULTILINE))
    if imports:
        pos = imports[-1].end()
        return content[:pos] + '\n' + import_line + content[pos:]
    return import_line + content


def process_file(path: Path) -> bool:
    original = path.read_text(encoding='utf-8')
    content = apply_ternary_replacements(original)
    content = content.replace("'zh' | 'en'", 'Lang')
    content = content.replace('"zh" | "en"', 'Lang')
    if content != original:
        depth = len(path.relative_to(ROOT).parts) - 1
        content = ensure_tr_import(content, depth)
        path.write_text(content, encoding='utf-8')
        return True
    return False


def main() -> None:
    load_cache()
    changed = 0
    for path in sorted(ROOT.rglob('*')):
        if path.suffix not in ('.ts', '.tsx'):
            continue
        if path.name in SKIP_FILES or 'i18n' in path.parts:
            continue
        if process_file(path):
            changed += 1
            print(f'updated: {path.relative_to(ROOT.parent)}')
    save_cache()
    print(f'done: {changed} files')


if __name__ == '__main__':
    main()
