#!/usr/bin/env python3
"""Download + read server for the audit deliverables.

Why this exists: the Arena preview runs inside an iframe that has no download
permission, so a plain `download` link silently does nothing. Every link here
therefore opens in a NEW TAB (escaping the iframe) and offers:

    /            styled index (Open / Read / Raw / Download per file)
    /view/<f>    markdown rendered as a readable HTML page   (inline)
    /raw/<f>     markdown as plain text                      (inline)
    /download/<f>  forced download                            (attachment)
    /stages/<id>.txt   one paste-ready stage prompt per file   (inline text)

Bind: 0.0.0.0:8080 -> exposed as the clickable live preview.
"""
import html
import io
import os
import re
import zipfile
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import unquote

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PDF = 'PORTFOLIO-AUDIT-AND-FIX-PLAN.pdf'
BRIEF = 'PORTFOLIO-MASTER-BRIEF.md'
STAGES = 'PORTFOLIO-STAGE-PROMPTS.md'
DOCS = [PDF, BRIEF, STAGES]
ZIP_NAME = 'portfolio-audit-docs.zip'
PORT = 8080

DESCR = {
    PDF: 'Everything in one printable file — 27 pages with a contents page and bookmarks.',
    BRIEF: 'Part A — context, findings register (A1-A4, T1-T35), measured numbers, corrections C1-C3, image truth table.',
    STAGES: 'Part B — the 11 stage prompts (S0-S10) plus the session opener.',
}

# ---------------------------------------------------------------- stage split

def stage_blocks():
    """Extract each fenced ```text block from Part B -> {'S0': 'text', ...}."""
    path = os.path.join(ROOT, STAGES)
    if not os.path.exists(path):
        return {}
    src = open(path, encoding='utf-8').read()
    out = {}
    for chunk in re.split(r'\n## ', src):
        head = chunk.split('\n', 1)[0]
        m = re.match(r'^(S\d+|SESSION OPENER)\b', head)
        if not m:
            continue
        fence = re.search(r'```+text\n(.*?)\n```+', chunk, re.S)
        if fence:
            key = 'SESSION-OPENER' if m.group(1) == 'SESSION OPENER' else m.group(1)
            out[key] = fence.group(1).strip() + '\n'
    return out


def stage_list():
    blocks = stage_blocks()
    order = ['SESSION-OPENER'] + ['S%d' % i for i in range(11)]
    return [(k, blocks[k]) for k in order if k in blocks]


# ---------------------------------------------------------------- markdown

def md_inline(s):
    s = html.escape(s, quote=False)
    s = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', s)
    s = re.sub(r'(?<!\*)\*([^*]+)\*(?!\*)', r'<em>\1</em>', s)
    s = re.sub(r'`([^`]+)`', r'<code>\1</code>', s)
    return s


def md_to_html(md):
    out, i = [], 0
    lines = md.split('\n')
    while i < len(lines):
        line = lines[i]
        s = line.strip()
        if re.match(r'^`{3,}', s):
            fence = re.match(r'^(`{3,})', s).group(1)
            i += 1
            buf = []
            while i < len(lines) and not lines[i].strip().startswith(fence):
                buf.append(lines[i])
                i += 1
            i += 1
            out.append('<pre>%s</pre>' % html.escape('\n'.join(buf)))
            continue
        if s.startswith('|') and i + 1 < len(lines) and re.match(r'^\|[\s:|-]+\|$', lines[i + 1].strip()):
            rows = []
            while i < len(lines) and lines[i].strip().startswith('|'):
                if not re.match(r'^\|[\s:|-]+\|$', lines[i].strip()):
                    rows.append([c.strip() for c in lines[i].strip().strip('|').split('|')])
                i += 1
            head, *body = rows
            t = '<table><thead><tr>' + ''.join('<th>%s</th>' % md_inline(c) for c in head) + '</tr></thead><tbody>'
            for r in body:
                t += '<tr>' + ''.join('<td>%s</td>' % md_inline(c) for c in r) + '</tr>'
            out.append(t + '</tbody></table>')
            continue
        m = re.match(r'^(#{1,4})\s+(.*)$', s)
        if m:
            lvl = len(m.group(1))
            out.append('<h%d>%s</h%d>' % (lvl, md_inline(m.group(2)), lvl))
            i += 1
            continue
        if re.match(r'^(-{3,}|\*{3,})$', s):
            out.append('<hr>')
            i += 1
            continue
        if s.startswith('> '):
            buf = []
            while i < len(lines) and lines[i].strip().startswith('>'):
                buf.append(lines[i].strip().lstrip('>').strip())
                i += 1
            out.append('<blockquote>%s</blockquote>' % md_inline(' '.join(buf)))
            continue
        mb = re.match(r'^(\s*)[-*]\s+(.*)$', line)
        if mb:
            items = []
            while i < len(lines) and re.match(r'^(\s*)[-*]\s+', lines[i]):
                items.append(md_inline(re.sub(r'^(\s*)[-*]\s+', '', lines[i])))
                i += 1
            out.append('<ul>' + ''.join('<li>%s</li>' % x for x in items) + '</ul>')
            continue
        mo = re.match(r'^(\s*)(\d+)\.\s+(.*)$', line)
        if mo:
            items = []
            while i < len(lines) and re.match(r'^(\s*)\d+\.\s+', lines[i]):
                items.append(md_inline(re.sub(r'^(\s*)\d+\.\s+', '', lines[i])))
                i += 1
            out.append('<ol>' + ''.join('<li>%s</li>' % x for x in items) + '</ol>')
            continue
        if not s:
            i += 1
            continue
        buf = [s]
        i += 1
        while i < len(lines) and lines[i].strip() and not re.match(r'^(#{1,4}\s|`{3,}|\||>|\s*[-*]\s|\s*\d+\.\s|-{3,}$)', lines[i].strip()):
            buf.append(lines[i].strip())
            i += 1
        out.append('<p>%s</p>' % md_inline(' '.join(buf)))
    return '\n'.join(out)


# ---------------------------------------------------------------- pages

STYLE = """
:root{--ivory:#F6F2E8;--paper:#FFFCF5;--ink:#10162B;--indigo:#5A4BD4;--cyan:#27D3F2;--muted:#5B6474;--lime:#C7F36B}
*{box-sizing:border-box}
body{margin:0;background:var(--ivory);color:var(--ink);font:16px/1.6 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
.wrap{max-width:900px;margin:0 auto;padding:44px 20px 80px}
.mono{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:var(--muted)}
h1{font-size:clamp(1.7rem,4.6vw,2.5rem);line-height:1.06;margin:10px 0 8px;letter-spacing:-.03em}
.lede{color:var(--muted);margin:0 0 26px;max-width:64ch}
.group{margin:28px 0 10px;font-weight:700;letter-spacing:-.01em;font-size:1.05rem}
.card{background:var(--paper);border:1px solid rgba(16,22,43,.12);border-radius:16px;padding:16px 18px;margin-bottom:12px}
.card .name{font-weight:700;word-break:break-word}
.card .desc{color:var(--muted);font-size:14px;margin:2px 0 10px}
.btns{display:flex;flex-wrap:wrap;gap:8px}
a.btn{display:inline-block;text-decoration:none;font-weight:700;font-size:13px;padding:9px 15px;border-radius:999px;border:1px solid rgba(16,22,43,.18);color:var(--ink);background:#fff;transition:background .2s,color .2s,border-color .2s}
a.btn:hover{border-color:var(--indigo)}
a.btn.primary{background:var(--indigo);color:#fff;border-color:var(--indigo)}
a.btn.ghost{background:transparent}
.note{margin-top:24px;border-left:3px solid var(--lime);padding:12px 16px;background:var(--paper);border-radius:0 12px 12px 0;font-size:14px;color:var(--muted)}
code{font-family:ui-monospace,monospace;font-size:.9em;background:rgba(16,22,43,.07);padding:1px 5px;border-radius:4px}
/* document view */
.doc{background:var(--paper);border:1px solid rgba(16,22,43,.12);border-radius:16px;padding:clamp(18px,3vw,34px)}
.doc h1{font-size:1.7rem}.doc h2{font-size:1.3rem;margin:26px 0 10px;border-top:1px solid rgba(16,22,43,.12);padding-top:18px}
.doc h3{font-size:1.08rem;margin:20px 0 8px;color:var(--indigo)}
.doc h4{font-size:.98rem;margin:16px 0 6px}
.doc p{margin:0 0 11px;font-size:15px}
.doc ul,.doc ol{margin:0 0 12px;padding-left:22px;font-size:15px}
.doc li{margin:3px 0}
.doc table{border-collapse:collapse;width:100%;margin:10px 0 16px;font-size:13.5px}
.doc th,.doc td{border:1px solid rgba(16,22,43,.16);padding:6px 8px;text-align:left;vertical-align:top}
.doc th{background:rgba(16,22,43,.05)}
.doc pre{background:#F1F1F7;border:1px solid #D9D9E3;border-radius:10px;padding:12px;overflow-x:auto;font-family:ui-monospace,monospace;font-size:12.5px;line-height:1.45;white-space:pre-wrap;word-break:break-word}
.doc blockquote{margin:10px 0 14px;padding:10px 14px;background:#F7F5EF;border-left:3px solid var(--indigo);border-radius:0 10px 10px 0;font-size:14.5px;color:#33394A}
.doc hr{border:0;border-top:1px solid rgba(16,22,43,.14);margin:20px 0}
.bar{position:sticky;top:0;background:rgba(246,242,232,.94);backdrop-filter:blur(6px);padding:10px 0 12px;margin-bottom:14px;display:flex;gap:8px;flex-wrap:wrap;align-items:center}
textarea{width:100%;min-height:62vh;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12.5px;line-height:1.5;border:1px solid rgba(16,22,43,.16);border-radius:12px;padding:14px;background:var(--paper);color:var(--ink);white-space:pre;overflow:auto}
"""


def page(title, body):
    return ('<!doctype html><html lang="en"><head><meta charset="utf-8">'
            '<meta name="viewport" content="width=device-width, initial-scale=1">'
            '<title>%s</title><style>%s</style></head><body><div class="wrap">%s</div></body></html>'
            % (html.escape(title), STYLE, body))


def index_html():
    def card(name, desc, buttons):
        return ('<div class="card"><div class="name">%s</div><div class="desc">%s</div>'
                '<div class="btns">%s</div></div>' % (html.escape(name), html.escape(desc), ''.join(buttons)))

    pdf_b = ['<a class="btn primary" href="/raw/%s" target="_self">Open here</a>' % PDF,
             '<a class="btn" href="/raw/%s" target="_blank" rel="noopener">New tab</a>' % PDF,
             '<a class="btn" href="/download/%s" target="_blank" rel="noopener">Download</a>' % PDF]
    brief_b = ['<a class="btn primary" href="/view/%s" target="_self">Read here</a>' % BRIEF,
               '<a class="btn" href="/view/%s" target="_blank" rel="noopener">New tab</a>' % BRIEF,
               '<a class="btn" href="/raw/%s" target="_blank" rel="noopener">Plain text</a>' % BRIEF,
               '<a class="btn" href="/download/%s" target="_blank" rel="noopener">Download</a>' % BRIEF]
    stages_b = ['<a class="btn primary" href="/view/%s" target="_self">Read here</a>' % STAGES,
                '<a class="btn" href="/view/%s" target="_blank" rel="noopener">New tab</a>' % STAGES,
                '<a class="btn" href="/raw/%s" target="_blank" rel="noopener">Plain text</a>' % STAGES,
                '<a class="btn" href="/download/%s" target="_blank" rel="noopener">Download</a>' % STAGES]

    stage_rows = []
    for key, text in stage_list():
        title = 'Session opener' if key == 'SESSION-OPENER' else 'Stage %s' % key
        head = text.split('\n', 1)[0].strip()
        stage_rows.append(
            '<div class="card"><div class="name">%s &nbsp;<code style="font-size:12px">%s</code></div>'
            '<div class="desc">%s &nbsp;·&nbsp; %d lines</div>'
            '<div class="btns">'
            '<a class="btn primary" href="/stage/%s" target="_self">Open here to copy</a>'
            '<a class="btn" href="/stages/%s.txt" target="_blank" rel="noopener">New tab</a>'
            '<a class="btn" href="/download/stages/%s.txt" target="_blank" rel="noopener">Download .txt</a>'
            '</div></div>'
            % (title, html.escape(key), html.escape(head[:110]), text.count('\n') + 1, key, key, key))

    return page('Portfolio audit — downloads', """
<div class="mono">&sect; Portfolio audit &middot; deliverables</div>
<h1>Audit &amp; fix plan — read or download</h1>
<p class="lede">Generated for <strong>portfolio-arena</strong> (commit 85f12aa). <strong>Open here</strong> shows the
content inside this preview (works even when the frame blocks downloads). <strong>New tab</strong> escapes the frame —
that is where a real download happens.</p>

<div class="group">Documents</div>
%s
%s
%s
%s

<div class="group">Stage prompts — one file each, ready to copy into the chat</div>
<p class="lede">Press <strong>Open here to copy</strong>, click inside the box, then
<strong>Ctrl/Cmd&nbsp;+&nbsp;A</strong> and <strong>Ctrl/Cmd&nbsp;+&nbsp;C</strong> — the text is plain and complete.</p>
%s

<div class="note"><strong>Downloads blocked?</strong> That is the preview frame, not the file: it is sandboxed
without download permission. Use <strong>Open here</strong> to read and copy, or open the preview URL itself in a real
browser tab / re-open the preview and use the &ldquo;open in new tab&rdquo; control, where the download buttons behave
normally. The archive with all three documents is
<a href="/download/%s" target="_blank" rel="noopener">%s</a>.</div>
""" % (card(PDF, DESCR[PDF], pdf_b), card(BRIEF, DESCR[BRIEF], brief_b), card(STAGES, DESCR[STAGES], stages_b),
       card(ZIP_NAME, 'All three documents in one archive.', ['<a class="btn primary" href="/download/%s" target="_blank" rel="noopener">Download ZIP</a>' % ZIP_NAME]),
       ''.join(stage_rows), ZIP_NAME, ZIP_NAME))


def stage_page(key, text):
    return page('Stage %s — copy' % key, """
<div class="mono">&sect; Stage prompt %s</div>
<h1>%s</h1>
<p class="lede">Click inside the box below, press <strong>Ctrl/Cmd&nbsp;+&nbsp;A</strong> then <strong>Ctrl/Cmd&nbsp;+&nbsp;C</strong>,
then paste into the chat. Same text as the download.</p>
<div class="bar"><a class="btn" href="/" target="_self">Back</a>
<a class="btn" href="/stages/%s.txt" target="_blank" rel="noopener">New tab</a>
<a class="btn" href="/download/stages/%s.txt" target="_blank" rel="noopener">Download .txt</a></div>
<textarea readonly spellcheck="false" onclick="this.select()">%s</textarea>
""" % (key, key, key, key, html.escape(text)))


# ---------------------------------------------------------------- payloads

def make_zip():
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, 'w', zipfile.ZIP_DEFLATED) as z:
        for f in DOCS:
            p = os.path.join(ROOT, f)
            if os.path.exists(p):
                z.write(p, arcname=f)
        for key, text in stage_list():
            z.writestr('stages/%s.txt' % key, text)
    return buf.getvalue()


class Handler(BaseHTTPRequestHandler):
    protocol_version = 'HTTP/1.1'
    server_version = 'audit-files/1.0'

    def log_message(self, fmt, *args):
        print('%s - %s' % (self.address_string(), fmt % args), flush=True)

    def _send(self, body, ctype, head, filename=None, inline=True):
        self.send_response(200)
        self.send_header('Content-Type', ctype)
        if filename:
            disp = 'inline' if inline else 'attachment'
            self.send_header('Content-Disposition', '%s; filename="%s"' % (disp, filename))
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Cache-Control', 'no-store')
        self.end_headers()
        if not head:
            self.wfile.write(body)

    def do_HEAD(self):
        self.route(head=True)

    def do_GET(self):
        self.route(head=False)

    def route(self, head=False):
        parts = [unquote(p) for p in self.path.split('?')[0].split('/') if p]
        if not parts:
            return self._send(index_html().encode(), 'text/html; charset=utf-8', head)
        mode, rest = parts[0], parts[1:]

        # /stages/S0.txt
        if mode == 'stages' and rest:
            key = rest[0].replace('.txt', '')
            blocks = stage_blocks()
            if key in blocks:
                return self._send(blocks[key].encode(), 'text/plain; charset=utf-8', head,
                                  filename='%s.txt' % key)
            return self.send_error(404, 'Unknown stage')

        # /stage/S0  -> in-frame copy page with the full prompt in a textarea
        if mode == 'stage' and rest:
            key = rest[0].replace('.txt', '')
            blocks = stage_blocks()
            if key in blocks:
                return self._send(stage_page(key, blocks[key]).encode(), 'text/html; charset=utf-8', head)
            return self.send_error(404, 'Unknown stage')

        if not rest:
            return self.send_error(404, 'Not found')
        name = rest[0]

        # /view/<pdf>
        if mode == 'view' and name == PDF:
            body = page(PDF, '<div class="bar"><a class="btn" href="/download/%s" target="_blank" rel="noopener">Download</a>'
                             '<a class="btn ghost" href="/" target="_self">Back</a></div>'
                             '<iframe src="/raw/%s" style="width:100%%;height:78vh;border:1px solid rgba(16,22,43,.16);border-radius:12px;background:#fff"></iframe>'
                             % (PDF, PDF)).encode()
            return self._send(body, 'text/html; charset=utf-8', head)

        # /view/<md>  -> rendered reading page
        if mode == 'view' and name in (BRIEF, STAGES):
            md = open(os.path.join(ROOT, name), encoding='utf-8').read()
            body = page(name, '<div class="bar"><a class="btn" href="/raw/%s" target="_blank" rel="noopener">Plain text</a>'
                              '<a class="btn" href="/download/%s" target="_blank" rel="noopener">Download</a>'
                              '<a class="btn ghost" href="/" target="_self">Back</a></div>'
                              '<div class="doc">%s</div>' % (name, name, md_to_html(md))).encode()
            return self._send(body, 'text/html; charset=utf-8', head)

        # /raw/<file>
        if mode == 'raw' and name in DOCS:
            target = os.path.join(ROOT, name)
            if not os.path.isfile(target):
                return self.send_error(404, 'Missing file')
            if name == PDF:
                return self._send(open(target, 'rb').read(), 'application/pdf', head, filename=name)
            return self._send(open(target, encoding='utf-8').read().encode(), 'text/plain; charset=utf-8', head,
                              filename=name)

        # /download/... (files and stages)
        if mode == 'download':
            tail = rest[-1]
            if len(rest) == 2 and rest[0] == 'stages':
                blocks = stage_blocks()
                key = tail.replace('.txt', '')
                if key in blocks:
                    return self._send(blocks[key].encode(), 'text/plain; charset=utf-8', head,
                                      filename='%s.txt' % key, inline=False)
            if tail == ZIP_NAME:
                return self._send(make_zip(), 'application/zip', head, filename=ZIP_NAME, inline=False)
            if tail in DOCS:
                target = os.path.join(ROOT, tail)
                if not os.path.isfile(target):
                    return self.send_error(404, 'Missing file')
                ctype = 'application/pdf' if tail == PDF else 'text/markdown; charset=utf-8'
                return self._send(open(target, 'rb').read(), ctype, head, filename=tail, inline=False)

        return self.send_error(404, 'Not found')


if __name__ == '__main__':
    print('serving %s on 0.0.0.0:%d' % (ROOT, PORT), flush=True)
    print('stage prompts found: %s' % ', '.join(k for k, _ in stage_list()), flush=True)
    ThreadingHTTPServer(('0.0.0.0', PORT), Handler).serve_forever()
