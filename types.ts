export enum VoiceName {
  Puck = 'Puck',
  Charon = 'Charon',
  Kore = 'Kore',
  Fenrir = 'Fenrir',
  Zephyr = 'Zephyr',
}

export interface VoiceOption {
  id: VoiceName;
  name: string;
  gender: 'Male' | 'Female';
  description: string;
}

export const VOICES: VoiceOption[] = [
  { id: VoiceName.Puck, name: 'Puck', gender: 'Male', description: 'Energetic and youthful' },
  { id: VoiceName.Charon, name: 'Charon', gender: 'Male', description: 'Deep and authoritative' },
  { id: VoiceName.Kore, name: 'Kore', gender: 'Female', description: 'Calm and soothing' },
  { id: VoiceName.Fenrir, name: 'Fenrir', gender: 'Male', description: 'Gruff and intense' },
  { id: VoiceName.Zephyr, name: 'Zephyr', gender: 'Female', description: 'Bright and clear' },
];
