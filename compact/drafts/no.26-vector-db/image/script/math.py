# TeX 風の数式 PNG（matplotlib mathtext, fontset=cm）を作る。サイズ(in)を math/sizes.json に出す
import json, sys, matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
plt.rcParams["mathtext.fontset"] = "cm"
DPI = 600
items = {
 # name: (tex, pt, color)
 "cosdef": (r"$\cos\theta=\dfrac{\mathbf{a}\cdot\mathbf{b}}{\Vert\mathbf{a}\Vert\,\Vert\mathbf{b}\Vert}$", 20, "#1F2A44"),
 "range": (r"$-1\leq\cos\theta\leq 1$", 16, "#1F2A44"),
 "a_blue": (r"$\mathbf{a}$", 18, "#2F6FDB"),
 "b_teal": (r"$\mathbf{b}$", 18, "#138A7E"),
 "theta": (r"$\theta$", 18, "#E07B1A"),
 "theta_s": (r"$\theta$", 15, "#E07B1A"),
 "O": (r"$O$", 15, "#5F6368"),
 "cos1": (r"$\cos\theta=1$", 16, "#1F2A44"),
 "cos0": (r"$\cos\theta=0$", 16, "#1F2A44"),
 "cosm1": (r"$\cos\theta=-1$", 16, "#1F2A44"),
 "b2a": (r"$\mathbf{b}=2\mathbf{a}$", 16, "#138A7E"),
 "l2": (r"$\Vert\mathbf{a}-\mathbf{b}\Vert$", 16, "#C62828"),
 "cos1_l2": (r"$\cos\theta=1$", 15, "#1F2A44"),
 "l2big": (r"$\Vert\mathbf{a}-\mathbf{b}\Vert=\Vert\mathbf{a}\Vert>0$", 15, "#C62828"),
 "norm": (r"$\Vert\mathbf{a}-\mathbf{b}\Vert^{2}=2-2\cos\theta$", 16, "#1F2A44"),
 "unit": (r"$\Vert\mathbf{a}\Vert=\Vert\mathbf{b}\Vert=1$", 15, "#1F2A44"),
 "q_orange": (r"$\mathbf{q}$", 18, "#E07B1A"),
 "q_eq": (r"$\mathbf{q}$", 15, "#E07B1A"),
 "q_leg": (r"$\mathbf{q}$", 14, "#1F2A44"),
 "d1536": (r"$d=1536$", 14, "#5F6368"),
 "topk": (r"$k=3$", 14, "#E07B1A"),
}
sizes = {}
for name, (tex, pt, col) in items.items():
    fig = plt.figure(figsize=(0.01, 0.01))
    t = fig.text(0, 0, tex, fontsize=pt, color=col)
    fig.savefig(f"math/{name}.png", dpi=DPI, transparent=True, bbox_inches="tight", pad_inches=0.02)
    plt.close(fig)
    from PIL import Image
    w, h = Image.open(f"math/{name}.png").size
    sizes[name] = [w / DPI, h / DPI]
json.dump(sizes, open("math/sizes.json", "w"), indent=1)
print(sizes)
