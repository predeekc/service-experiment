# based on Makefile from https://github.com/karlseguin/the-little-redis-book

BOOK_FILE_NAME = service-experiment

EPUB_BUILDER = pandoc
EPUB_BUILDER_FLAGS = -S
MOBI_BUILDER = kindlegen

MD_FILES = $(sort $(wildcard */*.md))

default: $(BOOK_FILE_NAME).epub $(BOOK_FILE_NAME).mobi

$(BOOK_FILE_NAME).epub: metadata.txt $(MD_FILES)
	$(EPUB_BUILDER) $(EPUB_BUILDER_FLAGS) $^ -o $@

$(BOOK_FILE_NAME).mobi: $(BOOK_FILE_NAME).epub
	$(MOBI_BUILDER) $^; if [ $$? -eq 2 ]; then exit 1; else exit 0; fi

clean:	
	rm -f $(BOOK_FILE_NAME).epub
	rm -f $(BOOK_FILE_NAME).mobi



