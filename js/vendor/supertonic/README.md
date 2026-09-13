# Supertonic browser helper

Source: https://github.com/supertone-oss-archive/supertonic/blob/main/web/helper.js
Retrieved 2026-09-13. MIT license included in LICENSE.txt.

Local changes: pinned browser ESM import of ONNX Runtime Web 1.23.2,
single-thread WebAssembly for compatibility without cross-origin isolation,
explicit fetch of ONNX files with HTTP status validation so the comparison
worker can cache model downloads. The original synthesis pipeline is retained.

Models are downloaded at runtime from the official archive, pinned revision
`aafc6e32416a594460b32413efc49d7fe4ce6d46` of
https://huggingface.co/supertone-oss-archive/supertonic-3 .
Model weights have their own OpenRAIL-M license and are not included here.

Piper uses @diffusionstudio/vits-web 1.0.3, as in the game, with Paola explicitly
registered and no replacement voice. Its OPFS cache is independent of
Supertonic's Cache Storage. No text is sent to an inference API.
