function Timer(t){return this.settings=t,this.timer=null,this.fps=t.fps||30,this.interval=Math.floor(1e3/t.fps),this.timeInit=null,this}Timer.prototype={run:function(){var t=this;this.settings.run(),this.timeInit+=this.interval,this.timer=setTimeout(function(){t.run()},this.timeInit-(new Date).getTime())},start:function(){null==this.timer&&(this.timeInit=(new Date).getTime(),this.run())},stop:function(){clearTimeout(this.timer),this.timer=null}};var rifff={};self.onmessage=function(t){if("play"==t.data.action){var e=!1;rifff.timer=new Timer({fps:parseFloat(t.data.data),run:function(){postMessage(e),e=!0}}),rifff.timer.start()}"stop"==t.data.action&&rifff.timer.stop()};