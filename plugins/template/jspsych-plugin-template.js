/*
 * Example plugin template
 */
 const jsPsych = window.jsPsych || require('jspsych');

 (function (root, factory) {
   if(typeof define === "function" && define.amd) {
      define([], factory);
   } else if(typeof module === "object" && module.exports) {
      module.exports = factory;
   } else {
      root.jsPsych.plugins["PLUGIN-NAME"] = factory;  // modify with your plugin name
   }
 }(this, (function() {

  var plugin = {};

  plugin.trial = function(display_element, trial) {

    // set default values for parameters
    trial.parameter = trial.parameter || 'default value';

    // data saving
    var trial_data = {
      parameter_name: 'parameter value'
    };

    // end trial
    jsPsych.finishTrial(trial_data);
  };

  return plugin;
})()
));
