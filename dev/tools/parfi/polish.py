"""Polished cut-outs from the Real-ESRGAN 4x images (work/upNN.png):
a smooth figure mask, the blurry rim trimmed, one even dark outline drawn all the way round
(so no edge looks eaten), and optionally a cream die-cut sticker edge outside it."""
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as ndi
D='/tmp/claude-0/-home-claude/af5c3a5d-3681-5814-aa7b-f88523c0fb1e/scratchpad/parfi/'
BG=np.array([247,247,247],np.float32); CREAM=np.array([255,249,249],np.float32)
POSES={0:'wave-walk',1:'walk',4:'thumbsup',5:'shy',6:'run',8:'cool',9:'point',10:'tea',13:'curious',14:'cheer',15:'happy',
       17:'gift',18:'yay',20:'cloche',25:'cheeks',26:'logo',27:'wave',29:'pompom',30:'giggle'}
def disk(r):
    yy,xx=np.ogrid[-r:r+1,-r:r+1]; return (xx*xx+yy*yy)<=r*r
def smooth_mask(m, sigma):
    """binary mask -> anti-aliased alpha with rounded, jaggy-free edges"""
    f=ndi.gaussian_filter(m.astype(np.float32), sigma)
    return np.clip((f-0.5)*3.0+0.5,0,1)     # steepen the blur back into a crisp but smooth edge
def polish(k, sticker=False):
    a=np.asarray(Image.open(D+f'work/up{k:02d}.png').convert('RGB')).astype(np.float32)
    pad=60; a=np.pad(a,((pad,pad),(pad,pad),(0,0)),mode='edge')
    dist=np.sqrt(((a-BG)**2).sum(2))
    fg=dist>14
    L,_=ndi.label(~fg); border=set(np.unique(np.concatenate([L[0],L[-1],L[:,0],L[:,-1]])))-{0}
    M=~np.isin(L,list(border))
    F,m=ndi.label(M)
    if m>1:
        sizes=ndi.sum(M,F,range(1,m+1)); M=F==(1+int(np.argmax(sizes)))
    M=ndi.binary_fill_holes(M)
    M=ndi.binary_opening(M,structure=disk(2))           # drop stray specks along the edge
    # outline colour: the dark raspberry ink just inside the edge
    ring=M & ~ndi.binary_erosion(M,iterations=8)
    ink=a[ring][dist[ring]>np.percentile(dist[ring],75)]; O=np.median(ink,axis=0)
    H=M.shape[0]
    t=max(3,int(H*0.0045))                               # added outline thickness (~4 px at this size)
    body=smooth_mask(ndi.binary_erosion(M,structure=disk(2)),1.2)     # figure with its blurry rim trimmed
    stroke=smooth_mask(ndi.binary_dilation(M,structure=disk(t)),1.4)  # even dark outline all round
    rgb=a*body[...,None]+O*(1-body[...,None])                          # outline shows wherever the rim was trimmed
    alpha=stroke
    if sticker:
        r=max(6,int(H*0.028))
        cut=smooth_mask(ndi.binary_closing(ndi.binary_dilation(M,structure=disk(t+r)),structure=disk(r)),1.3)
        rgb=rgb*alpha[...,None]+CREAM*(1-alpha[...,None]); alpha=cut
    out=np.dstack([rgb.clip(0,255),alpha*255]).astype(np.uint8)
    im=Image.fromarray(out,'RGBA'); return im.crop(im.getbbox())
if __name__=='__main__':
    import sys
    for k,n in POSES.items():
        if len(sys.argv)>1 and n not in sys.argv[1:]: continue
        polish(k).save(D+f'out2/parfi-{n}.png'); polish(k,True).save(D+f'out2/parfi-{n}-sticker.png'); print(n)
