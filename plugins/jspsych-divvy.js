/** 
 * jspsych-similarity.js
 * Josh de Leeuw
 * 
 * This plugin create a trial where two images are shown sequentially, and the subject rates their similarity using a slider controlled with the mouse.
 *
 * parameters:
 *      stimuli:            array of arrays. inner arrays are two stimuli. stimuli can be image paths or html strings. each inner array is one trial.
 *      labels:             array of strings to label the slider with. labels will be evenly spaced along the slider.
 *      intervals:          how many different response options are on the slider
 *      show_ticks:         if true, then the slider will have small tick marks displayed to show where the response options are.
 *      show_response:      determines when to show the response options: "FIRST_STIMULUS","SECOND_STIMULUS",or "POST_STIMULUS"
 *      timing_first_stim:  how long to show the first stimulus.
 *      timing_second_stim: how long to show the second stimulus. can be -1 to show until a response is given.
 *      timing_image_gap:   how long to show a blank screen between the two stimuli.
 *      timing_post_trial:  how long to show a blank screen after the trial is over.
 *      is_html:            must set to true when using HTML strings as the stimuli.
 *      prompt:             optional HTML string to display with the stimulus.
 *      data:               the optional data object
 * 
 */


			var num_original_bots=6;

(function($) {
    jsPsych.similarity = (function() {

        var plugin = {};

        plugin.create = function(params) {
            var trials = new Array(params.stimuli);
            for (var i = 0; i < trials.length; i++) {
                trials[i] = {};
                trials[i].type = "similarity";

                // TODO make all changes related to following 4 parameters.
                trials[i].task=params.task;
				trials[i].labels = (typeof params.labels === 'undefined') ? ["5% of wealth", "95% of wealth"] : params.labels;
                trials[i].intervals = params.intervals || 100;
                trials[i].show_ticks = (typeof params.show_ticks === 'undefined') ? false : params.show_ticks;

                trials[i].show_response = params.show_response || "SECOND_STIMULUS";
                trials[i].practice = (typeof params.practice === 'undefined') ? false : params.practice;
                trials[i].stimuli = (typeof params.stimuli === 'undefined') ? false : params.stimuli;
                trials[i].is_html = (typeof params.is_html === 'undefined') ? false : params.is_html;
				trials[i].prompt = (typeof params.prompt === 'undefined') ? '' : params.prompt;
				trials[i].prob_a = (typeof params.prompt === 'undefined') ? '' : params.probabilityA;
                trials[i].data = (typeof params.data === 'undefined') ? {} : params.data[i];
            }
            return trials;
        };

        var sim_trial_complete = false;
 
		   plugin.trial = function(display_element, block, trial, part) {

	            // if any trial variables are functions
	            // this evaluates the function and replaces
	            // it with the output of the function
	            trial = jsPsych.normalizeTrialVariables(trial);
				var bank=trial.prompt[0];

	            switch (part) {
	            case 1:
		       if (trial.task=="solo")
				{display_element.append("<p> Race " + (block.trial_idx + 1) + " out of " + trial.stimuli + trial.practice + " <br>"+
										"You have $"+(bank).toFixed(2)+" to bet this race</p><br>Move the sliders to show how you want to split your money across the two horses<br><br>")}
				
				else
				{display_element.append("<p> Race " + (block.trial_idx + 1) + " out of " + trial.stimuli +trial.practice + " <br>"+
										"Your group has $"+(bank*(num_original_bots+1)).toFixed(2)+" to bet this race</p><br>The sliders below show how the other individuals in your group are split over the horses.  Choose which horse you want to bet on by pressing either the Bet on A or Bet on B button.<br><br>");				
				} //include num_bots + 1 to include the participant herself.
	                sim_trial_complete = false;
	                // show the images

	                if (trial.show_response == "FIRST_STIMULUS") {
	                    show_response_slider(display_element, trial, block);
	                }


	                plugin.trial(display_element, block, trial, part + 1);
	                break;

	            case 2:

	                $('#jspsych_sim_stim').css('visibility', 'hidden');
	                    plugin.trial(display_element, block, trial, part + 1);
	                break;

	            case 3:

	                $('#jspsych_sim_stim').css('visibility', 'visible');

	                if (trial.show_response == "SECOND_STIMULUS") {
	                    show_response_slider(display_element, trial, block);
	                }

	                if (trial.timing_second_stim > 0) {
	                        if (!sim_trial_complete) {
	                            $("#jspsych_sim_stim").css('visibility', 'hidden');
	                            if (trial.show_response == "POST_STIMULUS") {
	                                show_response_slider(display_element, trial, block);
	                            }
	                        }
	                }

	                break;
	            }
	        };
    
        function show_response_slider(display_element, trial, block) {

            var startTime = (new Date()).getTime();
			multiplier=1.75;
			var points;
			var new_bank;
			var offset=-1;
			var selected_pool;
			var num_bots = num_original_bots;			
			var bots_in_a=0;
			for (var j=0; j<num_bots; j++)
				{if (Math.random()<trial.prob_a)
					bots_in_a += 1;}   //add another bot to Pool A
			bots_in_b=num_bots - bots_in_a;
			var subject_in_a=false;
			var subject_in_b=false;
			var coll_count1=(bots_in_a/num_bots).toFixed(2);
			var coll_count2 =(1-coll_count1).toFixed(2);
			var score1 = (trial.task=="collective")? coll_count1*100: (Math.ceil(trial.intervals / 2)+offset)*5;
			var score2 = (trial.task=="collective")? coll_count2*100 : (Math.ceil(trial.intervals / 2)+offset)*5;

            // if prompt is set, show prompt
 
            // create slider
          display_element.append($('<div>', {
                "id": 'slider1',
                "class": 'sim'
            }));


            $("#slider1").slider({
                value: (trial.task=="collective")? coll_count1*100/5-offset  : (score1/5)-offset,
                min: 1,
                max: trial.intervals,
                step: 1,
				animate:true,
				disabled: (trial.task =="collective")? true : false  //disabled if collective
            });

            // show tick marks
            if (trial.show_ticks) {
                for (var j = 1; j < trial.intervals - 1; j++) {
                    $('#slider1').append('<div class="slidertickmark"></div>');
                }

                $('#slider1 .slidertickmark').each(function(index) {
                    var left = (index + 1) * (100 / (trial.intervals - 1));
                    $(this).css({
                        'position': 'absolute',
                        'left': left + '%',
                        'width': '1px',
                        'height': '100%',
                        'background-color': (index > 0 && index < 18)? '#222222': 'red',
                    });
                });
            }
	
			// create labels for slider
            display_element.append($('<ul>', {
                "id": "sliderlabels1",
                "class": 'sliderlabels',
                "css": {
                    "width": "100%",
                    "height": "2em",
                    "margin": "10px 0px 0px 0px",
                    "padding": "0px",
                    "display": "block",
                    "position": "relative",
                }
            }));

            for (var j = 0; j < trial.labels.length; j++) {			
                $("#sliderlabels1").append('<li>' + trial.labels[j] + '</li>');
            }

            // position labels to match slider intervals
            var slider_width1 = $("#slider1").width();
            var num_items = trial.labels.length;
            var item_width = slider_width1 / num_items;
            var spacing_interval = slider_width1 / (num_items - 1);

            $("#sliderlabels1 li").each(function(index) {
                $(this).css({
                    'display': 'inline-block',
                    'width': item_width + 'px',
                    'margin': '0px',
                    'padding': '0px',
                    'text-align': 'center',
                    'position': 'absolute',
                    'left': (spacing_interval * index) - (item_width / 2)
                });
            });



			if (trial.task == "collective")
			{display_element.append($('<button>', {
                'id': 'PoolA',
                'class': 'sim',
                'html': '<p>Bet on A</p>',
			}))};
			
            display_element.append($('<text>',
				{'id':'Probainfo',
				'class':'sim',
				'html': "<br>Probability of Horse A winning = " +trial.prob_a.toFixed(2)*100+ "%"
				}));


			$("#PoolA").click(function(){ 
				subject_in_a=true;
				document.getElementById("submission").disabled = false;  // not using Jquery because that brings with it the full specification, which includes a lot
				bots_in_a += 1;
				if (subject_in_b)
					{bots_in_b -= 1;
					subject_in_b=false
					num_bots -= 1};
				num_bots += 1;
				document.getElementById("PoolA").disabled = true; 
				document.getElementById("PoolB").disabled = false; 		
				coll_count1=bots_in_a/num_bots;
				coll_count2 =1 - coll_count1;
				$('#info2').html("<br>"+ bots_in_b + " out of " + num_bots + " betters = " + (coll_count2*100).toFixed(2) + "% betting on B");
				$('#info1').html("<br>"+ bots_in_a + " out of " + num_bots + " betters = " + (coll_count1*100).toFixed(2) + "% betting on A");
				$('#slider1').slider({value:(coll_count1*100 / 5)-offset});	
				$('#slider2').slider({value:(coll_count2*100 / 5)-offset});	
			});
	
		

            display_element.append($('<text>',    //only runs on startup - element for info on rating
				{'id':'info1',
				'class':'sim',
				'html': (trial.task=="collective")? ("<br>"+ bots_in_a + " out of " + num_bots + " betters = " + (coll_count1*100).toFixed(2)  + "% are betting on A") : ("<br>% on Horse A = "+ score1+"%")
				}));
			
			display_element.append("<p></p><br><br>");
			
			
            display_element.append($('<div>', {
                "id": 'slider2',
                "class": 'sim'
            }));

            $("#slider2").slider({
                value: (trial.task=="collective")? coll_count2*100/5-offset : score2/5-offset,
                min: 1,
                max: trial.intervals,
                step: 1,
				animate:true,
				disabled: (trial.task =="collective")? true : false  //disabled if collective
            });

            // show tick marks
            if (trial.show_ticks) {
                for (var j = 1; j < trial.intervals - 1; j++) {
                    $('#slider2').append('<div class="slidertickmark"></div>');
                }

                $('#slider2 .slidertickmark').each(function(index) {
                    var left = (index + 1) * (100 / (trial.intervals - 1));
                    $(this).css({
                        'position': 'absolute',
                        'left': left + '%',
                        'width': '1px',
                        'height': '100%',
                        'background-color': (index > 0 && index < 18)? '#222222': 'red'
                    });
                });
            }

          // create labels for slider
            display_element.append($('<ul>', {
                "id": "sliderlabels2",
                "class": 'sliderlabels',
                "css": {
                    "width": "100%",
                    "height": "2em",
                    "margin": "10px 0px 0px 0px",
                    "padding": "0px",
                    "display": "block",
                    "position": "relative"
                }
            }));

            for (var j = 0; j < trial.labels.length; j++) {
                $("#sliderlabels2").append('<li>' + trial.labels[j] + '</li>');
            }

            // position labels to match slider intervals
            	var slider_width2 = $("#slider2").width();
            	num_items = trial.labels.length;
            	item_width = slider_width2 / num_items;
            	spacing_interval = slider_width2 / (num_items - 1);
           $("#sliderlabels2 li").each(function(index) {
                $(this).css({
                    'display': 'inline-block',
                    'width': item_width + 'px',
                    'margin': '0px',
                    'padding': '0px',
                    'text-align': 'center',
                    'position': 'absolute',
                    'left': (spacing_interval * index) - (item_width / 2)
                });
            });
 
			if (trial.task == "collective")
				{display_element.append($('<button>', {
	               'id': 'PoolB',
	               'class': 'sim',
	               'html': '<p>Bet on B</p>',
			}))};  

          display_element.append($('<text>',
				{'id':'Probbinfo',
				'class':'sim',
				'html': "<br>Probability of Horse B winning = " + (1-trial.prob_a).toFixed(2)*100+ "%"
				}));
				 	
			
			$("#PoolB").click(function(){ 
				subject_in_b=true;
				document.getElementById("submission").disabled = false; 
				bots_in_b += 1;
				if (subject_in_a)
					{bots_in_a -= 1
					num_bots -= 1;
					subject_in_a=false};
				num_bots += 1;
				document.getElementById("PoolB").disabled = true; 
				document.getElementById("PoolA").disabled = false; 									
				coll_count1=(bots_in_a/num_bots).toFixed(2);
				coll_count2 =(1 - coll_count1).toFixed(2);
				$('#info2').html("<br>"+ bots_in_b + " out of " + num_bots + " betters = " + (coll_count2*100).toFixed(2) + "% betting on B");
				$('#info1').html("<br>"+ bots_in_a + " out of " + num_bots + " betters = " + (coll_count1*100).toFixed(2) + "% betting on A");
				$('#slider1').slider({value:(coll_count1*100 / 5)-offset});	
				$('#slider2').slider({value:(coll_count2 *100/ 5)-offset});	
			}); 

           display_element.append($('<text>',    //only runs on startup - element for info on rating
				{'id':'info2',
				'class':'sim',
				'html':(trial.task=="collective")? ("<br>"+ bots_in_b + " out of " + num_bots + " betters = " + (coll_count2*100).toFixed(2) + "% are betting on B") : ("<br>% on Horse B = "+ score2+"%")
				}));
				
			var s1=true;
			var s2=true;
			var final_button=false;


	   			$("#slider1").on( "slidechange", function( event, ui ) //listen for sliderchange
					{
					if ((ui.value < 3 || ui.value > 19) && (trial.task=="solo"))
						{
							$("#slider1").slider({value:(score1/5)-offset});
			            	return false;
			        	}
					score1 = ($("#slider1").slider("value")+offset)*5;
					score2 = 100 - score1;
					if (s1)
						{s2=false;
						$('#slider2').slider({value:(score2 / 5)-offset});
						s2=true;}
					$('#info2').html((trial.task=="collective")? ("<br>"+ bots_in_b + " out of " + num_bots + " betters = " + (coll_count2*100).toFixed(2) + "% are betting on B") : ("<br>% on Horse B = "+ score2+"%"));
					$('#info1').html((trial.task=="collective")? ("<br>"+ bots_in_a + " out of " + num_bots + " betters = " + (coll_count1*100).toFixed(2) + "% are betting on A") : ("<br>% on Horse A = "+ score1+"%"));
					}); //need # for tag

	   			$("#slider2").on( "slidechange", function( event, ui ) //listen for sliderchange
					{
					if ((ui.value < 3 || ui.value > 19) && (trial.task=="solo"))
						{
							$("#slider1").slider({value:(score1/5)-offset});
			            	return false;
			          	 }
						
					score2 = ($("#slider2").slider("value")+offset )*5;
					score1=100-score2;
					if (s2)
						{s1=false;
						$('#slider1').slider({value:(score1 / 5)-offset});
						s1=true;}		
						$('#info2').html((trial.task=="collective")? ("<br>"+ bots_in_b + " out of " + num_bots + " betters = " + (coll_count2*100).toFixed(2) + "% are betting on B") : ("<br>% on Horse B = "+ score2+"%"));
						$('#info1').html((trial.task=="collective")? ("<br>"+ bots_in_a + " out of " + num_bots + " betters = " + (coll_count1*100).toFixed(2) + "% are betting on A") : ("<br>% on Horse A = "+ score1+"%"));
					}); //need # for tag

			display_element.append("<p></p><br><br>");
			
			display_element.append($('<button>', {
                'id': 'submission',
                'class': 'sim',
                'html': 'Submit Answer',
				'disabled': (trial.task=="collective")? true: false
            }));
			display_element.append("<p></p><br><br>");
			points=0;
			$("#submission").click(function(){
				var randomnum=Math.random();  //produces a num 0-1
				if (randomnum < trial.prob_a)
					{slider_score=($("#slider1").slider("value")+offset)*5/100;
					points=slider_score*bank*multiplier;
					selected_pool=0;
					new_bank=bank*slider_score*multiplier;
					$('#feedback').html((trial.task=="collective")? ("Horse A won <br> The whole group now has $"+(bank*num_bots).toFixed(2) +" X "+slider_score+" X " + multiplier +" =  $"+(points*num_bots).toFixed(2) +"<br>"+ "Your portion is $"+ (new_bank).toFixed(2) +"<br>") : ("Horse A won <br> You now have $" + (bank).toFixed(2) +" X "+(slider_score).toFixed(2) +" X " + multiplier +" =  $" + (points).toFixed(2) +"<br><br>"));
					$("#slider1" ).css('background', 'rgb(0,255,0)')}
				else
					{slider_score=($("#slider2").slider("value")+offset)*5/100;
					points=slider_score*bank*multiplier;
					selected_pool=1;
					new_bank=bank*slider_score*multiplier;
					$('#feedback').html((trial.task=="collective")? ("Horse B won <br> The whole group now has $"+(bank*num_bots).toFixed(2) +" X "+slider_score+" X " + multiplier +" =  $"+(points*num_bots).toFixed(2) +"<br>"+ "Your portion is $"+ (new_bank).toFixed(2) +"<br>") : ("Horse B won <br> You now have $" + (bank).toFixed(2) +" X "+ (slider_score).toFixed(2) +" X " + multiplier +" =  $" + (points).toFixed(2) +"<br><br>"));
					$("#slider2" ).css('background', 'rgb(0,255,0)')};
				if ((block.trial_idx == trial.stimuli - 1) && (trial.practice==''))
							{$('#endofblock').html("<br>For this phase of the experiment, you have earned $" + (new_bank).toFixed(2));
							total_earnings += new_bank;
							};
				final_button=true;
				$("#submission").remove();
				$('#slider1').slider({ disabled: true });
				$('#slider2').slider({ disabled: true });
				if (trial.task=="collective")
					{document.getElementById("PoolA").disabled = true; 
					document.getElementById("PoolB").disabled = true};
				document.getElementById("next").disabled = false; 
			});
			
			display_element.append($('<text>',{
				'id':'feedback',
				'html':'<br><br>'
			}));
			
						
         	//  create final button
			{display_element.append($('<button>', {
                'id': 'next',
                'class': 'sim',
                'html': 'Next Trial',
				'disabled': true
            }))}

			display_element.append($('<text>',{
				'id':'endofblock',
				'html':'<br>'
			}));		

            $("#next").click(function() {
                var endTime = (new Date()).getTime();
                var response_time = endTime - startTime;
                sim_trial_complete = true;
                score1 = ($("#slider1").slider("value")+offset)*5;
                score2 = ($("#slider2").slider("value")+offset)*5;
                block.writeData($.extend({}, {
                    "slider1val": score1,
					"sim_score": points,
					"bank":bank,
					"task":trial.task,
                    "rt": response_time,
					"probabilityA":trial.prob_a,
					"practice": trial.practice,
                    "trial_type": "similarity",
					"pool":selected_pool,
                    "trial_index": block.trial_idx,
					"total_earnings":total_earnings
                }, trial.data));
				if (block.trial_idx == trial.stimuli - 1)
							{bank=starting_bank;
							};
                // goto next trial in block
                display_element.html('');  //erases whole display
                if (trial.timing_post_trial > 0) {
                    setTimeout(function() {
                        block.next();
                    }, trial.timing_post_trial);
                }
                else {
                    block.next();
                };
            });
        }

        return plugin;
    })();
})(jQuery);
