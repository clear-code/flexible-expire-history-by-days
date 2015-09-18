all:
	rm ./flexible-expire-history-by-days.xpi
	zip -r -0 flexible-expire-history-by-days.xpi install.rdf bootstrap.js options.xul -x \*/.git/\*

