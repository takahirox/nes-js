import {Nes} from './src/Nes.js';
import {Rom} from './src/Rom.js';
import {Audio} from './src/Audio.js';
import {Display} from './src/Display.js';
import {Joypad} from './src/Joypad.js';

function NesJs() {}

NesJs.Nes = Nes;
NesJs.Rom = Rom;
NesJs.Audio = Audio;
NesJs.Display = Display;
NesJs.Joypad = Joypad;

if(window !== undefined)
  window.NesJs = NesJs;
