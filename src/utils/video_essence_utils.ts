import { VM, AT1130, AT1101 } from 'vapi';
import { enforce_nonnull } from 'vscript';
import { ESSENCE_ENTRY, VIDEO_ESSENCE } from './types';

//SECTION getVideoEssences
export function getVideoEssence(vm: VM.Any, essenceEntry: ESSENCE_ENTRY): VIDEO_ESSENCE {
  const { essenceType: type, essenceIndex: index } = essenceEntry;
  switch (type) {
    case 'video_mixer':
      return getMixerEssence(vm, index);
    case 'r_t_p_receiver':
      return getRtpVideoRxEssence(vm, index);
    case 'video_signal_generator':
      return getVideoSignalGeneratorEssence(vm, index);
    case 're_play':
      return getReplayEssence(vm, index);
    case 'sdi':
      return getSdiOutputEssence(vm, index);
    case 'color_correction':
      return getColorCorrection(vm, index);
    case `cc1d`:
      return getCc1d(vm, index);
    case `cc3d`:
      return getCc3d(vm, index);
    case `delay_player`:
      return getDelayPlayer(vm, index);
    case `video_player`:
      return getVideoPlayer(vm, index);
    default:
      return null;
  }
}

function getColorCorrection(vm: VM.Any, index: number) {
  const color_correction = enforce_nonnull(vm.color_correction);
  if (color_correction.cc1d.row(index) == null) return null;
  return color_correction.cc1d.row(index).output;
}
function getCc1d(vm: VM.Any, index: number) {
  const color_correction = enforce_nonnull(vm.color_correction);
  if (color_correction.cc1d.row(index) == null) return null;
  return color_correction.cc1d.row(index).output;
}

function getCc3d(vm: VM.Any, index: number) {
  const color_correction = enforce_nonnull(vm.color_correction);
  if (color_correction.cc3d.row(index) == null) return null;
  return color_correction.cc3d.row(index).output;
}

function getReplayEssence(vm: VM.Any, index: number) {
  const re_play = enforce_nonnull(vm.re_play);
  if (re_play.video.players.row(index) == null) return null;
  return re_play.video.players.row(index).output.video;
}

function getVideoPlayer(vm: VM.Any, index: number) {
  const re_play = enforce_nonnull(vm.re_play);
  if (re_play.video.players.row(index) == null) return null;
  return re_play.video.players.row(index).output.video;
}

function getDelayPlayer(vm: VM.Any, index: number) {
  const re_play = enforce_nonnull(vm.re_play);
  if (re_play.video.delays.row(index) == null) return null;
  return re_play.video.delays.row(index).outputs.row(0).video;
}

function getMixerEssence(vm: VM.Any, index: number) {
  const mixer = enforce_nonnull(vm.video_mixer);
  if (mixer.instances.row(index) == null) return null;
  return mixer.instances.row(index).output;
}

function getRtpVideoRxEssence(vm: VM.Any, index: number) {
  const rtp_receiver = enforce_nonnull(vm.r_t_p_receiver);
  if (rtp_receiver.video_receivers.row(index) == null) return null;
  return rtp_receiver.video_receivers.row(index).media_specific.output.video;
}

function getVideoSignalGeneratorEssence(vm: VM.Any, index: number) {
  const signal_generator = enforce_nonnull(vm.video_signal_generator);
  if (signal_generator.instances.row(index) == null) return null;
  return signal_generator.instances.row(index).output;
}

function getSdiOutputEssence(vm: VM.Any, index: number) {
  const i_o_module = enforce_nonnull(vm.i_o_module);
  if (i_o_module.input.row(index) == null) return null;
  return i_o_module.input.row(index).sdi.output.video;
}

export function parse_video_essence(
  essence: AT1130.Video.Essence | AT1101.Video.Essence | undefined | null,
): ESSENCE_ENTRY {
  if (essence == null) return { essenceType: 'N/A', essenceIndex: -1 };
  let kwl = essence.raw.kwl;
  let obj = kwl.match(/^(.*?)\.(.*)/);
  if (obj == null) return { essenceType: 'N/A', essenceIndex: -1 };
  let type = obj[1];
  let suffix = obj[2];
  if (type == null || suffix == null) return { essenceType: 'N/A', essenceIndex: -1 };
  // console.log('parseVideoEssence', type);
  switch (type) {
    case 'r_t_p_receiver':
      let rtpIndexString = suffix.match(/(\d+)/);
      if (rtpIndexString == null) return { essenceType: 'r_t_p_receiver', essenceIndex: -1 };
      return {
        essenceType: 'r_t_p_receiver',
        essenceIndex: parseInt(rtpIndexString[0] == null ? '-1' : rtpIndexString[0]),
      };
    //NOTE DEPRECATED REMOVE THIS
    case 'color_correction':
      const color_type_match = suffix.match(/^(cc1d|cc3d).*/);
      if (color_type_match == null) return { essenceType: 'color_correction', essenceIndex: -1 };

      const color_correction_type = color_type_match[1];
      if (color_correction_type == `cc1d`) {
        const cc1d_match = color_type_match[0].match(/cc1d\[(\d+)\]/);
        if (cc1d_match == null)
          return {
            essenceType: 'cc1d',
            essenceIndex: -1,
          };
        const cc1d_index = cc1d_match[1];
        if (cc1d_index == null) {
          return {
            essenceType: 'cc1d',
            essenceIndex: -1,
          };
        }

        return {
          essenceType: 'cc1d',
          essenceIndex: parseInt(cc1d_index),
        };
      }

      if (color_correction_type == `cc3d`) {
        const cc3d_match = color_type_match[0].match(/cc3d\[(\d+)\]/);
        if (cc3d_match == null)
          return {
            essenceType: 'cc3d',
            essenceIndex: -1,
          };
        const cc3d_index = cc3d_match[1];
        if (cc3d_index == null) {
          return {
            essenceType: 'cc3d',
            essenceIndex: -1,
          };
        }

        return {
          essenceType: 'cc3d',
          essenceIndex: parseInt(cc3d_index),
        };
      }

      let colorIndexString = suffix.match(/cc1d\[(\d+)\].output/);
      if (colorIndexString == null || colorIndexString[1] == null)
        return { essenceType: 'color_correction', essenceIndex: -1 };
      return {
        essenceType: 'color_correction',
        essenceIndex: parseInt(colorIndexString[0] == null ? '-1' : colorIndexString[1]),
      };
    case 'video_mixer':
      let videoMixerIndexString = suffix.match(/(\d+)/);
      if (videoMixerIndexString == null) return { essenceType: 'video_mixer', essenceIndex: -1 };
      return {
        essenceType: 'video_mixer',
        essenceIndex: parseInt(videoMixerIndexString[0] == null ? '-1' : videoMixerIndexString[0]),
      };
    case 'video_signal_generator':
      let signalGeneratorIndexString = suffix.match(/(\d+)/);
      if (signalGeneratorIndexString == null)
        return { essenceType: 'video_signal_generator', essenceIndex: -1 };
      return {
        essenceType: 'video_signal_generator',
        essenceIndex: parseInt(
          signalGeneratorIndexString[0] == null ? '-1' : signalGeneratorIndexString[0],
        ),
      };
    case 're_play':
      const re_play_type_match = suffix.match(/^video\.(delays|players).*/);
      if (re_play_type_match == null) {
        return {
          essenceType: 're_play',
          essenceIndex: -1,
        };
      }
      const re_play_type = re_play_type_match[1];
      if (re_play_type === `delays`) {
        const delays_match = re_play_type_match[0].match(/video\.delays\[(\d+)\]/);
        if (delays_match == null)
          return {
            essenceType: 're_play',
            essenceIndex: -1,
          };
        const delays_index = delays_match[1];
        if (delays_index == null) {
          return {
            essenceType: 're_play',
            essenceIndex: -1,
          };
        }

        return {
          essenceType: 'delay_player',
          essenceIndex: parseInt(delays_index),
        };
      }
      if (re_play_type === `players`) {
        const players_match = re_play_type_match[0].match(/video\.players\[(\d+)\]/);
        if (players_match == null)
          return {
            essenceType: 're_play',
            essenceIndex: -1,
          };
        const players_index = players_match[1];
        if (players_index == null) {
          return {
            essenceType: 're_play',
            essenceIndex: -1,
          };
        }

        return {
          essenceType: 'video_player',
          essenceIndex: parseInt(players_index),
        };
      }

      return {
        essenceType: 're_play',
        essenceIndex: -1,
      };
    case 'i_o_module': // NOTE this is for type sdi
      let sdiIndexString = suffix.match(/(\d+)/);
      if (sdiIndexString == null) return { essenceType: 'sdi', essenceIndex: -1 };
      return {
        essenceType: 'sdi',
        essenceIndex: parseInt(sdiIndexString[0] == null ? '-1' : sdiIndexString[0]),
      };
    default:
      // console.log(`Error: ${type} is not implemented inside parseVideoEssence!`);
      return { essenceType: 'N/A', essenceIndex: -1 };
  }
}
