import http.server
import socketserver
import os

PORT = 8000

class SPAHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Check if the requested file exists
        if not os.path.exists(os.path.join(os.getcwd(), self.path.strip('/'))):
            # If not, serve index.html (SPA fallback)
            self.path = '/index.html'
        return http.server.SimpleHTTPRequestHandler.do_GET(self)

if __name__ == '__main__':
    with socketserver.TCPServer(("", PORT), SPAHandler) as httpd:
        print(f"Serving at http://localhost:{PORT}")
        print("Press Ctrl+C to stop")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            pass
