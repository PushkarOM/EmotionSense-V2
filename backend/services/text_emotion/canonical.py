import yaml
from pathlib import Path

_mapping = None

def get_goemotions_canonical_map() -> dict:
    global _mapping
    if _mapping is None:
        yaml_path = Path(__file__).parents[2] / "common" / "label_mapping.yaml"
        with open(yaml_path, "r") as f:
            data = yaml.safe_load(f)
        _mapping = data["goemotions"]
    return _mapping

def goemotions_to_canonical(native_label: str) -> str:
    mapping = get_goemotions_canonical_map()
    return mapping.get(native_label, "neutral")
