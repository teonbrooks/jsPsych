/*
 * Example plugin template
 */

(function plugin() {

  var plugin = {};

  plugin.trial = function(display_element, trial) {

    // set default values for parameters
    trial.parameter = trial.parameter || 'default value';

    // data saving
    var trial_data = {
      parameter_name: 'parameter value'
    };

    // end trial
    // jsPsych.finishTrial(trial_data);
  };

  return plugin;
})();

// jsPsych.plugins["PLUGIN-NAME"]
(function (root, factory) {
  if(typeof define === "function" && define.amd) {
    define([], factory);
  } else if(typeof module === "object" && module.exports) {
    module.exports = factory;
  } else {
    root.jsPsych.plugins["image-keyboard-response"] = factory;
  }
}(this, function () {
