const scanFiles = (files, entry) => {
  let reader = entry.createReader();
  // Resolved when the entire directory is traversed
  return new Promise(resolveDirectory => {
    var iterationAttempts = [];
    (function read_entries() {
      // According to the FileSystem API spec, readEntries() must be called until
      // it calls the callback with an empty array.  Seriously??
      reader.readEntries(entries => {
        if (!entries.length) {
          // Done iterating this particular directory
          resolveDirectory(Promise.all(iterationAttempts));
        } else {
          // Add a list of promises for each directory entry.  If the entry is itself 
          // a directory, then that promise won't resolve until it is fully traversed.
          iterationAttempts.push(Promise.all(entries.map(async entry => {
            if (entry.isFile) {
              const file = await new Promise((resolve, reject) => entry.file(resolve, reject))
              files.push(file);
              return entry;
            } else {
              return scanFiles(files, entry);
            }
          })));
          // Try calling readEntries() again for the same dir, according to spec
          read_entries();
        }
      });
    })();
  });
};

Template.dropzone.onRendered(() => {
  window.addEventListener('dragenter', e => { $('#dropzone').show(); });
});

Template.dropzone.events({
  'dragenter #dropzone, dragover #dropzone'(e) {
    e.originalEvent.dataTransfer.dropEffect = 'copy';
    e.preventDefault();
  },
  'dragleave #dropzone'(e) {
    $('#dropzone').hide();
  },
  async 'drop #dropzone'(e) {
    e.preventDefault();
    $('#dropzone').hide();

    const files = [];
    const { items } = event.dataTransfer;
    for (let i = 0; i < items.length; i++) {
      const item = items[i].webkitGetAsEntry();
      if (item) {
        await scanFiles(files, item);
      }
    }
l({files})
    prepareLocalFiles(files);
  },
});
