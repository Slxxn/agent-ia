"""
Task Classifier — Routes each task to the right model tier.

CREATIVE  → deepseek-reasoner  — design systems, hero, animations, layout architecture
STANDARD  → deepseek-chat      — React components, routing, stores, pages, data
SIMPLE    → flash model        — configs, installs, bug fixes, formatting, exports
"""

import re
from typing import Literal

TaskComplexity = Literal["creative", "standard", "simple"]

# 2+ hits → creative
_CREATIVE_PATTERNS = [
    r'\bhero\b',
    r'\bdesign.?system\b',
    r'\btypograph',
    r'\bpalette\b',
    r'\bcolor.?scheme\b',
    r'\banimation\b',
    r'\bframer.?motion\b',
    r'\blayout\b',
    r'\bstorytellin',
    r'\bvisual\b',
    r'\bbento\b',
    r'\bglass(?:morphism)?\b',
    r'\bpremium\b',
    r'\bbrand(?:ing)?\b',
    r'\blanding.?page\b',
    r'\bUX\b',
    r'\baestheti',
    r'\bstyling\b',
    r'\bgradient\b',
    r'\bparallax\b',
    r'\bstagger\b',
    r'\bmicro.?interaction\b',
    r'\bcomposition\b',
    r'\bnarrative\b',
    r'\bscroll.?(?:anim|reveal|effect)',
    r'\bmotion\b',
    r'\bresponsive.?design\b',
    r'\btheme\b',
    r'\bglow\b',
    r'\bsection.?design\b',
    r'\bvisual.?hierarch',
    r'\bwhitespace\b',
    r'\bUI\b',
    r'\bbackdrop\b',
]

# 1 hit → simple
_SIMPLE_PATTERNS = [
    r'\bnpm\s+install\b',
    r'\btsconfig\b',
    r'\bvite\.config\b',
    r'\bpostcss\b',
    r'\bpackage\.json\b',
    r'\bfix\s+(?:a\s+)?bug\b',
    r'\bbug.?fix\b',
    r'\brefactor\b',
    r'\bformat(?:ting)?\b',
    r'\brename\b',
    r'\.env\b',
    r'\breadme\b',
    r'\bgitignore\b',
    r'\binstall.{0,30}dep(?:endanc)',
    r'\binstallation\s+des\s+d[ée]pendances\b',
    r'\badd.{0,25}export\b',
    r'\bimport.{0,20}fix\b',
    r'\btypo\b',
    r'\bcorrection\s+(?:de\s+)?(?:bug|import|typo|export)',
]


def classify_task(description: str) -> TaskComplexity:
    """
    Classify a task description into creative / standard / simple.

    simple  : any _SIMPLE_PATTERNS match
    creative: 2+ _CREATIVE_PATTERNS matches, or 1 match in a long description (>120 chars)
    standard: everything else
    """
    text = description.lower()

    for pattern in _SIMPLE_PATTERNS:
        if re.search(pattern, text, re.IGNORECASE):
            return "simple"

    creative_hits = sum(
        1 for p in _CREATIVE_PATTERNS
        if re.search(p, text, re.IGNORECASE)
    )
    if creative_hits >= 2:
        return "creative"
    if creative_hits == 1 and len(description) > 120:
        return "creative"

    return "standard"


# Model label for logging
COMPLEXITY_LABELS = {
    "creative": "DeepSeek Reasoner (creative)",
    "standard": "DeepSeek Chat (standard)",
    "simple":   "Flash (simple)",
}
