
public/main.js: package.json client/*
	@./node_modules/.bin/browserify client/app.js -o public/main.js
