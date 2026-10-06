#!/usr/bin/env python3
"""Render the audit briefs (Part A + Part B) into one styled A4 PDF."""
import re, html
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (BaseDocTemplate, Frame, PageTemplate, Paragraph, Spacer,
                                Table, TableStyle, Preformatted, PageBreak, HRFlowable)

FDIR = '/usr/share/fonts/truetype/dejavu/'
pdfmetrics.registerFont(TTFont('Body', FDIR + 'DejaVuSans.ttf'))
pdfmetrics.registerFont(TTFont('Body-Bold', FDIR + 'DejaVuSans-Bold.ttf'))
pdfmetrics.registerFont(TTFont('Mono', FDIR + 'DejaVuSansMono.ttf'))
pdfmetrics.registerFont(TTFont('Mono-Bold', FDIR + 'DejaVuSansMono-Bold.ttf'))
pdfmetrics.registerFontFamily('Body', normal='Body', bold='Body-Bold', italic='Body', boldItalic='Body-Bold')
pdfmetrics.registerFontFamily('Mono', normal='Mono', bold='Mono-Bold', italic='Mono', boldItalic='Mono-Bold')

INK = colors.HexColor('#10162B')
INDIGO = colors.HexColor('#5A4BD4')
MUTED = colors.HexColor('#5B6474')
CODE_BG = colors.HexColor('#F4F4F8')
CODE_BORDER = colors.HexColor('#D9D9E3')
GRID = colors.HexColor('#C9C9D4')

S = {
 'h1': ParagraphStyle('H1', fontName='Body-Bold', fontSize=19, leading=23, textColor=INK, spaceBefore=6, spaceAfter=10, keepWithNext=True),
 'h2': ParagraphStyle('H2', fontName='Body-Bold', fontSize=14, leading=18, textColor=INK, spaceBefore=16, spaceAfter=7, keepWithNext=True),
 'h3': ParagraphStyle('H3', fontName='Body-Bold', fontSize=11.3, leading=14.5, textColor=INDIGO, spaceBefore=12, spaceAfter=5, keepWithNext=True),
 'h4': ParagraphStyle('H4', fontName='Body-Bold', fontSize=9.8, leading=12.5, textColor=INK, spaceBefore=9, spaceAfter=4, keepWithNext=True),
 'body': ParagraphStyle('Body', fontName='Body', fontSize=9.2, leading=12.9, textColor=colors.HexColor('#1B1B1B'), spaceAfter=6, alignment=TA_LEFT),
 'bullet': ParagraphStyle('Bullet', fontName='Body', fontSize=9.2, leading=12.9, textColor=colors.HexColor('#1B1B1B'), leftIndent=13, bulletIndent=3, spaceAfter=3.5),
 'bullet2': ParagraphStyle('Bullet2', fontName='Body', fontSize=9.2, leading=12.9, textColor=colors.HexColor('#1B1B1B'), leftIndent=26, bulletIndent=16, spaceAfter=3.5),
 'quote': ParagraphStyle('Quote', fontName='Body', fontSize=9.0, leading=12.6, textColor=colors.HexColor('#33394A'), leftIndent=10, rightIndent=6, backColor=colors.HexColor('#F7F5EF'), borderPadding=6, spaceAfter=7),
 'cell': ParagraphStyle('Cell', fontName='Body', fontSize=8.1, leading=11.0, textColor=colors.HexColor('#1B1B1B')),
 'cellh': ParagraphStyle('CellH', fontName='Body-Bold', fontSize=8.2, leading=11.2, textColor=INK),
 'code': ParagraphStyle('Code', fontName='Mono', fontSize=7.3, leading=9.4, textColor=colors.HexColor('#1E2438')),
 'title': ParagraphStyle('Title', fontName='Body-Bold', fontSize=25, leading=29, textColor=INK, spaceAfter=6),
 'sub': ParagraphStyle('Sub', fontName='Body', fontSize=11.4, leading=16, textColor=MUTED, spaceAfter=4),
 'meta': ParagraphStyle('Meta', fontName='Mono', fontSize=8.2, leading=12, textColor=MUTED),
}

def inline(s):
    s = html.escape(s, quote=False)
    s = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', s)
    s = re.sub(r'(?<!\*)\*([^*]+)\*(?!\*)', r'<i>\1</i>', s)
    s = re.sub(r'`([^`]+)`', lambda m: '<font face="Mono" size="7.7" color="#4A3AA8">%s</font>' % m.group(1), s)
    return s

def wrap_code(line, width=104):
    if len(line) <= width:
        return [line]
    out, cur = [], line
    while len(cur) > width:
        cut = cur.rfind(' ', 0, width)
        if cut < width * 0.5:
            cut = width
        out.append(cur[:cut]); cur = '    ' + cur[cut:].lstrip()
    out.append(cur)
    return out

def parse(md):
    blocks, lines, i = [], md.split('\n'), 0
    while i < len(lines):
        line = lines[i]; stripped = line.strip()
        m = re.match(r'^(#{1,4})\s+(.*)$', stripped)
        if m and not stripped.startswith('```'):
            blocks.append(('h%d' % len(m.group(1)), m.group(2).strip())); i += 1; continue
        if re.match(r'^`{3,}', stripped):
            fence = re.match(r'^(`{3,})', stripped).group(1)
            i += 1; buf = []
            while i < len(lines) and not lines[i].strip().startswith(fence):
                buf.append(lines[i]); i += 1
            i += 1; blocks.append(('code', '\n'.join(buf))); continue
        if re.match(r'^(-{3,}|\*{3,}|_{3,})$', stripped):
            blocks.append(('hr', '')); i += 1; continue
        if stripped.startswith('|') and i + 1 < len(lines) and re.match(r'^\|[\s:|-]+\|$', lines[i + 1].strip()):
            rows = []
            while i < len(lines) and lines[i].strip().startswith('|'):
                if not re.match(r'^\|[\s:|-]+\|$', lines[i].strip()):
                    rows.append([c.strip() for c in lines[i].strip().strip('|').split('|')])
                i += 1
            blocks.append(('table', rows)); continue
        if stripped.startswith('> '):
            buf = []
            while i < len(lines) and lines[i].strip().startswith('>'):
                buf.append(lines[i].strip().lstrip('>').strip()); i += 1
            blocks.append(('quote', '\n'.join(buf))); continue
        mb = re.match(r'^(\s*)[-*]\s+(.*)$', line)
        if mb and not stripped.startswith('**'):
            blocks.append(('bullet%d' % (2 if len(mb.group(1)) >= 2 else 1), mb.group(2).strip())); i += 1; continue
        mo = re.match(r'^(\s*)(\d+)\.\s+(.*)$', line)
        if mo:
            blocks.append(('num%d' % (2 if len(mo.group(1)) >= 2 else 1), mo.group(2) + '. ' + mo.group(3).strip())); i += 1; continue
        if not stripped:
            i += 1; continue
        buf = [stripped]; i += 1
        while i < len(lines) and lines[i].strip() and not re.match(r'^(#{1,4}\s|`{3,}|\||>|\s*[-*]\s|\s*\d+\.\s|-{3,}$)', lines[i].strip()):
            buf.append(lines[i].strip()); i += 1
        blocks.append(('para', ' '.join(buf)))
    return blocks

def table_flow(rows, avail):
    ncol = max(len(r) for r in rows)
    rows = [r + [''] * (ncol - len(r)) for r in rows]
    lens = [max(len(r[c]) for r in rows) for c in range(ncol)]
    total = sum(lens) or 1
    widths = [max(46, avail * (l / total)) for l in lens]
    scale = avail / sum(widths); widths = [w * scale for w in widths]
    data = [[Paragraph(inline(c), S['cellh'] if ri == 0 else S['cell']) for c in r] for ri, r in enumerate(rows)]
    t = Table(data, colWidths=widths, repeatRows=1, hAlign='LEFT')
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#EFEFF5')),
        ('GRID', (0, 0), (-1, -1), 0.4, GRID),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 4), ('RIGHTPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 3.5), ('BOTTOMPADDING', (0, 0), (-1, -1), 3.5),
    ]))
    return t

def code_flow(text, avail):
    lines = []
    for l in text.split('\n'):
        lines.extend(wrap_code(l))
    pre = Preformatted('\n'.join(lines), S['code'], maxLineLength=110)
    t = Table([[pre]], colWidths=[avail], hAlign='LEFT')
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), CODE_BG),
        ('BOX', (0, 0), (-1, -1), 0.5, CODE_BORDER),
        ('LEFTPADDING', (0, 0), (-1, -1), 7), ('RIGHTPADDING', (0, 0), (-1, -1), 5),
        ('TOPPADDING', (0, 0), (-1, -1), 6), ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    return t

class Doc(BaseDocTemplate):
    def __init__(self, path, title):
        super().__init__(path, pagesize=A4, leftMargin=1.75 * cm, rightMargin=1.6 * cm,
                         topMargin=1.5 * cm, bottomMargin=1.6 * cm, title=title, author='Arena Agent')
        self.avail = A4[0] - self.leftMargin - self.rightMargin
        frame = Frame(self.leftMargin, self.bottomMargin, self.avail, A4[1] - self.topMargin - self.bottomMargin, id='n')
        self.addPageTemplates([PageTemplate(id='P', frames=[frame], onPage=self.footer)])
        self._bk = 0; self._h0 = False
    def footer(self, canv, doc):
        canv.saveState(); canv.setFont('Mono', 7); canv.setFillColor(MUTED)
        canv.drawString(self.leftMargin, 1.02 * cm, 'portfolio-arena — audit & fix programme')
        canv.drawRightString(A4[0] - self.rightMargin, 1.02 * cm, 'page %d' % doc.page)
        canv.setStrokeColor(colors.HexColor('#E2E2EA')); canv.setLineWidth(0.4)
        canv.line(self.leftMargin, 1.35 * cm, A4[0] - self.rightMargin, 1.35 * cm)
        canv.restoreState()
    def afterFlowable(self, flowable):
        if isinstance(flowable, Paragraph):
            st = flowable.style.name
            if st in ('H1', 'H2'):
                level = 0 if (st == 'H1' or not self._h0) else 1
                if st == 'H1':
                    self._h0 = True
                self._bk += 1; key = 'bk%d' % self._bk
                txt = re.sub(r'<[^>]+>', '', flowable.getPlainText())
                self.canv.bookmarkPage(key)
                self.canv.addOutlineEntry(txt[:90], key, level=level, closed=(level == 0))

def build(md_a, md_b, out):
    doc = Doc(out, 'Portfolio Audit & Fix Programme')
    story = [Spacer(1, 6),
             Paragraph('Portfolio Audit &amp; Fix Programme', S['title']),
             Paragraph('Master brief + ready-to-paste stage prompts for the <b>portfolio-arena</b> site', S['sub']),
             HRFlowable(width='100%', thickness=1.2, color=INDIGO, spaceBefore=8, spaceAfter=12),
             Paragraph('Repository: <font face="Mono" size="8">ashish231309/portfolio-arena</font> · branch <font face="Mono" size="8">arena/01a10c65-portfolio-arena</font><br/>'
                       'Base commit <font face="Mono" size="8">85f12aa</font> · deploy target Vercel · generated 2026-10-05<br/>'
                       'Status: <b>no changes applied yet</b> — the audit was read-only.', S['body']),
             Paragraph('<b>Part A</b> is the context: project, findings, measured numbers, decisions, corrections and the image truth table. '
                       '<b>Part B</b> holds one self-contained prompt per stage (S0–S10) — copy one block and paste it to start that stage.', S['body']),
             Paragraph('<b>Binding user corrections</b> (these override any earlier suggestion): '
                       '<b>C1</b> no third-party delivery note under the contact form · '
                       '<b>C2</b> strip metadata from every file · '
                       '<b>C3</b> present Full Stack Development as expertise, not learning.', S['quote']),
             Paragraph('Stage index:', S['body']),
             Paragraph('S0 safety net · S1 images · S2 metadata · S3 404/deep links · S4 bug fixes · S5 accessibility · '
                       'S6 performance · S7 discoverability · S8 positioning (Full Stack) · S9 hygiene/content/tests · S10 Tailwind 4', S['meta']),
             Spacer(1, 14), Paragraph('Contents', S['h2']),
             table_flow([
                 ['Part', 'Section', 'What it gives you'],
                 ['A', '1-3  Project, ways of working, repository map', 'Identity, stack, routes, where every file lives'],
                 ['A', '4-5  Audit method + findings register', 'Stable ids (A1-A4, T1-T35) referenced by the stage prompts'],
                 ['A', '5.1  Change list in severity order', 'Issue -> fix -> files -> stage -> risk, four tiers'],
                 ['A', '6  Measured values', 'Contrast table + verified replacement colours, asset inventory, WebP and PDF test results'],
                 ['A', '7  USER CORRECTIONS C1-C3', 'Binding decisions that override earlier suggestions'],
                 ['A', '8  IMAGE TRUTH TABLE', 'What each of the 16 screenshots really shows, new names, new alt text'],
                 ['A', '9-11  Stage plan, open questions, maintenance', 'Ordering rules and what still needs your answer'],
                 ['B', 'Session opener', 'Paste this at the start of a brand-new chat'],
                 ['B', 'S0-S10 stage prompts', 'One copy-paste block per stage, each self-contained'],
             ], doc.avail),
             PageBreak()]
    for md, brk in ((md_a, True), (md_b, False)):
        for kind, val in parse(md):
            if kind == 'hr':
                story.append(HRFlowable(width='100%', thickness=0.6, color=colors.HexColor('#D5D5DF'), spaceBefore=6, spaceAfter=9))
            elif kind == 'code':
                story.append(Spacer(1, 2)); story.append(code_flow(val, doc.avail)); story.append(Spacer(1, 7))
            elif kind == 'table':
                story.append(Spacer(1, 2)); story.append(table_flow(val, doc.avail)); story.append(Spacer(1, 8))
            elif kind == 'quote':
                story.append(Paragraph(inline(val).replace('\n', '<br/>'), S['quote']))
            elif kind == 'para':
                story.append(Paragraph(inline(val), S['body']))
            elif kind.startswith('bullet'):
                story.append(Paragraph(inline(val), S['bullet' if kind == 'bullet1' else 'bullet2'], bulletText='•' if kind == 'bullet1' else '–'))
            elif kind.startswith('num'):
                story.append(Paragraph(inline(val), S['bullet' if kind == 'num1' else 'bullet2']))
            elif kind in ('h1', 'h2', 'h3', 'h4'):
                story.append(Paragraph(inline(val), S[kind]))
        if brk:
            story.append(PageBreak())
    doc.build(story)
    return out

if __name__ == '__main__':
    base = '/home/user/portfolio-arena/audit/'
    out = build(open(base + 'PORTFOLIO-MASTER-BRIEF.md', encoding='utf-8').read(),
                open(base + 'PORTFOLIO-STAGE-PROMPTS.md', encoding='utf-8').read(),
                base + 'PORTFOLIO-AUDIT-AND-FIX-PLAN.pdf')
    print('written:', out)
