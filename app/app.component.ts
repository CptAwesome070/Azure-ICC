import { Component } from '@angular/core';
import {Http, RequestOptions, Headers, Response} from "@angular/http";
import 'rxjs/Rx';

@Component({
  selector: 'my-app',
  template: `
    <button (click)="startRecording(this);">record</button>
    <button (click)="stopRecording(this);">stop</button>
    <ul id="recordingslist"></ul>
    `,
})
export class AppComponent  {
  private azureURL;
  private azureAPIKey;
  private result;
  private startUserMedia;
  private recorder;
  private videosrc;
  private audio_context;
  private recordingslist;
  private accessToken;
  //name = 'Angular';

  constructor(public http: Http){
    console.log("here");
    //this.getContext();
    this.setAudioInput();
  }

  private setAudioInput(){
    navigator.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
    this.audio_context = new AudioContext;
    var promise= new Promise<string>((resolve, reject)=>{
      navigator.getUserMedia({audio: true},(stream) => {
        resolve(stream);
      }, (err) => reject(err));
    }).then((stream)=>{
      console.log(stream);
      var input = this.audio_context.createMediaStreamSource(stream);
      //var input = this.audio_context.createMediaStreamSource(stream);
      console.log('Media stream created.');

      // Uncomment if you want the audio to feedback directly
      //input.connect(audio_context.destination);
      //__log('Input connected to audio context destination.');

      this.recorder = new Recorder(input);
      console.log('Recorder initialised.');
      this.audio_context= URL.createObjectURL(stream);
    }).catch((error)=>{
      console.log(error);
    });
  }

  private startRecording(button) {
    this.recorder && this.recorder.record();
    //button.disabled = true;
    //button.nextElementSibling.disabled = false;
    console.log('Recording...');
  }

  private stopRecording(button) {
    this.recorder && this.recorder.stop();
    //button.disabled = true;
    //button.previousElementSibling.disabled = false;
    console.log('Stopped recording.');
    // create WAV download link using audio data blob
    this.createDownloadLink();
    this.recorder.clear();
  }

  private createDownloadLink() {
    this.recorder && this.recorder.exportWAV((blob) =>{
      var url = URL.createObjectURL(blob);
      //console.log(url);
      var li = document.createElement('li');
      var au = document.createElement('audio');
      var hf = document.createElement('a');

      au.controls = true;
      au.src = url;
      hf.href = url;
      hf.download = new Date().toISOString() + '.wav';
      hf.innerHTML = hf.download;
      li.appendChild(au);
      li.appendChild(hf);
      //this.recordingslist.appendChild(li);
      console.log(url);

      this.recogniseText(url);
      var audio = new Audio();
      audio.src = url;
      audio.load();
      audio.play();
    });
  }
  private testMethod(){
    console.log("hello there");
  }

  private recogniseText(url){
    this.azureURL = "https://speech.platform.bing.com/recognize";
    //?scenarios=ulm&appid=D4D52672-91D7-4C74-8AD8-42B1D98141A5&locale=en-US&device.os=OSX&version=3.0&format=json&instanceid=b2c95ede-97eb-4c88-81e4-80f32d6aee5&requestid=b2c95ede-97eb-4c88-81e4-80f32d6aee54
    this.azureAPIKey = "44e28e13f2f44ef0bfd5bd09d78690e9";
    this.getAccessToken(this.azureAPIKey).subscribe(
      data => this.accessToken = data,
      err => console.log(err),
      () => this.recogniseTextRequest(url)
    );
  }

  private recogniseTextRequest(url){
    let bodyString = JSON.stringify({});
    let headers      = new Headers({
      'Content-Type': 'audio/wav',
      "Ocp-Apim-Subscription-Key": this.azureAPIKey,
      "codec" : "audio/pcm"
    });
    let options       = new RequestOptions({ headers: headers });
    this.http.post(this.azureURL,url, options)
      .map(res => res.json()).subscribe(
      data => this.result = data,
      err => console.log(err),
      () => console.log(this.result)
    );
  }

  private getAccessToken(apiKey){
    var azureURL = "https://api.cognitive.microsoft.com/sts/v1.0/issueToken";
    let headers      = new Headers({
      "Ocp-Apim-Subscription-Key": apiKey
    });
    let options       = new RequestOptions({ headers: headers });
    var res = "";
    return this.http.post(azureURL, options)
      .map(res => res.json());
  }


  private getContext() {
    var contextText = "I have a problem with my computer and I would like to speak to a technician in order to assist me";
    var requestBody = {
      "documents": [
        {
          "language": "en",
          "id": "string",
          "text": contextText
        }
      ]
    }
    this.azureURL = "https://westus.api.cognitive.microsoft.com/text/analytics/v2.0/keyPhrases";
    this.azureAPIKey = "7cc025592dbf4ddda47087bb692d857b";
    let bodyString = JSON.stringify({});
    let headers      = new Headers({ 'Content-Type': 'application/json',
      "Ocp-Apim-Subscription-Key": this.azureAPIKey });
    let options       = new RequestOptions({ headers: headers }); // Create a request option
    this.http.post(this.azureURL,requestBody, options)
      .map(res => res.json()).subscribe(
      data => this.result = data,
      err => console.log('ERROR!!!'),
      () => console.log(this.result)
    );
  }

  private getAudio(text){
    this.azureURL = "https://speech.platform.bing.com/synthesize";
    this.azureAPIKey = "7cc025592dbf4ddda47087bb692d857b";
    let bodyString = JSON.stringify({});
    let headers      = new Headers({ 'Content-Type': 'application/json',
      "Ocp-Apim-Subscription-Key": this.azureAPIKey });
    let options       = new RequestOptions({ headers: headers }); // Create a request option
    this.http.post(this.azureURL,text, options)
      .map(res => res.json()).subscribe(
      data => this.result = data,
      err => console.log('ERROR!!!'),
      () => console.log(this.result)
    );
  }

  private extractData(res: Response) {
    let body = res.json();
    return body.data || { };
  }
}
