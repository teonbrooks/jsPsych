/**
 * jspsych-audio-button-response
 * Kristin Diep
 *
 * plugin for playing an audio file and getting a keyboard response
 *
 * documentation: docs.jspsych.org
 *
 **/
var jsPsych = window.jsPsych || require('jspsych');

(function (root, factory) {
  if(typeof define === "function" && define.amd) {
     define([], factory);
  } else if(typeof module === "object" && module.exports) {
     module.exports = factory;
  } else {
     root.jsPsych.plugins["audio-button-response"] = factory;
  }
}(this, (function() {

	var plugin = {};

	jsPsych.pluginAPI.registerPreload('audio-button-response', 'stimulus', 'audio');

	plugin.info = {
		name: 'audio-button-response',
		description: '',
		parameters: {
			stimulus: {
				type: jsPsych.plugins.parameterType.AUDIO,
        pretty_name: 'Stimulus',
				default: undefined,
				description: 'The audio to be played.'
			},
			choices: {
				type: jsPsych.plugins.parameterType.KEYCODE,
        pretty_name: 'Choices',
				default: [],
				array: true,
				description: 'The button labels.'
			},
      button_html: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        pretty_name: 'Button HTML',
        default: '<button class="jspsych-btn">%choice%</button>',
        array: true,
        description: 'Custom button. Can make your own style.'
      },
      prompt: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Prompt',
        default: '',
        description: 'Any content here will be displayed below the stimulus.'
      },
      trial_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Trial duration',
        default: -1,
        description: 'The maximum duration to wait for a response.'
      },
      margin_vertical: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Margin vertical',
        default: '0px',
        description: 'Vertical margin of button.'
      },
      margin_horizontal: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Margin horizontal',
        default: '8px',
        description: 'Horizontal margin of button.'
      },
      response_ends_trial: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Response ends trial',
        default: true,
        description: 'If true, the trial will end when user makes a response.'
      },
      trial_ends_after_audio: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Trial ends after audio',
        default: false,
        description: 'If true, then the trial will end as soon as the audio file finishes playing.'
      },
    }
  }

  plugin.trial = function(display_element, trial) {

    // setup stimulus
    var context = jsPsych.pluginAPI.audioContext();
    if(context !== null){
      var source = context.createBufferSource();
      source.buffer = jsPsych.pluginAPI.getAudioBuffer(trial.stimulus);
      source.connect(context.destination);
    } else {
      var audio = jsPsych.pluginAPI.getAudioBuffer(trial.stimulus);
      audio.currentTime = 0;
    }

    // set up end event if trial needs it
    if(trial.trial_ends_after_audio){
      if(context !== null){
        source.onended = function() {
          end_trial();
        }
      } else {
        audio.addEventListener('ended', end_trial);
      }
    }

  	//display buttons
    var buttons = [];
    if (Array.isArray(trial.button_html)) {
      if (trial.button_html.length == trial.choices.length) {
        buttons = trial.button_html;
      } else {
        console.error('Error in image-button-response plugin. The length of the button_html array does not equal the length of the choices array');
      }
    } else {
      for (var i = 0; i < trial.choices.length; i++) {
        buttons.push(trial.button_html);
      }
    }
    display_element.innerHTML = '<div id="jspsych-audio-button-response-btngroup"></div>';
    for (var i = 0; i < trial.choices.length; i++) {
      var str = buttons[i].replace(/%choice%/g, trial.choices[i]);
      display_element.querySelector('#jspsych-audio-button-response-btngroup').insertAdjacentHTML('beforeend',
        '<div class="jspsych-audio-button-response-button" style="cursor: pointer; display: inline-block; margin:'+trial.margin_vertical+' '+trial.margin_horizontal+'" id="jspsych-audio-button-response-button-' + i +'" data-choice="'+i+'">'+str+'</div>');
      display_element.querySelector('#jspsych-audio-button-response-button-' + i).addEventListener('click', function(e){
        var choice = e.currentTarget.getAttribute('data-choice'); // don't use dataset for jsdom compatibility
        after_response(choice);
      });
    }

    //show prompt if there is one
    if (trial.prompt !== "") {
      display_element.insertAdjacentHTML('beforeend', trial.prompt);
    }

    // store response
    var response = {
      rt: -1,
      button: -1
    };

    // start time
    var start_time = 0;

    // function to handle responses by the subject
    function after_response(choice) {

      // measure rt
      var end_time = Date.now();
      var rt = end_time - start_time;
      response.button = choice;
      response.rt = rt;

      // disable all the buttons after a response
      var btns = document.querySelectorAll('.jspsych-audio-button-response-button button');
      for(var i=0; i<btns.length; i++){
        //btns[i].removeEventListener('click');
        btns[i].setAttribute('disabled', 'disabled');
      }

      if (trial.response_ends_trial) {
        end_trial();
      }
    };

    // function to end trial when it is time
    function end_trial() {

			// stop the audio file if it is playing
			// remove end event listeners if they exist
			if(context !== null){
				source.stop();
				source.onended = function() { }
			} else {
				audio.pause();
				audio.removeEventListener('ended', end_trial);
			}

      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

      // gather the data to store for the trial
      var trial_data = {
        "rt": response.rt,
        "stimulus": trial.stimulus,
        "button_pressed": response.button
      };

      // clear the display
      display_element.innerHTML = '';

      // move on to the next trial
      jsPsych.finishTrial(trial_data);
    };

    // start timing
    start_time = Date.now();

		// start audio
    if(context !== null){
      startTime = context.currentTime + 0.1;
      source.start(startTime);
    } else {
      audio.play();
    }

    // end trial if time limit is set
    if (trial.trial_duration > 0) {
      jsPsych.pluginAPI.setTimeout(function() {
        end_trial();
      }, trial.trial_duration);
    }

  };

  return plugin;
})()
));
