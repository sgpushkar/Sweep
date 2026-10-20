import math
from PIL import Image, ImageDraw, ImageFilter

def create_sweep_icon(size=1024, is_round=False):
    # Supersampling 2x
    scale = 2
    dim = size * scale
    img = Image.new("RGBA", (dim, dim), (0, 0, 0, 0))
    
    # Base canvas
    base = Image.new("RGBA", (dim, dim), (0, 0, 0, 0))
    draw_base = ImageDraw.Draw(base)
    
    # 1. Background Shape
    margin = int(dim * 0.04)
    if is_round:
        draw_base.ellipse([margin, margin, dim - margin, dim - margin], fill=(11, 12, 15, 255))
    else:
        radius = int(dim * 0.22)
        draw_base.rounded_rectangle([margin, margin, dim - margin, dim - margin], radius=radius, fill=(11, 12, 15, 255))
    
    # Add subtle dark gradient overlay
    overlay = Image.new("RGBA", (dim, dim), (0, 0, 0, 0))
    draw_overlay = ImageDraw.Draw(overlay)
    for y in range(dim):
        factor = y / dim
        alpha = int(40 * (1 - factor)) # Subtle top specular highlight
        draw_overlay.line([(0, y), (dim, y)], fill=(255, 255, 255, alpha))
    
    # Clip overlay to base shape
    base = Image.alpha_composite(base, Image.composite(overlay, Image.new("RGBA", (dim, dim), (0, 0, 0, 0)), base))
    
    # 2. Border rim highlight
    rim = Image.new("RGBA", (dim, dim), (0, 0, 0, 0))
    draw_rim = ImageDraw.Draw(rim)
    border_width = int(dim * 0.015)
    if is_round:
        draw_rim.ellipse([margin, margin, dim - margin, dim - margin], outline=(255, 255, 255, 32), width=border_width)
    else:
        radius = int(dim * 0.22)
        draw_rim.rounded_rectangle([margin, margin, dim - margin, dim - margin], radius=radius, outline=(255, 255, 255, 32), width=border_width)
    base = Image.alpha_composite(base, rim)

    # 3. Diagonal Glow & Slash
    # Slash coordinates from ~ (30%, 70%) to ~ (70%, 30%)
    p1 = (int(dim * 0.31), int(dim * 0.69))
    p2 = (int(dim * 0.69), int(dim * 0.31))
    stroke_w = int(dim * 0.125)
    
    # Glow layer 1 (wide ambient glow)
    glow1 = Image.new("RGBA", (dim, dim), (0, 0, 0, 0))
    d_glow1 = ImageDraw.Draw(glow1)
    d_glow1.line([p1, p2], fill=(255, 255, 255, 90), width=int(stroke_w * 2.2))
    d_glow1.ellipse([p1[0]-stroke_w, p1[1]-stroke_w, p1[0]+stroke_w, p1[1]+stroke_w], fill=(255, 255, 255, 90))
    d_glow1.ellipse([p2[0]-stroke_w, p2[1]-stroke_w, p2[0]+stroke_w, p2[1]+stroke_w], fill=(255, 255, 255, 90))
    glow1 = glow1.filter(ImageFilter.GaussianBlur(int(dim * 0.09)))
    
    # Glow layer 2 (tight intense core aura)
    glow2 = Image.new("RGBA", (dim, dim), (0, 0, 0, 0))
    d_glow2 = ImageDraw.Draw(glow2)
    d_glow2.line([p1, p2], fill=(255, 255, 255, 160), width=int(stroke_w * 1.4))
    d_glow2.ellipse([p1[0]-int(stroke_w*0.7), p1[1]-int(stroke_w*0.7), p1[0]+int(stroke_w*0.7), p1[1]+int(stroke_w*0.7)], fill=(255, 255, 255, 160))
    d_glow2.ellipse([p2[0]-int(stroke_w*0.7), p2[1]-int(stroke_w*0.7), p2[0]+int(stroke_w*0.7), p2[1]+int(stroke_w*0.7)], fill=(255, 255, 255, 160))
    glow2 = glow2.filter(ImageFilter.GaussianBlur(int(dim * 0.035)))
    
    # Solid Core Slash
    core = Image.new("RGBA", (dim, dim), (0, 0, 0, 0))
    d_core = ImageDraw.Draw(core)
    r_cap = stroke_w // 2
    d_core.line([p1, p2], fill=(255, 255, 255, 255), width=stroke_w)
    d_core.ellipse([p1[0]-r_cap, p1[1]-r_cap, p1[0]+r_cap, p1[1]+r_cap], fill=(255, 255, 255, 255))
    d_core.ellipse([p2[0]-r_cap, p2[1]-r_cap, p2[0]+r_cap, p2[1]+r_cap], fill=(255, 255, 255, 255))

    # Inner Core Brightness (slight 3D specular crest down the center)
    inner = Image.new("RGBA", (dim, dim), (0, 0, 0, 0))
    d_inner = ImageDraw.Draw(inner)
    inner_w = int(stroke_w * 0.45)
    ir_cap = inner_w // 2
    d_inner.line([p1, p2], fill=(255, 255, 255, 220), width=inner_w)
    d_inner.ellipse([p1[0]-ir_cap, p1[1]-ir_cap, p1[0]+ir_cap, p1[1]+ir_cap], fill=(255, 255, 255, 220))
    d_inner.ellipse([p2[0]-ir_cap, p2[1]-ir_cap, p2[0]+ir_cap, p2[1]+ir_cap], fill=(255, 255, 255, 220))
    inner = inner.filter(ImageFilter.GaussianBlur(int(dim * 0.005)))

    # Composite everything together
    composite = Image.alpha_composite(base, glow1)
    composite = Image.alpha_composite(composite, glow2)
    composite = Image.alpha_composite(composite, core)
    composite = Image.alpha_composite(composite, inner)
    
    # Downsample with Lanczos high quality filter
    final_img = composite.resize((size, size), Image.Resampling.LANCZOS)
    return final_img

def main():
    sizes = {
        "mipmap-mdpi": 48,
        "mipmap-hdpi": 72,
        "mipmap-xhdpi": 96,
        "mipmap-xxhdpi": 144,
        "mipmap-xxxhdpi": 192,
    }
    
    # 1. Android icons
    res_base = "android-app/android/app/src/main/res"
    for folder, sz in sizes.items():
        sq = create_sweep_icon(sz, is_round=False)
        sq.save(f"{res_base}/{folder}/ic_launcher.png", "PNG")
        
        rd = create_sweep_icon(sz, is_round=True)
        rd.save(f"{res_base}/{folder}/ic_launcher_round.png", "PNG")
        print(f"Generated {folder}: {sz}x{sz}")
        
    # 2. Public web assets
    fav512 = create_sweep_icon(512, is_round=False)
    fav512.save("public/icon-512.png", "PNG")
    fav512.save("public/apple-touch-icon.png", "PNG")
    
    fav192 = create_sweep_icon(192, is_round=False)
    fav192.save("public/favicon.png", "PNG")
    fav192.save("public/icon-192.png", "PNG")
    
    fav_rd = create_sweep_icon(192, is_round=True)
    fav_rd.save("public/favicon-round.png", "PNG")
    
    fav32 = create_sweep_icon(32, is_round=False)
    fav32.save("public/favicon-32x32.png", "PNG")
    fav16 = create_sweep_icon(16, is_round=False)
    fav16.save("public/favicon-16x16.png", "PNG")
    print("Web assets generated successfully!")

if __name__ == "__main__":
    main()
