from livereload import Server

server = Server()
server.watch('.', delay=1)
server.serve(root='.')