all: xpi

xpi: extlib/webextensions-lib-configs/Configs.js
	git submodule update
	cp extlib/webextensions-lib-configs/Configs.js common
	rm -f flexible-expire-history-by-days
	zip -r -0 flexible-expire-history-by-days.xpi *.json *.js *.html icons common

extlib/webextensions-lib-configs/Configs.js:
	git submodule update --init
