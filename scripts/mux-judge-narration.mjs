// Local installed SAPI voice only. No external model, voice cloning, or network.
import { readFile, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';
const root = dirname(dirname(fileURLToPath(import.meta.url)));
const out = resolve(process.argv[2] ?? join(root, '..', 'HACK-001_VIDEO_REVIEW_2026-10-11'));
function run(command, args, capture = false) {
  const result = spawnSync(command, args, { cwd: out, windowsHide: true, encoding: 'utf8', stdio: capture ? 'pipe' : 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} exited ${result.status}: ${result.stderr ?? ''}`);
  return result.stdout;
}
run('powershell.exe', ['-NoProfile', '-File', join(root, 'scripts', 'synthesize-video-narration.ps1'), '-OutputDirectory', out]);
const scenes = JSON.parse(await readFile(join(out, 'narration.scenes.json'), 'utf8'));
const timings = scenes.map((scene, index) => {
  const probe = JSON.parse(run('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'json', `narration-${index}.wav`], true));
  const duration = Number(probe.format.duration);
  const window = scene.end - scene.start;
  if (!(duration > 0)) throw new Error('EMPTY_NARRATION');
  const speed = Math.max(1, duration / (window - 0.5));
  if (speed > 1.35) throw new Error(`NARRATION_TOO_LONG_SCENE_${index}`);
  return { index, duration, window, speed };
});
const inputs = timings.flatMap(({ index }) => ['-i', `narration-${index}.wav`]);
const segments = timings.map(({ index, window, speed }) => `[${index}:a]aresample=48000,atempo=${speed.toFixed(6)},asetpts=N/SR/TB,adelay=250,apad,atrim=end_sample=${window * 48000},asetpts=N/SR/TB[a${index}]`);
const concat = `${timings.map(({ index }) => `[a${index}]`).join('')}concat=n=${timings.length}:v=0:a=1[narration]`;
run('ffmpeg', ['-hide_banner', '-loglevel', 'warning', '-y', ...inputs, '-filter_complex', [...segments, concat].join(';'), '-map', '[narration]', '-c:a', 'pcm_s16le', 'narration.zh.wav']);
run('ffmpeg', ['-hide_banner', '-loglevel', 'warning', '-y', '-i', 'shanhai-92s-review-draft.mp4', '-i', 'narration.zh.wav', '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', '-metadata:s:a:0', 'language=zho', '-movflags', '+faststart', '-t', '92', 'shanhai-92s-zh-en-review.mp4']);
const probe = JSON.parse(run('ffprobe', ['-v', 'error', '-show_entries', 'format=duration,size:stream=codec_name,width,height,codec_type,duration', '-of', 'json', 'shanhai-92s-zh-en-review.mp4'], true));
const audio = probe.streams.find((stream) => stream.codec_type === 'audio');
const video = probe.streams.find((stream) => stream.codec_type === 'video');
if (!audio || video?.width !== 1920 || video?.height !== 1080 || Math.abs(Number(probe.format.duration) - 92) > 0.1 || Math.abs(Number(audio.duration) - 92) > 0.1) throw new Error('AUDIO_VIDEO_METADATA_MISMATCH');
const qa = { status: 'CHINESE_AUDIO_ENGLISH_SUBTITLES_REVIEW_DRAFT', voice: 'LOCAL_INSTALLED_GENERIC_SAPI_SYNTHESIS_NOT_FOUNDER_RECORDING', captions: 'BURNED_IN_ENGLISH', durationSeconds: Number(probe.format.duration), audioDurationSeconds: Number(audio.duration), width: video.width, height: video.height, audioCodec: audio.codec_name, bytes: Number(probe.format.size), timings, intelligibility: 'FOUNDER_REVIEW_PENDING', externalModelBehavior: 'NOT_MEASURED' };
await writeFile(join(out, 'audio-video-qa.json'), JSON.stringify(qa, null, 2));
console.log(JSON.stringify(qa, null, 2));
