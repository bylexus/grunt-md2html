<h1> Index </h1>
<% print(grunt.file.read('test/fixtures/includes/_inc1.md')) %>
<div><% print(grunt.file.read('test/fixtures/includes/_inc2.md').trim()) %></div>
