"""
Génération vidéo automatique via HyperFrames (HTML → MP4).
Appelé quand le client ne fournit pas de vidéos dans son brief.
"""

import asyncio
import json
from pathlib import Path

from backend.tools.llm import LLMTool, GEMINI_MODEL


SECTOR_STYLES: dict[str, dict] = {
    "coiffeur": {
        "colors": ["#1a1a2e", "#e94560", "#f5f5f5"],
        "font": "Playfair Display",
        "mood": "élégant, moderne, premium",
    },
    "restaurant": {
        "colors": ["#2c1810", "#d4a853", "#f9f6f0"],
        "font": "Cormorant Garamond",
        "mood": "chaleureux, gastronomique, raffiné",
    },
    "artisan": {
        "colors": ["#2d3436", "#fdcb6e", "#dfe6e9"],
        "font": "Montserrat",
        "mood": "authentique, savoir-faire, local",
    },
    "medecin": {
        "colors": ["#0984e3", "#00cec9", "#f8f9fa"],
        "font": "Inter",
        "mood": "confiance, professionnel, rassurant",
    },
    "immobilier": {
        "colors": ["#2d3436", "#6c5ce7", "#ffffff"],
        "font": "Raleway",
        "mood": "premium, moderne, aspirationnel",
    },
    "default": {
        "colors": ["#2d3436", "#0984e3", "#f8f9fa"],
        "font": "Inter",
        "mood": "professionnel, moderne, dynamique",
    },
}

_ANIMATION_CSS: dict[str, str] = {
    "typewriter": """
        @keyframes typewriter { from { width: 0; } to { width: 100%; } }
        @keyframes blink { 50% { border-color: transparent; } }
        .title { overflow: hidden; white-space: nowrap; border-right: 3px solid {accent};
                 animation: typewriter 2s steps(40) 0.5s forwards, blink 0.7s step-end infinite; width: 0; }
    """,
    "slide-up": """
        @keyframes slideUp { from { transform: translateY(60px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .title { animation: slideUp 1s cubic-bezier(0.22,1,0.36,1) 0.3s both; }
        .subtitle { animation: slideUp 1s cubic-bezier(0.22,1,0.36,1) 0.6s both; }
    """,
    "reveal": """
        @keyframes reveal { from { clip-path: inset(0 100% 0 0); } to { clip-path: inset(0 0% 0 0); } }
        .title { animation: reveal 1.2s cubic-bezier(0.77,0,0.175,1) 0.2s both; }
        .subtitle { animation: reveal 1s cubic-bezier(0.77,0,0.175,1) 0.8s both; }
    """,
    "stagger": """
        @keyframes fadeSlide { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
        .item { opacity: 0; animation: fadeSlide 0.6s ease forwards; }
        .item:nth-child(1) { animation-delay: 0.2s; }
        .item:nth-child(2) { animation-delay: 0.5s; }
        .item:nth-child(3) { animation-delay: 0.8s; }
        .item:nth-child(4) { animation-delay: 1.1s; }
    """,
    "fade-in": """
        @keyframes fadeIn { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .title { animation: fadeIn 1s ease 0.3s both; }
        .subtitle { animation: fadeIn 1s ease 0.7s both; }
        .accent-line { animation: fadeIn 0.8s ease 0.1s both; }
    """,
}


async def _analyze_brief(brief: str, sector: str, style: str) -> dict:
    llm = LLMTool()
    sector_style = SECTOR_STYLES.get(sector.lower(), SECTOR_STYLES["default"])

    prompt = f"""Tu es expert en vidéo marketing pour sites web.
Analyse ce brief et génère les spécifications pour 2 vidéos HyperFrames.

BRIEF : {brief}
SECTEUR : {sector}
STYLE : {style}
PALETTE : {sector_style['colors']}
FONT : {sector_style['font']}
AMBIANCE : {sector_style['mood']}

Réponds UNIQUEMENT avec ce JSON :
{{
  "videos": [
    {{
      "id": "hero",
      "section": "Hero",
      "duration": 8,
      "font": "{sector_style['font']}",
      "title_text": "texte principal ou accroche",
      "subtitle_text": "sous-titre ou tagline",
      "colors": {{"background": "#hex", "primary": "#hex", "accent": "#hex", "text": "#hex"}},
      "animation_style": "fade-in",
      "items": []
    }},
    {{
      "id": "features",
      "section": "Services",
      "duration": 6,
      "font": "{sector_style['font']}",
      "title_text": "Nos services",
      "subtitle_text": "",
      "colors": {{"background": "#hex", "primary": "#hex", "accent": "#hex", "text": "#hex"}},
      "animation_style": "stagger",
      "items": ["service1", "service2", "service3"]
    }}
  ]
}}"""

    result = await llm.generate_code(
        task_description=prompt,
        context="",
        model_override=GEMINI_MODEL,
    )
    raw = result.get("content", "").strip()
    if raw.startswith("```"):
        parts = raw.split("```")
        raw = parts[1].lstrip("json").strip() if len(parts) > 1 else raw
    return json.loads(raw)


def _build_html(spec: dict) -> str:
    colors = spec["colors"]
    anim = spec.get("animation_style", "fade-in")
    anim_css = _ANIMATION_CSS.get(anim, _ANIMATION_CSS["fade-in"])
    anim_css = anim_css.replace("{accent}", colors.get("accent", "#0984e3"))

    items = spec.get("items", [])
    items_html = ""
    if items:
        items_html = '<div class="items">' + "".join(
            f'<div class="item"><span class="bullet">→</span> {item}</div>'
            for item in items[:4]
        ) + "</div>"

    subtitle = spec.get("subtitle_text", "")
    return f"""<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family={spec.get('font','Inter')}:wght@300;400;700&display=swap" rel="stylesheet">
<style>
  * {{ margin: 0; padding: 0; box-sizing: border-box; }}
  body {{
    width: 1920px; height: 1080px; overflow: hidden;
    background: {colors['background']};
    font-family: '{spec.get("font","Inter")}', sans-serif;
    color: {colors['text']};
    display: flex; align-items: center; justify-content: center;
  }}
  .container {{
    width: 100%; height: 100%;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 80px; position: relative;
  }}
  .accent-line {{ width: 80px; height: 4px; background: {colors['accent']}; margin-bottom: 40px; border-radius: 2px; }}
  .title {{ font-size: 96px; font-weight: 700; text-align: center; line-height: 1.1; margin-bottom: 32px; letter-spacing: -2px; }}
  .subtitle {{ font-size: 36px; font-weight: 300; color: {colors['primary']}; text-align: center; opacity: 0.85; max-width: 900px; line-height: 1.4; }}
  .items {{ display: flex; flex-direction: column; gap: 28px; margin-top: 48px; width: 100%; max-width: 800px; }}
  .item {{ font-size: 42px; font-weight: 400; display: flex; align-items: center; gap: 20px; }}
  .bullet {{ color: {colors['accent']}; font-size: 36px; }}
  .bg-shape {{ position: absolute; width: 600px; height: 600px; border-radius: 50%; background: {colors['primary']}; opacity: 0.06; right: -100px; top: -100px; }}
  .bg-shape-2 {{ position: absolute; width: 400px; height: 400px; border-radius: 50%; background: {colors['accent']}; opacity: 0.04; left: -80px; bottom: -80px; }}
  {anim_css}
</style>
</head>
<body>
<div id="stage"
  data-composition-id="{spec['id']}"
  data-start="0"
  data-width="1920"
  data-height="1080"
  data-duration="{spec.get('duration', 8)}">
  <div class="container">
    <div class="bg-shape"></div>
    <div class="bg-shape-2"></div>
    <div class="accent-line"></div>
    <h1 class="title">{spec.get('title_text', '')}</h1>
    {f'<p class="subtitle">{subtitle}</p>' if subtitle else ''}
    {items_html}
  </div>
</div>
</body>
</html>"""


async def _render(html_path: str, mp4_path: str, duration: int) -> bool:
    try:
        proc = await asyncio.create_subprocess_exec(
            "npx", "hyperframes", "render",
            html_path,
            "--output", mp4_path,
            "--duration", str(duration),
            "--fps", "30",
            "--width", "1920",
            "--height", "1080",
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        _, stderr = await proc.communicate()
        if proc.returncode != 0:
            print(f"[VideoGen] render error: {stderr.decode()[:200]}")
            return False
        return True
    except Exception as e:
        print(f"[VideoGen] exception: {e}")
        return False


async def generate_videos_for_project(
    project_id: str,
    brief: str,
    sector: str,
    style: str,
    workspace_path: str,
) -> dict[str, str]:
    """Génère hero.mp4 + features.mp4 dans public/videos/. Retourne les chemins relatifs."""
    videos_dir = Path(workspace_path) / "public" / "videos"
    videos_dir.mkdir(parents=True, exist_ok=True)
    temp_dir = Path(workspace_path) / ".hyperframes_temp"
    temp_dir.mkdir(parents=True, exist_ok=True)

    try:
        specs = await _analyze_brief(brief, sector, style)
    except Exception as e:
        print(f"[VideoGen] brief analysis failed: {e}")
        return {}

    generated: dict[str, str] = {}
    for video_spec in specs.get("videos", []):
        vid_id = video_spec["id"]
        duration = video_spec.get("duration", 8)
        comp_dir = temp_dir / vid_id
        comp_dir.mkdir(parents=True, exist_ok=True)
        mp4_path = str(videos_dir / f"{vid_id}.mp4")

        (comp_dir / "index.html").write_text(_build_html(video_spec), encoding="utf-8")
        if await _render(str(comp_dir), mp4_path, duration):
            generated[vid_id] = f"/videos/{vid_id}.mp4"

    return generated
