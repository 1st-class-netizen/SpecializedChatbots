import axios from 'axios';

interface TextToSpeechParams {
  text: string;
  voiceName: string;
  apiKey: string;
}

const synthesizeSpeech = async ({ text, voiceName, apiKey }: TextToSpeechParams): Promise<string> => {
  const url = `https://texttospeech.googleapis.com/v1beta1/text:synthesize?key=${apiKey}`;
  const requestBody = {
    input: { text },
    voice: {
      languageCode: "fr-CA",
      name: voiceName,
      ssmlGender: "MALE"
    },
    audioConfig: {
      audioEncoding: "MP3"
    }
  };

  const response = await axios.post(url, requestBody, { responseType: 'json' });
  const audioContentBase64 = response.data.audioContent;
  const audioBlob = base64ToBlob(audioContentBase64, 'audio/mp3');
  return URL.createObjectURL(audioBlob);
};

function base64ToBlob(base64, mimeType) {
  const byteCharacters = atob(base64.replace(/^data:audio\/mp3;base64,/, ''));
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  const blob = new Blob(byteArrays, { type: mimeType });
  return blob;
}

export default synthesizeSpeech;
