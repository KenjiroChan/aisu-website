# Parfi pipeline (work files, not part of the site)

`character-sheet.png` is the mascot sheet Kenjiro sent; `logo-original.png` is the bowtie Parfi he chose as the logo.
`big.json` holds the bounding boxes of each pose on the sheet. `make.py` crops a pose and upscales it 4x with
Real-ESRGAN (ncnn-vulkan build, model `realesrgan-x4plus-anime`, CPU Vulkan via `VK_ICD_FILENAMES=/usr/share/vulkan/icd.d/lvp_icd.json`
after `apt-get install mesa-vulkan-drivers`); `polish.py` turns the upscaled images into the final cut-outs (smooth mask,
blurry rim trimmed, one even outline, optional cream die-cut sticker edge) that live in `img/parfi/`. The scripts still
point at the old chat's scratch folder in their `D=` / `SHEET=` lines; change those paths before running them.
