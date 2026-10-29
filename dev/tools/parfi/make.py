"""Pose pipeline: crop from the sheet on its grey background, upscale 4x with Real-ESRGAN (anime model),
then cut the background out of the upscaled image so edges stay clean on any colour."""
import sys, json, subprocess, os, numpy as np
from PIL import Image
from scipy import ndimage as ndi
D='/tmp/claude-0/-home-claude/af5c3a5d-3681-5814-aa7b-f88523c0fb1e/scratchpad/parfi/'
ESR='/home/claude/esr/x/realesrgan-ncnn-vulkan'
SHEET=Image.open('/mnt/user-data/attachments/af5c3a5d-3681-5814-aa7b-f88523c0fb1e/803edab8-image.png').convert('RGB')
big=json.load(open(D+'big.json'))
BG=np.array([247,247,247],np.float32)
os.makedirs(D+'out',exist_ok=True)
def upscale(img, path_in, path_out):
    img.save(path_in)
    env=dict(os.environ, VK_ICD_FILENAMES='/usr/share/vulkan/icd.d/lvp_icd.json')
    subprocess.run([ESR,'-i',path_in,'-o',path_out,'-n','realesrgan-x4plus-anime','-g','0'],check=True,capture_output=True,env=env)
    return Image.open(path_out).convert('RGB')
def cutout(rgb):
    a=np.asarray(rgb).astype(np.float32)
    dist=np.sqrt(((a-BG)**2).sum(2))
    fg=dist>22
    L,n=ndi.label(~fg)
    border=set(np.unique(np.concatenate([L[0],L[-1],L[:,0],L[:,-1]])))-{0}
    figure=~np.isin(L,list(border))
    F,m=ndi.label(figure)
    if m>1:
        sizes=ndi.sum(figure,F,range(1,m+1)); figure=F==(1+int(np.argmax(sizes)))
    figure=ndi.binary_fill_holes(figure)
    # outline colour: the dark raspberry ink just inside the edge
    inner=figure & ~ndi.binary_erosion(figure,iterations=6)
    ink=a[inner][dist[inner]>np.percentile(dist[inner],70)]
    outline=np.median(ink,axis=0)
    full=np.sqrt(((outline-BG)**2).sum())
    # anti-aliased rim: alpha from how far a pixel is from the background towards the outline colour,
    # and its colour replaced by the outline colour so no grey or white fringe remains
    band=ndi.binary_dilation(figure,iterations=2) & ~ndi.binary_erosion(figure,iterations=3)
    alpha=figure.astype(np.float32)
    al=np.clip(dist/full,0,1)
    alpha[band]=al[band]
    out=a.copy()
    out[band]=outline
    rgba=np.dstack([out,alpha*255]).clip(0,255).astype(np.uint8)
    im=Image.fromarray(rgba,'RGBA'); return im.crop(im.getbbox())
def make(k, name):
    lid,(y0,y1,x0,x1)=big[k]; p=10
    crop=SHEET.crop((max(0,x0-p),max(0,y0-p),min(1536,x1+p),min(1024,y1+p)))
    # remove other figures' bits and floating extras before upscaling: paint everything not this figure grey
    up=upscale(crop, D+f'work/in{k:02d}.png', D+f'work/up{k:02d}.png')
    im=cutout(up)
    im.save(D+f'out/{name}.png')
    return im
if __name__=='__main__':
    for arg in sys.argv[1:]:
        k,name=arg.split(':'); im=make(int(k),name); print(name, im.size)
