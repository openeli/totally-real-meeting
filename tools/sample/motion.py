import numpy as np, sys
FPS=30000/1001
def motion_flags(k, src0, n):
    """True for frames where the person walks, leans far or turns away: a webcam would lose them."""
    f0=int(round(src0*FPS)); idx=np.clip(np.arange(f0,f0+n),0,len(k)-1)
    nose=k[idx,0,:2].copy(); conf=k[idx,0,2]; sh=np.abs(k[idx,5,0]-k[idx,6,0])
    shm=np.median(sh[conf>0.5]) if (conf>0.5).any() else 300
    win=int(FPS*1.6); ker=np.ones(win)/win
    def sm(x): return np.convolve(np.pad(x,(win//2,win-1-win//2),mode='edge'),ker,mode='valid')
    cx=sm(nose[:,0]); cy=sm(nose[:,1])
    w=2.7*shm
    dev=np.hypot(nose[:,0]-cx, nose[:,1]-cy)/w            # face away from the framing
    speed=np.abs(np.gradient(cx))*FPS/w                      # framing sliding sideways (walking)
    drift=np.abs(cx-np.median(cx))/w                          # far from where they usually stand
    bad=(conf<0.4)|(dev>0.16)|(speed>0.22)|(drift>0.45)
    return bad
def spans(bad, offset, pad=0.8, join=3.0, minlen=1.5):
    out=[]; i=0; n=len(bad)
    while i<n:
        if bad[i]:
            j=i
            while j<n and bad[j]: j+=1
            out.append([offset+i/FPS-pad, offset+j/FPS+pad]); i=j
        else: i+=1
    m=[]
    for a,b in out:
        if m and a-m[-1][1]<join: m[-1][1]=max(m[-1][1],b)
        else: m.append([a,b])
    return [[round(max(offset,a),2),round(b,2)] for a,b in m if b-a>=minlen]
if __name__=='__main__':
    k=np.load(sys.argv[1]); src0=float(sys.argv[2]); dur=float(sys.argv[3])
    print(spans(motion_flags(k,src0,int(dur*FPS)),0))
