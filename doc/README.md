# Documentation

This documentation is written using Markdown and can be converted into an EPub or Mobi format (for Kindle).  To build the books, you'll need to install [Pandoc](http://johnmacfarlane.net/pandoc/) and [KindleGen](http://www.amazon.com/gp/feature.html?docId=1000765211) (for Mobi).

To install Pandoc and KindleGen, use the following script

```bash
URL='https://github.com/jgm/pandoc/releases/download/1.13.2/pandoc-1.13.2-1-amd64.deb'; \
    FILE='pandoc_temp'; \
    wget "$URL" -qO $FILE && sudo dpkg -i $FILE; \
    rm $FILE
wget -qO- http://kindlegen.s3.amazonaws.com/kindlegen_linux_2.6_i386_v2_9.tar.gz \
	| sudo tar -zxvf - -C /usr/local/bin kindlegen
```

To build the book, run `make` and two files **service-experiment.epub** and **service-experiment.modi** will be created.

## Table of Contents

* [Introduction](00_Introduction.md)
* [Container Layout](01_ContainerLayout.md)
* [Router](02_Router.md)
* [Developing in Isolation](03_DevelopingInIsolation.md)
