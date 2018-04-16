all: xpi

xpi: extlib/webextensions-lib-configs/Configs.js
	git submodule update
	cp extlib/webextensions-lib-configs/Configs.js common
	cp extlib/webextensions-lib-options/Options.js options
	rm -f flexible-expire-history-by-days.xpi
	zip -r -0 flexible-expire-history-by-days.xpi *.json *.js *.html icons common options

extlib/webextensions-lib-configs/Configs.js:
	git submodule update --init
