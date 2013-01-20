



function Timer(settings)
{
    this.settings = settings;
    this.timer = null;

    this.fps = settings.fps || 30;
    this.interval = Math.floor(1000/settings.fps);
    this.timeInit = null;
		
    return this;
}

Timer.prototype = 
{	
    run: function()
    {
        var $this = this;
		
        this.settings.run();
        this.timeInit += this.interval;

        this.timer = setTimeout(
            function(){$this.run()}, 
            this.timeInit - (new Date).getTime()
        );
    },
	
    start: function()
    {
        if(this.timer == null)
        {
            this.timeInit = (new Date).getTime();
            this.run();
        }
    },
	
    stop: function()
    {
        clearTimeout(this.timer);
        this.timer = null;
    }
}


var rifff = {};



self.onmessage = function(event){


	
	if (event.data.action == 'play'){
		var not_first_run = false; 
		rifff.timer = new Timer({
		    fps: parseFloat(event.data.data), //rifff.loop_trigger_interval
		    run: function(){
		       	postMessage(not_first_run);
		 		not_first_run = true; 
		    }
		});
		
		
		rifff.timer.start();
		
	}
	if (event.data.action == 'stop'){

		rifff.timer.stop();
		
	}

	
};







