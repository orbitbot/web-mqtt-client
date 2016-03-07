// hook into mocha global after to write coverage reports if found
after(function() {
  if (window.__coverage__) {
    var istanbul = require('istanbul');
    istanbul.Report.register(require('istanbul-text-full-reporter'));
    var reporter = new istanbul.Reporter();
    var collector = new istanbul.Collector();

    collector.add(window.__coverage__);

    reporter.addAll(['json', 'text-full']);
    reporter.write(collector, true, function() {});
  }
});