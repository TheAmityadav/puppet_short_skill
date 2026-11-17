import sys
from PIL import Image, ImageDraw
out, files = sys.argv[1], sys.argv[2:]
ims = [Image.open(f) for f in files]
w, h = ims[0].size; cols = 4; rows = (len(ims) + cols - 1) // cols
S = Image.new("RGB", (w * cols, h * rows), "white")
for i, (f, im) in enumerate(zip(files, ims)):
    S.paste(im, ((i % cols) * w, (i // cols) * h)); ImageDraw.Draw(S).text(((i % cols) * w + 8, (i // cols) * h + 8), f.split("_")[-1], fill="yellow")
S.save(out, quality=85)
