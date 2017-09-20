/**
 * Handling audio output with Web Audio.
 */
function Audio() {
  var self = this;

  //

  var audioContext = AudioContext || webkitAudioContext;

  if(audioContext === undefined)
    throw new Error('This browser seems not to support AudioContext.');

  //

  this.bufferLength = 4096;
  this.buffer = new Float32Array(this.bufferLength);
  this.bufferIndex = 0;

  //

  this.context = new audioContext();
  this.scriptProcessor = this.context.createScriptProcessor(this.bufferLength, 0, 1);

  this.scriptProcessor.onaudioprocess = function(e) {
    self.onAudioProcess(e);
  };

  this.scriptProcessor.connect(this.context.destination);
  this.sampleRate = this.context.sampleRate;
}

Object.assign(Audio.prototype, {
  isAudio: true,

  /**
   *
   */
  getSampleRate: function() {
    return this.sampleRate;
  },

  /**
   *
   */
  onAudioProcess: function(e) {
    var data = e.outputBuffer.getChannelData(0);

    for(var i = 0, il = this.bufferLength; i < il; i++)
      data[i] = this.buffer[i];

    // @TODO: Fix me

    for(var i = this.bufferIndex, il = this.bufferLength; i < il; i++)
      data[i] = this.bufferIndex === 0 ? 0.0 : this.buffer[this.bufferIndex - 1];

    this.bufferIndex = 0;
  },

  /**
   *
   */
  push: function(data) {
    if(this.bufferIndex >= this.bufferLength)
      return;

    this.buffer[this.bufferIndex++] = data;
  }
});


export {Audio};
