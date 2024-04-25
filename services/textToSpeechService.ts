// services/textToSpeechService.ts
import axios from 'axios';

interface TextToSpeechParams {
  text: string;
  voiceName: string;
  apiKey: string;
}

const synthesizeSpeech = async ({ text, voiceName, apiKey }: TextToSpeechParams): Promise<Blob> => {
  const url = `https://texttospeech.googleapis.com/v1beta1/text:synthesize?key=${apiKey}`;
  const requestBody = {
    input: { text },
    voice: {
      languageCode: "fr-CA",
      name: voiceName,
      ssmlGender: "MALE"
    },
    audioConfig: {
      audioEncoding: "MP3",
      speakingRate: 1,
      pitch: 0,
      volumeGainDb: 0,
      sampleRateHertz: 24000,
      effectsProfileId: []
    }
  };

  const response = await axios.post(url, requestBody, { responseType: 'json' });
  const audioContentBase64 = response.data.audioContent;
  const audioBuffer = Buffer.from(audioContentBase64, 'base64');
  const blob = new Blob([audioBuffer], { type: 'audio/mpeg' });
  return blob;
};

export default synthesizeSpeech;