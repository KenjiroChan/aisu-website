"""Cut one pose out of the sheet: transparent background, floating extras removed, upscaled."""
import sys, json, numpy as np
from PIL import Image
from scipy import ndimage as ndi
D='/tmp/claude-0/-home-claude/af5c3a5d-3681-5814-aa7b-f88523c0fb1e/scratchpad/parfi/'
src=np.asarray(Image.open('/mnt/user-data/attachments/af5c3a5d-3681-5814-aa7b-f88523c0fb1e/803edab8-image.png').convert('RGB')).astype(np.float32)
big=json.load(open(D+'big.json')); lab=np.load(D+'lab.npy')
def cut(k, scale=4):
    lid,(y0,y1,x0,x1)=big[k]; p=6
    y0,y1,x0,x1=max(0,y0-p),min(1024,y1+p),max(0,x0-p),min(1536,x1+p)
    a=src[y0:y1,x0:x1]
    # distance from the sheet's light-grey background
    dist=np.abs(a-247).sum(2)
    fg=dist>14
    # background = everything light connected to the crop border; enclosed light areas (cream fill) stay
    bgc=~fg; L,n=ndi.label(bgc)
    border=set(np.unique(np.concatenate([L[0],L[-1],L[:,0],L[:,-1]])))-{0}
    bg=np.isin(L,list(border))
    figure=~bg
    # keep only the figure itself (largest connected piece), dropping sparkles, notes and motion lines
    F,m=ndi.label(figure)
    if m>1:
        sizes=ndi.sum(figure,F,range(1,m+1)); figure=F==(1+int(np.argmax(sizes)))
    figure=ndi.binary_fill_holes(figure)
    # soft edge: alpha from distance to background on the outer rim only
    alpha=np.where(figure,1.0,0.0)
    rim=figure & ndi.binary_dilation(~figure,iterations=1)
    alpha[rim]=np.clip(dist[rim]/90.0,0.35,1.0)
    rgba=np.dstack([a,alpha*255]).clip(0,255).astype(np.uint8)
    im=Image.fromarray(rgba,'RGBA')
    bb=im.getbbox(); im=im.crop(bb)
    im=im.resize((im.width*scale,im.height*scale),Image.LANCZOS)
    return im
if __name__=='__main__':
    for k in map(int,sys.argv[1:]):
        im=cut(k); im.save(D+f'work/pose{k:02d}.png'); print(k, im.size)
