const gameboy = document.getElementById("gameboy");
const video = document.querySelector("video");
const canvas = document.querySelector("canvas");
const context = canvas.getContext("2d");
const w = canvas.width,
  h = canvas.height;

const bayer = [
  [0xf, 0x87, 0x2d, 0xa5],
  [0xc3, 0x4b, 0xe1, 0x69],
  [0x3c, 0xb4, 0x1e, 0x96],
  [0xf0, 0x78, 0xd2, 0x5a],
];

function draw() {
  context.drawImage(video, 0, 0, w, h);

  const imageData = context.getImageData(0, 0, w, h);
  const buff = new Uint32Array(imageData.data.buffer);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let i = y * w + x;
      let v = buff[i];
      let r = v & 0xff;
      let g = (v & 0xff00) >> 8;
      let b = (v & 0xff0000) >> 16;
      let c = r * 0.21 + g * 0.72 + b * 0.07;

      c = (c + bayer[x % 4][y % 4]) >> 1;
      c = c < 0x80 ? 0x33 : 0xff;

      buff[i] = 0xff000000 | (c << 16) | (c << 8) | c;
    }
  }

  context.putImageData(imageData, 0, 0);
  requestAnimationFrame(draw);
}

navigator.mediaDevices
  .getUserMedia({ video: { width: w, height: h } })
  .then((stream) => {
    try {
      video.srcObject = stream;
    } catch (error) {
      video.src = URL.createObjectURL(stream);
    }

    video.play();
    draw();
    gameboy.classList.toggle("on");
  });
