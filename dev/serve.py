"""Serve the site locally the way Cloudflare Pages does, including the headers in _headers
(content security policy, caching), so tests catch anything the live headers would block.
Usage: python3 dev/serve.py [port]   (default 8765), from anywhere."""
import http.server, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def load_rules():
    rules, cur = [], None
    for line in open(os.path.join(ROOT, '_headers'), encoding='utf-8'):
        if not line.strip() or line.lstrip().startswith('#'):
            continue
        if not line[0].isspace():
            cur = (re.compile('^' + re.escape(line.strip()).replace(r'\*', '.*') + '$'), [])
            rules.append(cur)
        elif cur and ':' in line:
            k, v = line.strip().split(':', 1)
            cur[1].append((k.strip(), v.strip()))
    return rules

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=ROOT, **kw)
    def end_headers(self):
        path = self.path.split('?', 1)[0].split('#', 1)[0]
        merged = {}
        for pat, hdrs in load_rules():
            if pat.match(path):
                for k, v in hdrs:
                    merged[k] = v
        for k, v in merged.items():
            if k.lower() == 'content-security-policy':
                v = v.replace('; upgrade-insecure-requests', '')   # the local server is plain http
            if k.lower() == 'strict-transport-security':
                continue
            self.send_header(k, v)
        super().end_headers()
    def log_message(self, *a):
        pass

if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8765
    http.server.ThreadingHTTPServer(('127.0.0.1', port), Handler).serve_forever()
